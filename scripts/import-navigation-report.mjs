import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, relative, resolve } from 'node:path'
import matter from 'gray-matter'
import { chromium } from 'playwright'

const source = resolve(process.argv[2] || '')
assert.ok(process.argv[2], 'Usage: node scripts/import-navigation-report.mjs <source.html> [--preserve-published]')
const assetRoot = resolve(dirname(source), 'assets/wnm_failure_cases_20261016')
const pairedSource = resolve(assetRoot, 'stage23_closedloop8_20261017/closedloop_report_zh.html')
const geometrySource = resolve(dirname(source), 'WNM3D_failure_cases_gallery_20261016.html')
const datasetRoot = resolve(dirname(source), '../wnm_systematic_eval_20261010')
const geometryRoot = resolve(datasetRoot, 'geometry_failure_strata_all5000_20261014_wwbj31zl')
const outcomes = JSON.parse(readFileSync(resolve(geometryRoot, 'outcome_cross_tables.json'), 'utf8'))
const comparisons = JSON.parse(readFileSync(resolve(geometryRoot, 'comparisons.json'), 'utf8'))
const contextAudit = JSON.parse(readFileSync(resolve(datasetRoot, 'recorded_node_context380_20261015_wqt4ngr6/complete_AI_review_scope_audit.json'), 'utf8'))
assert.equal(contextAudit.state, 'passed')
const labels = [
  ['T_like_three_exit_connectivity', 'T 型三分支'],
  ['cross_like_four_exit_connectivity', '十字型四分支'],
  ['Y_like_three_exit_connectivity', 'Y 型三分支'],
  ['narrow_two_sided_passage_candidate', '两侧受限窄通行带'],
]
const totalOutcomes = { tasks: 5000, success: 2402, stop_before_goal_region: 952, failure_with_sustained_blockage: 971, goal_region_reached_but_not_successful_stop: 672, failure_with_collision_without_sustained_blockage: 3 }
const outcomeNames = ['success', 'stop_before_goal_region', 'failure_with_sustained_blockage', 'goal_region_reached_but_not_successful_stop', 'failure_with_collision_without_sustained_blockage']
const percent = value => (value * 100).toFixed(2) + '%'
const signed = value => (value >= 0 ? '+' : '') + (value * 100).toFixed(2)
const tableRows = domain => labels.map(([key, label]) => {
  const row = outcomes.find(row => row.domain === domain && row.label === key && row.positive)
  assert.equal(Object.values(row.outcome_counts).reduce((a, b) => a + b, 0), row.tasks)
  const failures = row.tasks - row.outcome_counts.success
  return [label, row.tasks, failures, percent(failures / row.tasks)]
})
const geometry = {
  referenceRows: [...tableRows('reference'), ['全部任务', 5000, 2598, '51.96%']],
  actualRows: tableRows('actual'),
  outcomeRows: [...labels.map(([key, label]) => {
    const row = outcomes.find(row => row.domain === 'reference' && row.label === key && row.positive)
    return [label, row.tasks, ...outcomeNames.map(name => row.outcome_counts[name] || 0)]
  }), ['全部任务', 5000, ...outcomeNames.map(name => totalOutcomes[name])]],
  strataRows: labels.map(([key, label]) => {
    const row = comparisons.find(row => row.domain === 'reference' && row.label === key && row.outcome === 'all_failure')
    return [label, row.common_support_tasks, row.common_support_scenes, signed(row.same_scene_difficulty_length_difference), row.adjusted_cluster.ci95.map(signed).join(' ~ ')]
  }),
  contextRows: labels.slice(0, 3).map(([key, label]) => {
    const row = contextAudit.detector_type_by_visible_context_fixed_nodes_only[key]
    const columns = ['furnished_room_view', 'wall_corridor_or_doorway_view', 'mixed_partition_opening_and_furnishing', 'insufficient_visible_context', 'unavailable_recorded_context'].map(name => row[name] || 0)
    return [label, columns.reduce((a, b) => a + b, 0), ...columns]
  }),
}
geometry.contextRows.push(['合计', ...[1, 2, 3, 4, 5, 6].map(index => geometry.contextRows.reduce((sum, row) => sum + row[index], 0))])
assert.equal(geometry.contextRows.at(-1)[1], 380)
const slug = 'wnm3d-navigation-failures'
const prefix = `/media/${slug}/full/`
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const normalize = text => text.replace(/\s+/g, '')
const hash = value => createHash('sha256').update(value).digest('hex')
const preservePublished = process.argv.includes('--preserve-published')
const published = preservePublished ? {
  body: matter(execFileSync('git', ['show', `HEAD:content/articles/${slug}.md`], { encoding: 'utf8' })).content,
  manifest: JSON.parse(execFileSync('git', ['show', 'HEAD:scripts/fixtures/wnm3d-detail-coverage.json'], { encoding: 'utf8' })),
} : null

