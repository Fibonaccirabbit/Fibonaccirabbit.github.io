# Personal TermHub Preview

This copy uses TermHub's original terminal template, with Zhanjiang Yang's content.
WowPage, Fuwari, and PersonalSite are retained locally. This checkout targets
`Fibonaccirabbit/Fibonaccirabbit.github.io`, at https://fibonaccirabbit.github.io/.
The original template repository is retained as the `upstream` Git remote;
`origin` points to the personal homepage repository.

## Run

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/ and http://127.0.0.1:5173/articles.

## Edit

- Basic information: `content/site.json` and `content/zh/site.json`.
- Bio and journey: `content/about.md` and `content/zh/about.md`.
- Education, work, and reviewing: `content/experience.json` and `content/zh/experience.json`.
- Papers and projects: `content/publications/` and `content/projects/`, with Chinese versions under `content/zh/`.
- Blog: `content/articles/` and `content/zh/articles/`.

Blog posts need `slug`, `title`, `summary`, `date`, `category`, and `tags` in their YAML frontmatter. `draft: true` is visible in development but excluded from production JavaScript. Day 1 is published in both languages with `draft: false`, using the full workstation recording supplied by the author.

Videos and posters live under `public/media/`; these files are copied to production regardless of the draft flag. A draft flag is not access control for media assets. The published Day 1 assets are `agent-os-day1-workstation.mp4` and `agent-os-day1-workstation-poster.jpg`. Earlier cropped assets remain local and untracked; do not commit them accidentally. For a new post, review both language copies and explicitly commit its article and media together.

## Publish

Push reviewed changes on `main` to `origin`. The Pages workflow validates the profile, builds the static site, and deploys it through GitHub Actions. Root-level Pages and project Pages use the base path supplied by `actions/configure-pages`. Static entry files are generated for the enabled pages and published article routes so direct links do not rely on a 404 response.

## Verify

```sh
npm run validate
npm run test:profile
npm run build
npm run test:ui
```

The UI test uses an installed Chrome browser and a running local dev server. Set `SITE_URL` for another address. For a production preview without drafts, use `VERIFY_DRAFTS=false npm run test:ui`.

The upstream `npm run lint` configuration has an ESLint compatibility issue; it is not currently a passing check. The build runs TypeScript checks separately.

The original GPL-3.0 license and TermHub attribution are preserved.

## Resume Content

The site combines the supplied undergraduate and graduate resumes. Conflicting education dates and GPA values are omitted until confirmed; the M.S. student status follows the resumes' stated wording. Current public email and GitHub links are retained instead of placeholder or older contact fields.

FP2 remains a research project without an inferred publication record. The seven papers on the confirmed Google Scholar profile are now included in both languages; six have verified final publication metadata, while EnvPilot is marked accepted based on its authors' arXiv notice. HsRu's published title and DOI have been verified. See `PUBLICATION_SOURCES.md` for sources and version differences. Performance numbers and novelty superlatives are omitted. Team projects use a contributor role rather than claiming independent authorship. No resume PDF, phone number, age, or household information is copied into the public site.
