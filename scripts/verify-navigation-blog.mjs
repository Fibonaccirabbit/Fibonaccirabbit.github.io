import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import matter from 'gray-matter'
import { chromium } from 'playwright'

const origin = (process.env.SITE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const slug = 'wnm3d-navigation-failures'
const directory = `/media/${slug}/full/`
const manifest = JSON.parse(readFileSync('scripts/fixtures/wnm3d-detail-coverage.json', 'utf8'))
const hash = value => createHash('sha256').update(value).digest('hex')
const normalize = text => text.replace(/\s+/g, '')
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []
const leaf = 'p,td,th,blockquote,h1,h2,h3,h4,h5,summary,figcaption,li'

async function openDetails(locator) {
  await locator.evaluate(element => {
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true
    }
  })
}

async function playVideo(video, asset) {
  await openDetails(video)
  await video.scrollIntoViewIfNeeded()
  const info = await video.evaluate(async video => {
    video.muted = true
    video.load()
    await Promise.race([
      video.play(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Video playback timed out')), 15000)),
    ])
    return { width: video.videoWidth, height: video.videoHeight, duration: video.duration }
  })
  assert.deepEqual([info.width, info.height], [asset.width, asset.height], asset.url)
  assert.ok(Math.abs(info.duration - asset.duration) < 0.15, asset.url)
  await video.page().waitForFunction(url => {
    const video = [...document.querySelectorAll('.wnm3d-report video')].find(video => video.currentSrc.split('#')[0].endsWith(url))
    return video && video.currentTime > 0.15
  }, asset.url)
  const visible = await video.evaluate(video => {
    video.pause()
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    for (let i = 0; i < pixels.length; i += 4) if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) > 40) ink++
    return ink / (canvas.width * canvas.height)
  })
  assert.ok(visible > 0.05, `${asset.url}: a decoded video frame must not be blank`)
  const bounds = await video.boundingBox()
  assert.ok(Math.abs(bounds.width / bounds.height - asset.width / asset.height) < 0.03, asset.url)
}

