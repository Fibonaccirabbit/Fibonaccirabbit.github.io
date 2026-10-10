import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { chromium } from 'playwright'

const origin = (process.env.SITE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const includeDrafts = process.env.VERIFY_DRAFTS !== 'false'
const day1 = matter(readFileSync('content/articles/agent-os-day1.md', 'utf8')).data
const verifyDay1 = includeDrafts || day1.draft !== true
const paths = ['/', '/publications', '/projects', '/experience', '/articles']
if (verifyDay1) paths.push('/articles/agent-os-day1')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const context = await browser.newContext({ locale: 'zh-CN' })
const page = await context.newPage()
const errors = []
const papers = readdirSync('content/publications').filter(name => name.endsWith('.md'))
  .map(name => matter(readFileSync(`content/publications/${name}`, 'utf8')).data)
page.on('pageerror', error => errors.push(error.message))

try {
  await page.goto(origin)
  await page.getByRole('button', { name: 'Switch language' }).waitFor()
  assert.ok((await page.locator('body').innerText()).includes("I am a master's student"), 'A Chinese browser must start in English')
  await page.evaluate(() => {
    localStorage.removeItem('termhubLanguage')
    localStorage.setItem('i18nextLng', 'zh')
  })
  await page.reload()
  await page.getByRole('button', { name: 'Switch language' }).waitFor()
  assert.equal(await page.evaluate(() => localStorage.getItem('termhubLanguage')), 'en', 'Legacy automatic language cache must not override the English default')
  await page.getByRole('button', { name: 'Switch language' }).click()
  await page.getByRole('button', { name: '切换语言' }).waitFor()
  await page.reload()
  await page.getByRole('button', { name: '切换语言' }).waitFor()
  assert.equal(await page.evaluate(() => localStorage.getItem('termhubLanguage')), 'zh', 'A manual language choice must persist across reloads')

  for (const language of ['zh', 'en']) {
    await page.goto(origin)
    await page.evaluate(language => localStorage.setItem('termhubLanguage', language), language)
    for (const width of [320, 375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 })
      for (const path of paths) {
        const response = await page.goto(`${origin}${path}`)
        assert.equal(response.status(), 200)
        await page.waitForSelector('nav')
        await page.waitForTimeout(250)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${language} ${path} overflows at ${width}px`)
        const missingImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src))
        assert.deepEqual(missingImages, [], `${path} has missing images`)
        const clippedControls = await page.locator('input,select').evaluateAll(controls => controls.filter(control => {
          const rect = control.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > innerWidth + 1)
        }).map(control => control.outerHTML.slice(0, 100)))
        assert.deepEqual(clippedControls, [], `${language} ${path} clips a control at ${width}px`)
        const overlappingNavItems = await page.locator('nav a, nav button').evaluateAll(elements => {
          const rects = elements.map(element => ({ label: element.getAttribute('aria-label') || element.textContent, rect: element.getBoundingClientRect() }))
            .filter(item => item.rect.width > 0 && item.rect.height > 0)
          const overlaps = []
          for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i].rect, b = rects[j].rect
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1)
              overlaps.push([rects[i].label, rects[j].label])
          }
          return overlaps
        })
        assert.deepEqual(overlappingNavItems, [], `${language} navigation overlaps at ${width}px`)
        const text = await page.locator('body').innerText()
        assert.equal(/Cookie|Dr\. Warm Lap|CozyCon/.test(text), false, 'Sample profile data must be removed')
        if (path === '/') {
          assert.equal(await page.locator('video').count(), 0, 'The robot recording belongs in the blog only')
          assert.ok(text.includes(language === 'zh' ? '我是深圳大学' : "I am a master's student"), `The ${language} bio must load at ${width}px`)
          assert.ok(await page.locator('a[href*="scholar.google.com/citations?user=4PaJ4SkAAAAJ"]').count() > 0)
        }
        if (path === '/publications') {
          assert.equal(await page.locator('[data-publication-id]').count(), 7)
          assert.equal(await page.locator('[data-publication-id]').first().getAttribute('data-publication-id'), 'mapf-world-ral-2026')
          for (const paper of papers) {
            const row = page.locator(`[data-publication-id="${paper.id}"]`)
            for (const href of Object.values(paper.links)) {
              const match = row.locator(`a[href=${JSON.stringify(href)}]`).first()
              assert.equal(await match.isVisible(), true, `${language} ${paper.id} resource is missing at ${width}px: ${href}`)
            }
          }
          assert.ok((await page.locator('[data-publication-id="envpilot-tosem-2026"]').innerText()).toLowerCase().includes(language === 'zh' ? '已接收' : 'accepted'))
        }
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`${origin}/publications`)
  await page.getByRole('combobox', { name: 'Filter publication year' }).selectOption('2024')
  assert.equal(await page.locator('[data-publication-id]').count(), 1)
  assert.equal(await page.locator('[data-publication-id]').first().getAttribute('data-publication-id'), 'hsru-ispp-2024')
  await page.getByRole('combobox', { name: 'Filter publication year' }).selectOption('all')
  await page.getByRole('combobox', { name: 'Filter publication venue' }).selectOption('journal')
  assert.equal(await page.locator('[data-publication-id]').count(), 3)
  await page.getByRole('combobox', { name: 'Filter publication venue' }).selectOption('all')
  await page.getByRole('textbox', { name: 'Search publications' }).fill('MCGA')
  assert.equal(await page.locator('[data-publication-id]').count(), 1)
  await page.getByRole('button', { name: /^Show details:/ }).press('Enter')
  await page.getByRole('button', { name: /^Hide details:/ }).waitFor()
  assert.equal(await page.getByRole('link', { name: 'Google Scholar', exact: true }).last().isVisible(), true)
  await page.goto(origin)
  await page.getByRole('button', { name: 'Switch language' }).click()
  await page.getByRole('button', { name: '切换语言' }).waitFor()
  assert.ok((await page.locator('body').innerText()).includes('杨湛江'))
  await page.getByRole('button', { name: '切换语言' }).click()
  await page.getByRole('button', { name: 'Switch language' }).waitFor()
  const beforeTheme = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.getByRole('button', { name: 'Toggle color mode' }).click()
  await page.waitForFunction(previous => document.documentElement.dataset.theme !== previous, beforeTheme)
  await page.getByRole('button', { name: 'Toggle color mode' }).click()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.getByRole('dialog').getByRole('link', { name: 'Blog', exact: true }).click()
  await page.waitForURL('**/articles')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  const search = page.getByRole('textbox', { name: 'Search blog' })
  await search.fill('not-a-real-note-38475')
  await page.getByText('grep: no matches found').waitFor()
  await search.fill('')

  if (verifyDay1) {
    await page.getByRole('button', { name: 'Show summary' }).click()
    await page.getByRole('link', { name: 'Read post', exact: true }).click()
    await page.waitForURL('**/articles/agent-os-day1')
    await page.locator('.article-prose').waitFor()
    await page.locator('.article-mobile-toc summary').click()
    assert.equal(await page.locator('.article-mobile-toc a').first().isVisible(), true)
    await page.locator('.article-mobile-toc a').last().click()
    assert.ok(new URL(page.url()).hash.startsWith('#section-'))
    await page.reload()
    await page.locator('video').waitFor()
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2)
    const videoInfo = await page.locator('video').evaluate(video => ({ src: video.currentSrc, width: video.videoWidth, height: video.videoHeight }))
    assert.ok(videoInfo.src.endsWith('/media/agent-os-day1-workstation.mp4'), 'Day 1 must use the newly supplied full recording')
    assert.deepEqual([videoInfo.width, videoInfo.height], [3024, 1496], 'The recording must not be cropped')
    await page.locator('video').evaluate(video => video.play())
    await page.waitForFunction(() => document.querySelector('video').currentTime > 0.5)
    await page.locator('video').evaluate(video => video.pause())
  }
  await page.goto(`${origin}/articles/no-such-post`)
  await page.getByText('Post not found', { exact: true }).waitFor()
  assert.deepEqual(errors, [], 'No browser runtime errors are allowed')
  console.log(`Passed: English default, legacy-cache migration, saved language choice, ${paths.length} routes, 2 languages, 5 widths, 7 paper resource links, publication filters, keyboard expansion, controls, themes, navigation, search${verifyDay1 ? ', article reading, and full-recording playback' : ''}.`)
} finally {
  await browser.close()
}
