import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))
const readMarkdown = folder => readdirSync(folder).filter(name => name.endsWith('.md')).map(name => matter(readFileSync(join(folder, name), 'utf8')))
const projects = ['slaw-nav.md', 'mapf-world.md', 'hsru.md', 'openharmony-xr-cabin.md', 'edge-fatigue-detection.md', 'medical-delivery-robot.md']
const paperIds = ['cvan-jbhi-2025', 'envpilot-tosem-2026', 'h-ligo-icic-2026', 'hsru-ispp-2024', 'mapf-world-ral-2026', 'mcga-icic-2026', 'slaw-nav-icann-2026']
const papersByLanguage = []

for (const root of ['content', 'content/zh']) {
  const site = readJson(`${root}/site.json`)
  assert.ok(site.sections.includes('skills'))
  assert.ok(site.terminal.skills.some(skill => skill.name === 'PyTorch'))
  assert.ok(site.terminal.skills.some(skill => skill.name === 'OpenHarmony'))
  assert.equal(site.social.github, 'https://github.com/Fibonaccirabbit')
  assert.equal(site.social.googleScholar, 'https://scholar.google.com/citations?user=4PaJ4SkAAAAJ&hl=en')
  for (const file of projects) {
    const { data } = matter(readFileSync(`${root}/projects/${file}`, 'utf8'))
    assert.equal(data.role, 'contributor', `${file} must not imply independent authorship`)
    assert.ok(data.highlights.length > 0)
  }
  const publications = readMarkdown(`${root}/publications`)
  const papers = publications.map(paper => paper.data).sort((a, b) => a.id.localeCompare(b.id))
  papersByLanguage.push(papers)
  assert.deepEqual(papers.map(paper => paper.id), paperIds)
  assert.equal(papers.filter(paper => paper.status === 'published').length, 6)
  const finalLinks = []
  for (const paper of papers) {
    assert.ok(paper.authors.includes('Zhanjiang Yang'))
    assert.equal(paper.authors.some(author => /et al/i.test(author)), false)
    assert.equal(Boolean(paper.isFirstAuthor), paper.authors[0] === 'Zhanjiang Yang')
    assert.ok(paper.links.paper || paper.links.arxiv)
    assert.ok(paper.links.scholar.includes('citation_for_view=4PaJ4SkAAAAJ:'))
    if (paper.featuredImage) {
      assert.ok(paper.summary.length > 20)
      assert.ok(paper.featuredImageAlt && paper.featuredImageCaption)
      for (const path of [paper.featuredImage, paper.featuredImageFull]) {
        assert.ok(path.startsWith('/media/publications/'))
        assert.ok(existsSync(`public${path}`), `Missing figure: ${path}`)
      }
      const png = readFileSync(`public${paper.featuredImageFull}`)
      assert.ok(png.readUInt32BE(16) >= 1000, 'Full-resolution figures must retain meaningful detail')
    }
    for (const url of Object.values(paper.links)) assert.equal(new URL(url).protocol, 'https:')
    if (paper.links.paper) finalLinks.push(paper.links.paper)
  }
  assert.equal(new Set(finalLinks).size, finalLinks.length, 'Preprint and final publication must not be duplicated')
  assert.ok(site.selectedPublicationIds.every(id => paperIds.includes(id)))
  assert.equal(papers.filter(paper => paper.featuredImage).length, 6)
  const mapf = papers.find(paper => paper.id === 'mapf-world-ral-2026')
  assert.deepEqual(mapf.authors, ['Zhanjiang Yang', 'Yueming Li', 'Yang Shen', 'Meng Li', 'Lijun Sun'])
  assert.equal(mapf.links.paper, 'https://doi.org/10.1109/LRA.2026.3726342')
  const envpilot = papers.find(paper => paper.id === 'envpilot-tosem-2026')
  assert.equal(envpilot.status, 'accepted')
  assert.equal(envpilot.links.paper, undefined, 'Unverified publisher DOI must not be invented')
  const mcga = papers.find(paper => paper.id === 'mcga-icic-2026')
  assert.ok(mcga.authors.includes('Yu Lu'))
  assert.equal(mcga.links.code, undefined, 'A project-materials repository is not released code')
  assert.equal(papers.find(paper => paper.id === 'hsru-ispp-2024').title, 'HsRu: hyperspectral restoration U-Net')
  const experience = readJson(`${root}/experience.json`)
  assert.equal(experience.timeline.length, 2)
  assert.ok(experience.timeline.some(entry => entry.start === '2025-07-01' && entry.end === '2025-10-01'))
  assert.equal(readJson(`${root}/awards.json`).length, 7)
}

assert.deepEqual(papersByLanguage[0].map(({ keywords, summary, featuredImageAlt, featuredImageCaption, ...paper }) => paper), papersByLanguage[1].map(({ keywords, summary, featuredImageAlt, featuredImageCaption, ...paper }) => paper), 'Bibliographic metadata and resource links must match across languages')

const inspect = directory => {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name)
    if (item.isDirectory()) inspect(path)
    else if (/\.(json|md)$/.test(item.name)) {
      const text = readFileSync(path, 'utf8')
      assert.equal(/\b1[3-9]\d{9}\b/.test(text), false, `${path} contains a mobile phone number`)
      assert.equal(/zhangsan@example\.com|yourhomepage\.com|lychee47/.test(text), false, `${path} contains a placeholder or outdated contact field`)
      assert.equal(/\b\d{6,}@qq\.com\b/.test(text), false, `${path} contains a private email from the older resume`)
      assert.equal(/户籍|民族|性别|年龄\s*[:：]/.test(text), false, `${path} contains private demographic fields`)
      assert.equal(/\bFP2\b|Foundation Pareto Flow Policy/i.test(text), false, `${path} contains a withheld paper`)
    }
  }
}
inspect('content')
assert.equal(existsSync('public/media/publications/fp2.png'), false, 'Withheld full-resolution figures must not be served')
assert.equal(existsSync('public/media/publications/fp2.webp'), false, 'Withheld figure previews must not be served')
console.log('Passed: bilingual resume content, 6 projects, 7 verified paper records with 6 high-resolution figures, publication boundaries, awards, and privacy checks.')