try {
  for (const asset of manifest.assets) {
    const bytes = readFileSync(`public${asset.url}`)
    assert.equal(bytes.length, asset.bytes, asset.url)
    assert.equal(hash(bytes), asset.sha256, `${asset.url}: retain original media bytes`)
  }
  const files = readdirSync(`public${directory}`, { recursive: true }).filter(name => /\.[^/]+$/.test(name))
  assert.ok(files.every(name => /\.(png|jpe?g|svg|mp4|gif|pdf)$/i.test(name)), 'Raw logs and audit files must stay local')
  assert.equal(manifest.originalSourceBlocks.length, 855, 'Retain the complete previously published source and paired supplement')
  for (const block of manifest.originalSourceBlocks) assert.ok(manifest.sourceBlocks.includes(block))
  assert.equal(manifest.sourceBlocks.length, 1067)
  assert.equal(manifest.videos.length, 50)
  assert.equal(new Set(manifest.videos).size, 48)
  assert.equal(manifest.images.length, 55)
  assert.deepEqual(manifest.geometry.referenceRows, [
    ['T 型三分支', 648, 405, '62.50%'],
    ['十字型四分支', 254, 178, '70.08%'],
    ['Y 型三分支', 83, 51, '61.45%'],
    ['两侧受限窄通行带', 4166, 2196, '52.71%'],
    ['全部任务', 5000, 2598, '51.96%'],
  ])
  assert.deepEqual(manifest.geometry.contextRows, [
    ['T 型三分支', 245, 67, 61, 62, 13, 42],
    ['十字型四分支', 111, 44, 26, 22, 2, 17],
    ['Y 型三分支', 24, 11, 4, 5, 1, 3],
    ['合计', 380, 122, 91, 89, 16, 62],
  ])

  for (const language of ['zh', 'en']) {
    const root = language === 'zh' ? 'content/zh' : 'content'
    const { data, content } = matter(readFileSync(`${root}/articles/${slug}.md`, 'utf8'))
    assert.equal(data.slug, slug)
    assert.equal(data.draft, false)
    assert.equal(/\/Users\/|\/home\/|file:\/\/|<script|\son\w+\s*=/i.test(content), false)
    if (language === 'en') assert.ok(content.includes('The full original report follows in Chinese.'))

    for (const width of [1440, 768, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } })
      await context.addInitScript(language => localStorage.setItem('termhubLanguage', language), language)
      const page = await context.newPage()
      const videoRequests = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('request', request => { if (/\.mp4(?:[?#]|$)/.test(request.url())) videoRequests.push(request.url()) })
      const response = await page.goto(`${origin}/articles/${slug}/`, { waitUntil: 'networkidle' })
      assert.equal(response.status(), 200)
      assert.equal(await page.locator('h1').innerText(), data.title)
      assert.deepEqual(videoRequests, [], 'Do not download all video slots when opening the article')
      const report = page.locator('.wnm3d-report')
      assert.equal(await report.count(), 1)
      const rendered = await report.evaluate((report, leaf) => ({
        blocks: [...report.querySelectorAll(leaf)].map(node => node.textContent),
        videos: [...report.querySelectorAll('video')].map(video => (video.getAttribute('src') || video.querySelector('source').getAttribute('src')).split('#')[0]),
        images: [...report.querySelectorAll('img')].map(image => image.getAttribute('src')),
        sections: [...report.querySelectorAll(':scope > section')].map(section => ({ id: section.id, videos: section.querySelectorAll('video').length, images: section.querySelectorAll('img').length })),
        h2: [...report.querySelectorAll('h2')].map(heading => heading.id),
      }), leaf)
      const hashes = new Set(rendered.blocks.map(normalize).map(hash))
      for (const expected of manifest.sourceBlocks) assert.ok(hashes.has(expected), `Missing source text block ${expected}`)
      assert.deepEqual(rendered.videos, manifest.videos)
      assert.deepEqual(rendered.images, manifest.images)
      assert.deepEqual(rendered.sections, manifest.sections)
      assert.deepEqual(rendered.h2, manifest.h2)
      for (const [id, rows] of Object.entries({
        'geometry-reference-table': manifest.geometry.referenceRows,
        'geometry-actual-table': manifest.geometry.actualRows,
        'geometry-outcome-table': manifest.geometry.outcomeRows,
        'geometry-strata-table': manifest.geometry.strataRows,
        'geometry-context-table': manifest.geometry.contextRows,
      })) {
        const cells = await report.locator('#' + id + ' tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent)))
        assert.deepEqual(cells, rows.map(row => row.map(String)), id)
      }
      assert.equal(await report.locator('#scene-geometry video').count(), 2)
      assert.equal(await report.locator('#scene-geometry img').count(), 3)
      for (const image of await report.locator('#scene-geometry a > img').all()) {
        assert.equal(await image.getAttribute('src'), await image.locator('..').getAttribute('href'), 'Examples must link to full-resolution original figures')
      }
      assert.deepEqual(await report.locator('.wnm-comparison-case').evaluateAll(cases => cases.map(item => Number(item.dataset.comparisonCase))), manifest.cases)
      assert.ok((await report.locator('.wnm-comparison-case').evaluateAll(cases => cases.every(item => item.querySelectorAll('video').length === 2))))
      assert.equal(await report.locator('.early-stop-case').count(), 6)
      assert.ok((await report.locator('.early-stop-case').evaluateAll(cases => cases.every(item => item.querySelectorAll('video').length === 2 && item.querySelector('.instruction').textContent.length > 100))))
      assert.equal(await report.locator('#stage23-full-cases .wnm-paired-report > details').count(), 8)
      assert.equal(await report.locator('#stage23-full-cases video').count(), 16)
      assert.equal(await report.locator('video:not([preload="none"])').count(), 0)
      assert.equal(await report.locator('table:not(.table-wrap > table)').count(), 0)
      assert.equal(await report.locator('a[href$=".json"],a[href$=".jsonl"],a[href$=".md"],a[href$=".html"]').count(), 0)
      const brokenAnchors = await report.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href').slice(1)).filter(id => !document.getElementById(id)))
      assert.deepEqual(brokenAnchors, [])

      await page.screenshot({ path: `/tmp/wnm3d-full-${language}-${width}.png` })
      await report.locator('details').evaluateAll(items => items.forEach(item => { item.open = true }))
      await report.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager' }))
      const images = await report.locator('img').evaluateAll(images => Promise.all(images.map(async image => {
        await image.decode()
        return { src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight }
      })))
      assert.ok(images.every(image => image.width > 0 && image.height > 0), 'Every original figure must render')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${language} ${width}px overflow with all cases expanded`)
      const tocCount = await report.locator('h2,h3').count()
      const toc = page.locator(width < 1024 ? '.article-mobile-toc' : 'aside')
      if (width < 1024) await toc.locator('summary').click()
      assert.equal(await toc.locator('a').count(), tocCount)
      const last = toc.locator('a').last()
      const target = await last.getAttribute('href')
      await last.click()
      assert.equal(new URL(page.url()).hash, target)
      if (width < 1024) await toc.locator('summary').click()

      if (language === 'zh' && width === 1440) {
        const seen = new Set()
        for (let index = 0; index < manifest.videos.length; index++) {
          const url = manifest.videos[index]
          if (seen.has(url)) continue
          const asset = manifest.assets.find(asset => asset.url === url)
          await playVideo(report.locator('video').nth(index), asset)
          seen.add(url)
          console.log(`Playback ${seen.size}/48: ${url.slice(directory.length)}`)
        }
        assert.equal(seen.size, 48)
      } else {
        for (const selector of ['#scene-geometry video', '.wnm-comparison-case video', '.early-stop-case video', '#stage23-full-cases video', '#type-three video']) {
          const video = report.locator(selector).first()
          const url = await video.evaluate(video => (video.getAttribute('src') || video.querySelector('source').getAttribute('src')).split('#')[0])
          await playVideo(video, manifest.assets.find(asset => asset.url === url))
        }
      }

      for (const [name, selector] of [['geometry', '#geometry-reference-statistics'], ['scene-examples', '#scene-example-heading'], ['t-case', '#t-failure-alignment'], ['blockage', '.wnm-comparison-case'], ['early-stop', '.early-stop-case'], ['closed-loop', '.wnm-paired-report > details']]) {
        await report.locator(selector).first().scrollIntoViewIfNeeded()
        await page.screenshot({ path: `/tmp/wnm3d-full-${name}-${language}-${width}.png` })
      }
      await page.goto(`${origin}/articles/`, { waitUntil: 'networkidle' })
      assert.equal(await page.getByRole('link', { name: data.title, exact: true }).count(), 1)
      console.log(`Passed: ${language} ${width}px, all 855 previous source blocks retained, geometry statistics and examples, 50 video slots, 55 figures, TOC, listing, and no overflow.`)
      await context.close()
    }
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