try {
  const page = await browser.newPage()
  await page.route('**/*', route => route.abort())
  const imported = await page.evaluate(({ main, paired, galleryHtml, geometryHtml, geometry, publishedBody }) => {
    const parser = new DOMParser()
    const original = parser.parseFromString(main, 'text/html')
    const supplemental = parser.parseFromString(paired, 'text/html')
    const report = publishedBody ? parser.parseFromString(publishedBody, 'text/html').querySelector('.wnm3d-report') : original.createElement('div')
    report.className = 'wnm3d-report'
    report.lang = 'zh-CN'
    report.querySelector('#scene-geometry')?.remove()
    if (publishedBody) report.querySelectorAll('h2,h3').forEach((heading, index) => { heading.id ||= `section-${index + 1}` })
    if (!publishedBody) {
      report.append(original.querySelector('header .intro').cloneNode(true))
      original.querySelectorAll('article > section').forEach(section => report.append(section.cloneNode(true)))
      const provenance = original.querySelector('footer > p.note')
      if (provenance) report.append(provenance.cloneNode(true))
    }
    const leaf = 'p,td,th,blockquote,h1,h2,h3,h4,h5,summary,figcaption,li'
    const originalSourceBlocks = [...report.querySelectorAll(leaf), ...(!publishedBody ? supplemental.querySelector('main').querySelectorAll(leaf) : [])]
      .map(node => node.textContent).filter(text => text.trim())
    const sourceBlocks = [...originalSourceBlocks]
    const geometrySection = parser.parseFromString(geometryHtml, 'text/html').querySelector('#scene-geometry')
    const tables = {
      'geometry-reference-table': geometry.referenceRows,
      'geometry-actual-table': geometry.actualRows,
      'geometry-outcome-table': geometry.outcomeRows,
      'geometry-strata-table': geometry.strataRows,
      'geometry-context-table': geometry.contextRows,
    }
    for (const [id, rows] of Object.entries(tables)) {
      const body = geometrySection.querySelector('#' + id + ' tbody')
      for (const values of rows) {
        const row = original.createElement('tr')
        for (const [index, value] of values.entries()) {
          const cell = original.createElement('td')
          cell.textContent = String(value)
          if (index > 0) cell.className = 'num'
          row.append(cell)
        }
        body.append(row)
      }
    }
    const sceneExamples = parser.parseFromString(galleryHtml, 'text/html').querySelector('#scene-examples')
    const heading = sceneExamples.querySelector('h2')
    const subheading = original.createElement('h3')
    subheading.id = 'scene-example-heading'
    subheading.innerHTML = heading.innerHTML
    heading.replaceWith(subheading)
    geometrySection.querySelector('#geometry-example-content').replaceWith(sceneExamples)
    const execution = original.createElement('details')
    execution.innerHTML = '<summary>q4590 完整原始执行录像（500 步）</summary><video controls playsinline preload="none" poster="assets/wnm_failure_cases_20261016/geometry/q4590/step_0024.jpg" aria-label="q4590 完整原始执行录像"><source src="assets/wnm_failure_cases_20261016/geometry/q4590/execution.mp4" type="video/mp4"></video><p class="note">封面为原始状态24；录像包含整条任务，不是新增重放。</p>'
    sceneExamples.querySelector('video').closest('details').after(execution)
    sourceBlocks.push(...[...geometrySection.querySelectorAll(leaf)].map(node => node.textContent).filter(text => text.trim()))
    report.querySelector('#failure-distribution').after(geometrySection)
    const cases = JSON.parse(original.getElementById('case-data').textContent)

    if (!publishedBody) {
      // Expand the source's scripted selector into six independently accessible cases.
      const gallery = original.createElement('div')
      gallery.className = 'wnm-case-gallery'
      gallery.id = 'case-player'
      for (const item of cases) {
        const section = original.createElement('section')
        section.className = 'wnm-comparison-case'
        section.dataset.comparisonCase = String(item.q)
        section.innerHTML = `<h4>q${item.q} · 预测与实际执行</h4>
          <p>q${item.q} · 动作 ${item.steps[0]}—${item.steps[1]} · 请求平移 ${item.requested.toFixed(3)}m · 实际平移 0m · 8/8 碰撞</p>
          <video controls playsinline preload="none" poster="assets/wnm_failure_cases_20261016/${item.folder}/${item.poster}" aria-label="q${item.q} 保存预测与同次原始执行对照"><source src="assets/wnm_failure_cases_20261016/${item.folder}/${item.comparison}" type="video/mp4"></video>
          <details><summary>q${item.q} 完整原始执行录像</summary><video controls playsinline preload="none" aria-label="q${item.q} 完整原始执行"><source src="assets/wnm_failure_cases_20261016/${item.folder}/execution.mp4" type="video/mp4"></video></details>`
        gallery.append(section)
      }
      report.querySelector('#case-player').replaceWith(gallery)
      report.querySelector('.case-picker').remove()
      report.querySelector('#case-caption').remove()

      // Keep the linked eight-task report in the article rather than replacing it with a summary.
      const fullCases = original.createElement('details')
      fullCases.id = 'stage23-full-cases'
      fullCases.className = 'wnm-full-closedloop'
      const summary = original.createElement('summary')
      summary.textContent = '全部 8 条任务：完整指令、16 段双阶段执行录像与轨迹'
      const pairedBody = supplemental.querySelector('main').cloneNode(true)
      pairedBody.className = 'wnm-paired-report'
      pairedBody.querySelectorAll('[src],[poster],a[href]').forEach(element => {
        for (const attribute of ['src', 'poster', 'href']) {
          const value = element.getAttribute(attribute)
          if (value && !value.startsWith('#') && !/^[a-z]+:/i.test(value)) {
            element.setAttribute(attribute, `assets/wnm_failure_cases_20261016/stage23_closedloop8_20261017/${value}`)
          }
        }
      })
      pairedBody.querySelectorAll('h1,h2,h3').forEach(heading => {
        const replacement = original.createElement(heading.tagName === 'H3' ? 'h5' : 'h4')
        replacement.innerHTML = heading.innerHTML
        heading.replaceWith(replacement)
      })
      fullCases.append(summary, pairedBody)
      report.querySelector('#stage23-closedloop').append(fullCases)
    }
    report.querySelectorAll('script,style,iframe,object,embed,base,link').forEach(node => node.remove())
    report.querySelectorAll('noscript').forEach(node => node.replaceWith(...node.childNodes))
    report.querySelectorAll('*').forEach(element => {
      for (const attribute of [...element.attributes]) if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name)
    })
    const references = new Set()
    report.querySelectorAll('[src],[poster],a[href]').forEach(element => {
      for (const attribute of ['src', 'poster', 'href']) {
        const value = element.getAttribute(attribute)
        if (!value) continue
        if (/^javascript:/i.test(value)) { element.removeAttribute(attribute); continue }
        if (!value.startsWith('assets/')) continue
        const name = value.split('#')[0]
        const extension = name.split('.').pop().toLowerCase()
        if (extension === 'html') {
          element.setAttribute(attribute, '#stage23-full-cases')
        } else if (['json', 'jsonl', 'md'].includes(extension)) {
          const text = original.createElement('span')
          text.className = 'wnm-local-source'
          text.innerHTML = element.innerHTML
          element.replaceWith(text)
        } else {
          references.add(name)
        }
      }
    })
    report.querySelectorAll('video').forEach(video => {
      video.setAttribute('preload', 'none')
      video.setAttribute('controls', '')
      video.setAttribute('playsinline', '')
    })
    report.querySelectorAll('table').forEach(table => {
      if (table.parentElement.classList.contains('table-wrap')) return
      const wrapper = original.createElement('div')
      wrapper.className = 'table-wrap'
      table.replaceWith(wrapper)
      wrapper.append(table)
    })
    report.querySelectorAll(':scope > section').forEach(section => {
      const heading = section.querySelector('h2')
      if (heading) heading.id ||= `${section.id}-heading`
    })
    const actualBlocks = [...report.querySelectorAll(leaf)].map(node => node.textContent)
    return { html: report.outerHTML, sourceBlocks, originalSourceBlocks, actualBlocks, references: [...references], cases: cases.map(item => item.q) }
  }, { main: readFileSync(source, 'utf8'), paired: readFileSync(pairedSource, 'utf8'), galleryHtml: readFileSync(geometrySource, 'utf8'), geometryHtml: readFileSync('content/fragments/wnm3d-scene-geometry.html', 'utf8'), geometry, publishedBody: published?.body })

  const actual = new Set(imported.actualBlocks.map(normalize))
  for (const block of imported.sourceBlocks) assert.ok(actual.has(normalize(block)), `Source text omitted: ${block.slice(0, 120)}`)
  const actualHashes = new Set([...actual].map(hash))
  for (const block of published?.manifest.originalSourceBlocks || published?.manifest.sourceBlocks || []) {
    assert.ok(actualHashes.has(block), `Previously published source text omitted: ${block}`)
  }
  const assets = published ? [...published.manifest.assets] : []
  for (const name of imported.references) {
    const input = resolve(dirname(source), name)
    const local = relative(assetRoot, input)
    assert.ok(!local.startsWith('..') && !local.startsWith('/'), 'Asset must remain under the supplied report directory')
    assert.ok(['.png', '.jpg', '.jpeg', '.svg', '.mp4', '.gif', '.pdf'].includes(extname(input).toLowerCase()))
    const url = `${prefix}${local}`
    const output = resolve(`public${url}`)
    mkdirSync(dirname(output), { recursive: true })
    copyFileSync(input, output)
    const bytes = readFileSync(output)
    assert.equal(hash(bytes), hash(readFileSync(input)))
    const asset = { url, bytes: bytes.length, sha256: hash(bytes) }
    if (extname(input).toLowerCase() === '.mp4') {
      const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', input], { encoding: 'utf8' }))
      Object.assign(asset, { width: probe.streams[0].width, height: probe.streams[0].height, duration: Number(probe.format.duration) })
    }
    const existing = assets.findIndex(item => item.url === url)
    if (existing >= 0) assets[existing] = asset
    else assets.push(asset)
  }

  const finished = await page.evaluate(({ html, assets, prefix }) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    doc.querySelectorAll('[src],[poster],a[href]').forEach(element => {
      for (const attribute of ['src', 'poster', 'href']) {
        const value = element.getAttribute(attribute)
        if (value?.startsWith('assets/wnm_failure_cases_20261016/')) {
          element.setAttribute(attribute, prefix + value.slice('assets/wnm_failure_cases_20261016/'.length))
        }
      }
    })
    doc.querySelectorAll('video').forEach(video => {
      const url = video.getAttribute('src') || video.querySelector('source').getAttribute('src')
      const info = assets.find(asset => asset.url === url.split('#')[0])
      video.style.aspectRatio = `${info.width}/${info.height}`
    })
    return {
      html: doc.body.innerHTML,
      videos: [...doc.querySelectorAll('video')].map(video => (video.getAttribute('src') || video.querySelector('source').getAttribute('src')).split('#')[0]),
      images: [...doc.images].map(image => image.getAttribute('src')),
      h2: [...doc.querySelectorAll('h2')].map(heading => heading.id),
      sections: [...doc.querySelectorAll('.wnm3d-report > section')].map(section => ({ id: section.id, videos: section.querySelectorAll('video').length, images: section.querySelectorAll('img').length })),
    }
  }, { html: imported.html, assets, prefix })

  const originalHtml = finished.html.replace(/\r?\n\s*/g, ' ')
  for (const language of ['en', 'zh']) {
    const path = `${language === 'zh' ? 'content/zh' : 'content'}/articles/${slug}.md`
    const { data } = matter(readFileSync(path, 'utf8'))
    data.title = language === 'zh' ? 'WNM-3D 导航失败分析：完整案例与机制对照' : 'WNM-3D navigation failure analysis: full case report (Chinese)'
    data.summary = language === 'zh'
      ? '从 5,000 条未见场景任务出发，结合 T 型、十字型、Y 型与窄通行带统计，分析持续受阻、提前停止和目标区内未正确结束，附场景实例、完整录像、轨迹与机制对照。'
      : 'The complete Chinese report: T-like, cross-like, Y-like and narrow-passage statistics, illustrated scene examples, blockage and early-stop cases, eight paired closed-loop tasks, and mechanism controls.'
    const lead = language === 'en'
      ? 'The full original report follows in Chinese. All cases, instructions, videos, trajectory figures, tables, and qualifications are retained; this is not an abridged English translation. Raw execution logs and audit files remain local.\n\n'
      : ''
    writeFileSync(path, matter.stringify(`${lead}${originalHtml}\n`, data))
  }
  const manifest = {
    cases: imported.cases,
    sourceBlocks: [...new Set([...(published?.manifest.originalSourceBlocks || published?.manifest.sourceBlocks || []), ...imported.sourceBlocks.map(normalize).map(hash)])],
    originalSourceBlocks: published?.manifest.originalSourceBlocks || published?.manifest.sourceBlocks || [...new Set(imported.originalSourceBlocks.map(normalize).map(hash))],
    geometry,
    videos: finished.videos,
    images: finished.images,
    h2: finished.h2,
    sections: finished.sections,
    assets,
  }
  mkdirSync('scripts/fixtures', { recursive: true })
  writeFileSync('scripts/fixtures/wnm3d-detail-coverage.json', JSON.stringify(manifest, null, 2) + '\n')
  console.log(JSON.stringify({ sourceBlocks: manifest.sourceBlocks.length, sections: manifest.sections, videoSlots: manifest.videos.length, uniqueVideos: new Set(manifest.videos).size, images: manifest.images.length, assets: assets.length, assetMB: assets.reduce((sum, asset) => sum + asset.bytes, 0) / 1024 / 1024 }, null, 2))
} finally {
  await browser.close()
}
