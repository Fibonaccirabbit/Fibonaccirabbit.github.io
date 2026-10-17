import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import matter from 'gray-matter'
import { chromium } from 'playwright'

const origin = (process.env.SITE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '')
const slug = 'wnm3d-navigation-failures'
const directory = `/media/${slug}/`
const media = [
  ['blocked-prediction-vs-execution.mp4', 1280, 690, 5],
  ['early-stop-forecast.mp4', 960, 382, 6.6],
  ['recovery-control-comparison.mp4', 640, 440, 7.2],
]
const figures = ['recovery-counts-and-delay.png', 'goal-and-motion-timeline.png']
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

try {
  for (const language of ['en', 'zh']) {
    const root = language === 'zh' ? 'content/zh' : 'content'
    const { data, content } = matter(readFileSync(`${root}/articles/${slug}.md`, 'utf8'))
    assert.equal(data.slug, slug)
    assert.equal(data.draft, false)
    assert.equal(/\/Users\/|\/home\/|past_obs_tokens|<script|seed\s*[:=]?\s*\d+/i.test(content), false)
    for (const width of [1440, 768, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } })
      await context.addInitScript(language => localStorage.setItem('termhubLanguage', language), language)
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      const response = await page.goto(`${origin}/articles/${slug}/`, { waitUntil: 'networkidle' })
      assert.equal(response.status(), 200)
      assert.equal(await page.locator('h1').innerText(), data.title)
      const prose = page.locator('.article-prose')
      assert.equal(await prose.locator('h2').count(), 7)
      const outcomes = await prose.locator('tbody tr').evaluateAll(rows => rows.map(row =>
        [...row.querySelectorAll('td')].slice(1).map(cell => cell.textContent.trim())))
      assert.deepEqual(outcomes, [['971', '37.4%'], ['952', '36.6%'], ['672', '25.9%'], ['3', '0.1%'], ['2,598', '100.0%']])
      assert.equal(await prose.locator('img').count(), 2)
      for (const [index, name] of figures.entries()) {
        const figure = prose.locator('img').nth(index)
        await figure.scrollIntoViewIfNeeded()
        const dimensions = await figure.evaluate(async image => {
          await image.decode()
          return { width: image.naturalWidth, height: image.naturalHeight, src: image.getAttribute('src') }
        })
        const png = readFileSync(`public${directory}${name}`)
        assert.equal(dimensions.src, `${directory}${name}`)
        assert.equal(dimensions.width, png.readUInt32BE(16))
        assert.equal(dimensions.height, png.readUInt32BE(20))
        assert.equal(await figure.locator('..').getAttribute('href'), `${directory}${name}`)
      }
      assert.equal(await prose.locator('video').count(), 3)
      for (const [index, [name, expectedWidth, expectedHeight, duration]] of media.entries()) {
        const video = prose.locator('video').nth(index)
        await video.scrollIntoViewIfNeeded()
        await page.waitForFunction(index => document.querySelectorAll('.article-prose video')[index].readyState >= 2, index)
        const info = await video.evaluate(video => ({ width: video.videoWidth, height: video.videoHeight, duration: video.duration, src: video.currentSrc, poster: video.poster }))
        assert.deepEqual([info.width, info.height], [expectedWidth, expectedHeight])
        assert.ok(Math.abs(info.duration - duration) < 0.1)
        assert.ok(info.src.endsWith(`${directory}${name}`))
        const poster = await page.request.get(info.poster)
        assert.equal(poster.status(), 200)
        assert.ok(poster.headers()['content-type'].startsWith('image/'))
        await video.evaluate(video => { video.muted = true; return video.play() })
        await page.waitForFunction(index => document.querySelectorAll('.article-prose video')[index].currentTime > 0.25, index)
        const ink = await video.evaluate(video => {
          video.pause()
          const canvas = document.createElement('canvas')
          canvas.width = 160
          canvas.height = 100
          const ctx = canvas.getContext('2d')
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
          let visible = 0
          for (let i = 0; i < pixels.length; i += 4) if (Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) > 40) visible++
          return visible / (canvas.width * canvas.height)
        })
        assert.ok(ink > 0.05, `${name} must show actual video frames`)
        const bounds = await video.boundingBox()
        assert.ok(Math.abs(bounds.width / bounds.height - expectedWidth / expectedHeight) < 0.03)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false)
      if (width < 1024) {
        await page.locator('.article-mobile-toc summary').click()
        assert.equal(await page.locator('.article-mobile-toc a').count(), 7)
        await page.locator('.article-mobile-toc a').last().click()
        assert.ok(new URL(page.url()).hash.startsWith('#section-'))
      }
      await page.goto(`${origin}/articles/${slug}/`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: `/tmp/wnm3d-blog-${language}-${width}.png` })
      await page.locator('.article-prose table').scrollIntoViewIfNeeded()
      await page.screenshot({ path: `/tmp/wnm3d-blog-table-${language}-${width}.png` })
      await page.goto(`${origin}/articles/`, { waitUntil: 'networkidle' })
      assert.equal(await page.getByRole('link', { name: data.title, exact: true }).count(), 1)
      console.log(`Passed: ${language} ${width}px, source counts, native-resolution figures, 3 videos, TOC, listing, and no horizontal page overflow.`)
      await context.close()
    }
  }
  assert.deepEqual(errors, [])
} finally {
  await browser.close()
}
