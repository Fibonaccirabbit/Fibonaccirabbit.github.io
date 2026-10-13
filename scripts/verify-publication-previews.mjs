import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { chromium } from 'playwright'
import matter from 'gray-matter'

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173'
const records = readdirSync('content/publications').filter(name => name.endsWith('.md'))
  .map(name => matter(readFileSync(`content/publications/${name}`, 'utf8')).data)
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

try {
  for (const width of [1440, 1024, 820, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, locale: 'zh-CN' })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}/publications/`, { waitUntil: 'networkidle' })
    await page.locator('[data-publication-id]').first().waitFor()
    assert.equal(await page.locator('[data-publication-id]').count(), 7)
    for (const record of records) {
      const card = page.locator(`[data-publication-id="${record.id}"]`)
      assert.equal(await card.locator('[data-publication-summary]').innerText(), record.summary || matter(readFileSync(`content/publications/${record.id}.md`, 'utf8')).content.trim())
      if (!record.featuredImage) continue
      const image = card.locator('img[data-publication-figure]')
      await image.scrollIntoViewIfNeeded()
      const check = await image.evaluate(async image => {
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = 240
        canvas.height = Math.max(1, Math.round(240 * image.naturalHeight / image.naturalWidth))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let ink = 0
        for (let index = 0; index < pixels.length; index += 4) {
          if (Math.min(pixels[index], pixels[index + 1], pixels[index + 2]) < 225) ink++
        }
        return { width: image.naturalWidth, height: image.naturalHeight, nonblank: ink > canvas.width * canvas.height * 0.01 }
      })
      assert.ok(check.width >= 1000 && check.height > 100 && check.nonblank, `${record.id} figure must render with actual content`)
      const figure = card.locator('figure').first()
      const summary = card.locator('[data-publication-summary]')
      const imageBounds = await figure.boundingBox()
      const textBounds = await summary.boundingBox()
      assert.ok(imageBounds.x + imageBounds.width <= textBounds.x + 2 || imageBounds.y + imageBounds.height <= textBounds.y + 2, `${record.id}: figure overlaps summary`)
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow at ${width}px`)
    assert.equal(await page.locator('[data-publication-id="fp2-neurips-2026"]').count(), 0)
    const mapf = page.locator('[data-publication-id="mapf-world-ral-2026"]')
    await mapf.scrollIntoViewIfNeeded()
    await mapf.getByRole('button', { name: /^View figure:/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    const full = await dialog.locator('img').evaluate(async image => {
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = 80
      canvas.height = 320
      const ctx = canvas.getContext('2d')
      // The backbone label is a separate PDF layer; extracting the base image loses it.
      ctx.drawImage(image, image.naturalWidth * 0.686, image.naturalHeight * 0.205,
        image.naturalWidth * 0.04, image.naturalHeight * 0.58, 0, 0, canvas.width, canvas.height)
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let ink = 0
      for (let index = 0; index < pixels.length; index += 4) {
        if (Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) < 100) ink++
      }
      return { width: image.naturalWidth, src: image.getAttribute('src'), labelInk: ink / (canvas.width * canvas.height) }
    })
    assert.equal(full.width, readFileSync('public/media/publications/mapf-world.png').readUInt32BE(16))
    assert.ok(full.labelInk > 0.03, 'MAPF-World must include the overlaid backbone label, not just the empty diagram background')
    assert.equal(full.src, '/media/publications/mapf-world.png')
    assert.equal(await dialog.getByRole('link', { name: 'Open full-resolution figure' }).getAttribute('href'), full.src)
    await dialog.getByRole('button', { name: 'Close figure' }).click()
    await mapf.getByRole('button', { name: /^Show details:/ }).click()
    assert.equal(await mapf.getByRole('button', { name: /^Hide details:/ }).getAttribute('aria-expanded'), 'true')
    await page.waitForFunction(() => {
      const card = document.querySelector('[data-publication-id="mapf-world-ral-2026"]')
      let element = card.querySelector('[data-publication-details]')
      while (element && element !== card) {
        if (Number(getComputedStyle(element).opacity) < 0.99) return false
        element = element.parentElement
      }
      return true
    })
    const details = await mapf.locator('[data-publication-details]').innerText()
    assert.ok(details.includes("agents' intentions"), 'Publication prose must decode HTML entities')
    assert.ok(!/&#\d+;/.test(details), 'HTML escape codes must not appear in prose')
    await mapf.screenshot({ path: `/tmp/academic-publication-${width}.png` })
    await page.goto(`${base}/publications/`, { waitUntil: 'networkidle' })
    await page.locator('[data-publication-id="mapf-world-ral-2026"] img').evaluate(image => image.decode())
    await page.screenshot({ path: `/tmp/academic-publications-page-${width}.png`, fullPage: true })
    await context.close()
    console.log(`Passed: ${width}px English, 7 introductions, 6 rendered figures, no overlap or overflow, full-resolution preview.`)
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => localStorage.setItem('termhubLanguage', 'zh'))
  const page = await context.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/publications/`, { waitUntil: 'networkidle' })
  const chinese = matter(readFileSync('content/zh/publications/slaw-nav-icann-2026.md', 'utf8')).data
  const slaw = page.locator('[data-publication-id="slaw-nav-icann-2026"]')
  assert.equal(await slaw.locator('[data-publication-summary]').innerText(), chinese.summary)
  await slaw.getByRole('button', { name: /^查看主图:/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: '关闭主图' }).click()
  await slaw.scrollIntoViewIfNeeded()
  await slaw.screenshot({ path: '/tmp/academic-publication-chinese-mobile.png' })
  await page.goto(base, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('[data-publication-id]').count(), 3)
  assert.equal(await page.locator('[data-publication-summary]').count(), 3)
  await page.locator('[data-publication-id="cvan-jbhi-2025"]').scrollIntoViewIfNeeded()
  await page.locator('[data-publication-id="cvan-jbhi-2025"]').screenshot({ path: '/tmp/academic-home-selected-mobile.png' })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
  await context.close()
  for (const language of ['en', 'zh']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    await context.addInitScript(language => localStorage.setItem('termhubLanguage', language), language)
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    for (const route of ['/', '/publications/', '/projects/']) {
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
      assert.equal(/\bFP2\b|Foundation Pareto Flow Policy/i.test(await page.locator('body').innerText()), false, `${language}${route} must not display withheld work`)
    }
    await context.close()
  }
  assert.deepEqual(errors, [])
  console.log('Passed: Chinese mobile descriptions, figure dialog, homepage selection, withheld work absent in both languages, and no runtime errors.')
} finally {
  await browser.close()
}
