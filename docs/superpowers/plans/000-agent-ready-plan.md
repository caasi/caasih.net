# Agent-Ready caasih.net Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish static agent-discovery primitives on caasih.net — `robots.txt` (with AI-bot rules + Content-Signal), `sitemap.xml`, per-post markdown twins, and feed-discovery `<link>` tags — without leaving GitHub Pages.

**Architecture:** Three build-time Node generator scripts plus two small React edits. Markdown twins use a pre-webpack manifest (so the Post component can conditionally render `<link rel="alternate">`) and a post-snapshot copy. Sitemap is dist-glob-based so any deployed HTML — React-rendered or manually built — is captured.

**Tech Stack:** Node 20 LTS, Jest + SWC transform, React 17 + react-helmet, webpack 4, react-snapshot, gh-pages, `yarn@4.10.2`.

**Spec:** [`docs/superpowers/specs/000-agent-ready-design.md`](../specs/000-agent-ready-design.md)

---

## Pre-flight

- [ ] **Step 0.1: Create feature branch**

Per user CLAUDE.md: implementation goes on a feature branch, never on `master`.

```bash
git checkout -b feat/agent-ready
git status
```

Expected: `On branch feat/agent-ready`, working tree clean.

## File Structure

**New files:**

| Path | Purpose |
| --- | --- |
| `scripts/generate-robots.js` | Emit `dist/robots.txt`. Pure constant output. |
| `scripts/generate-robots.test.js` | Unit tests for robots generator. |
| `scripts/generate-sitemap.js` | Glob `dist/**/*.html`, emit `dist/sitemap.xml`. |
| `scripts/generate-sitemap.test.js` | Unit tests for sitemap generator. |
| `scripts/generate-md-twins.js` | Two-phase: `--manifest` writes `src/generated/md-twins.json`; `--copy` copies `.md` files into `dist/posts/`. |
| `scripts/generate-md-twins.test.js` | Unit tests for both phases. |
| `src/generated/.gitkeep` | Keep directory tracked; actual manifest JSON is gitignored. |

**Modified:**

| Path | Change |
| --- | --- |
| `.gitignore` | Add `src/generated/md-twins.json`. |
| `package.json` | Add `build:md-twins-manifest`, `build:robots`, `build:sitemap`, `build:md-twins` scripts; rewire `build` chain. |
| `src/Root/Root.jsx` | Add three `<link rel="alternate">` tags inside existing `<Helmet>`. |
| `src/pages/Post/index.jsx` | Import `src/generated/md-twins.json`; when `pid` in `slugs`, render `<link rel="alternate" type="text/markdown" href="/posts/<pid>.md">` inside existing `<Helmet>`. |

All generator scripts use only Node built-ins (`fs`, `path`, `url`) — no new deps.

---

## Task 1: Generated directory scaffolding

**Files:**
- Create: `src/generated/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1.1: Create generated dir with placeholder**

```bash
mkdir -p src/generated
touch src/generated/.gitkeep
```

- [ ] **Step 1.2: Add manifest + new build outputs to gitignore**

The existing `.gitignore` ignores `dist/**/*.html`, `dist/*.js`, `dist/feed.xml`, `dist/atom.xml`, `dist/feed.json` but does NOT cover the new artifacts. Append to `.gitignore` after the `# ReScript` block:

```
# generated build intermediates
src/generated/md-twins.json

# agent-ready build outputs
dist/robots.txt
dist/sitemap.xml
dist/posts/*.md
```

- [ ] **Step 1.3: Verify**

```bash
git status --short src/generated/ .gitignore
```

Expected: only `.gitkeep` and `.gitignore` appear (no `md-twins.json`, no whole dir ignored).

- [ ] **Step 1.4: Commit**

```bash
git add src/generated/.gitkeep .gitignore
git commit -m "chore: scaffold src/generated/ for build manifests"
```

---

## Task 2: `generate-robots.js`

Pure constant output. Test first.

**Files:**
- Create: `scripts/generate-robots.js`
- Create: `scripts/generate-robots.test.js`

- [ ] **Step 2.1: Write failing test**

Create `scripts/generate-robots.test.js`:

```js
const { buildRobotsTxt } = require('./generate-robots')

describe('buildRobotsTxt', () => {
  const output = buildRobotsTxt()

  test('starts with comment citing Content-Signal sources', () => {
    expect(output.split('\n')[0]).toMatch(/^# /)
    expect(output).toMatch(/contentsignals\.org/)
    expect(output).toMatch(/draft-romm-aipref-contentsignals/)
  })

  test('has wildcard User-agent block with Allow: /', () => {
    expect(output).toMatch(/User-agent: \*\nAllow: \//)
  })

  test('wildcard block includes Content-Signal directive', () => {
    expect(output).toMatch(
      /Content-Signal: ai-train=yes, search=yes, ai-input=yes/
    )
  })

  test.each([
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-Web',
    'Claude-SearchBot',
    'Claude-User',
    'Google-Extended',
    'PerplexityBot',
    'PerplexityBot-User',
    'CCBot',
    'Applebot-Extended',
    'Bytespider',
    'Meta-ExternalAgent',
    'Amazonbot',
    'DuckAssistBot',
    'Timpibot',
  ])('has explicit User-agent block for %s', (ua) => {
    expect(output).toMatch(new RegExp(`User-agent: ${ua}\\nAllow: /`))
  })

  test('ends with Sitemap directive for caasih.net', () => {
    expect(output.trim()).toMatch(
      /Sitemap: https:\/\/caasih\.net\/sitemap\.xml$/
    )
  })

  test('uses LF line endings only', () => {
    expect(output).not.toMatch(/\r/)
  })
})
```

- [ ] **Step 2.2: Run test — expect FAIL**

```bash
yarn test scripts/generate-robots.test.js
```

Expected: fails with `Cannot find module './generate-robots'`.

- [ ] **Step 2.3: Implement generator**

Create `scripts/generate-robots.js`:

```js
const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://caasih.net'

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'PerplexityBot',
  'PerplexityBot-User',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'Timpibot',
]

const HEADER = [
  '# Content-Signal directives follow https://contentsignals.org/',
  '# and the IETF draft at https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/',
  '# Revisit when the draft is updated.',
]

const buildRobotsTxt = () => {
  const lines = [...HEADER, '']

  lines.push('User-agent: *')
  lines.push('Allow: /')
  lines.push('Content-Signal: ai-train=yes, search=yes, ai-input=yes')
  lines.push('')

  for (const bot of AI_BOTS) {
    lines.push(`User-agent: ${bot}`)
    lines.push('Allow: /')
    lines.push('')
  }

  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`)
  lines.push('')

  return lines.join('\n')
}

const main = () => {
  const distDir = path.join(__dirname, '..', 'dist')
  const outputPath = path.join(distDir, 'robots.txt')
  fs.mkdirSync(distDir, { recursive: true })
  fs.writeFileSync(outputPath, buildRobotsTxt(), 'utf8')
  console.log(`wrote ${outputPath}`)
}

if (require.main === module) {
  main()
}

module.exports = { buildRobotsTxt }
```

- [ ] **Step 2.4: Run test — expect PASS**

```bash
yarn test scripts/generate-robots.test.js
```

Expected: all assertions pass.

- [ ] **Step 2.5: Smoke-run generator**

```bash
node scripts/generate-robots.js
head -20 dist/robots.txt
```

Expected: file written, header comments visible, `User-agent: *` block present.

- [ ] **Step 2.6: Commit**

```bash
git add scripts/generate-robots.js scripts/generate-robots.test.js
git commit -m "feat(agent-ready): add generate-robots.js with AI bot rules and Content-Signal"
```

---

## Task 3: `generate-sitemap.js`

Glob `dist/**/*.html`, map to canonical URLs, emit `sitemap.xml`. For post paths, prefer `dateModified` from `posts.json` over file mtime.

**Files:**
- Create: `scripts/generate-sitemap.js`
- Create: `scripts/generate-sitemap.test.js`

- [ ] **Step 3.1: Write failing tests (pure helpers first)**

Create `scripts/generate-sitemap.test.js`:

```js
const path = require('path')
const os = require('os')
const fs = require('fs')
const {
  toCanonicalUrl,
  walkHtml,
  buildSitemapXml,
  SKIP_FILES,
} = require('./generate-sitemap')

describe('toCanonicalUrl', () => {
  const siteUrl = 'https://caasih.net'

  test('dist/index.html → site root with trailing slash', () => {
    expect(toCanonicalUrl('dist/index.html', 'dist', siteUrl)).toBe(
      'https://caasih.net/'
    )
  })

  test('dist/posts.html → /posts.html', () => {
    expect(toCanonicalUrl('dist/posts.html', 'dist', siteUrl)).toBe(
      'https://caasih.net/posts.html'
    )
  })

  test('dist/playground/index.html → /playground/', () => {
    expect(toCanonicalUrl('dist/playground/index.html', 'dist', siteUrl)).toBe(
      'https://caasih.net/playground/'
    )
  })

  test('dist/posts/2024-foo.html → /posts/2024-foo.html', () => {
    expect(
      toCanonicalUrl('dist/posts/2024-foo.html', 'dist', siteUrl)
    ).toBe('https://caasih.net/posts/2024-foo.html')
  })
})

describe('walkHtml', () => {
  let tmp
  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-'))
    fs.mkdirSync(path.join(tmp, 'posts'), { recursive: true })
    fs.writeFileSync(path.join(tmp, 'index.html'), '<html></html>')
    fs.writeFileSync(path.join(tmp, '404.html'), '<html></html>')
    fs.writeFileSync(path.join(tmp, '200.html'), '<html></html>')
    fs.writeFileSync(path.join(tmp, 'reusable.html'), '<html></html>')
    fs.writeFileSync(path.join(tmp, 'posts', 'a.html'), '<html></html>')
    fs.writeFileSync(path.join(tmp, 'posts.html'), '<html></html>')
  })
  afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }))

  test('finds HTML files and skips SKIP_FILES', () => {
    const found = walkHtml(tmp).map((p) => path.relative(tmp, p)).sort()
    expect(found).toEqual(['index.html', 'posts.html', 'posts/a.html'])
  })
})

describe('buildSitemapXml', () => {
  const entries = [
    { url: 'https://caasih.net/', lastmod: '2024-01-02' },
    { url: 'https://caasih.net/posts/foo.html', lastmod: '2024-03-04' },
  ]
  const xml = buildSitemapXml(entries)

  test('starts with XML declaration', () => {
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  })

  test('uses sitemaps.org 0.9 xmlns', () => {
    expect(xml).toMatch(
      /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/
    )
  })

  test('each entry becomes <url><loc>…</loc><lastmod>…</lastmod></url>', () => {
    expect(xml).toMatch(
      /<url>\s*<loc>https:\/\/caasih\.net\/<\/loc>\s*<lastmod>2024-01-02<\/lastmod>\s*<\/url>/
    )
    expect(xml).toMatch(
      /<loc>https:\/\/caasih\.net\/posts\/foo\.html<\/loc>/
    )
  })

  test('does not emit priority or changefreq', () => {
    expect(xml).not.toMatch(/<priority>/)
    expect(xml).not.toMatch(/<changefreq>/)
  })
})

describe('SKIP_FILES', () => {
  test('includes 404, 200, reusable', () => {
    expect(SKIP_FILES).toEqual(
      expect.arrayContaining(['404.html', '200.html', 'reusable.html'])
    )
  })
})
```

- [ ] **Step 3.2: Run test — expect FAIL**

```bash
yarn test scripts/generate-sitemap.test.js
```

Expected: module-not-found.

- [ ] **Step 3.3: Implement generator**

Create `scripts/generate-sitemap.js`:

```js
const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://caasih.net'
const SKIP_FILES = ['404.html', '200.html', 'reusable.html']

const walkHtml = (dir) => {
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkHtml(full))
      continue
    }
    if (!entry.name.endsWith('.html')) continue
    if (SKIP_FILES.includes(entry.name)) continue
    out.push(full)
  }
  return out
}

const toCanonicalUrl = (filePath, distDir, siteUrl) => {
  const rel = path.relative(distDir, filePath).split(path.sep).join('/')
  if (rel === 'index.html') return `${siteUrl}/`
  if (rel.endsWith('/index.html')) {
    return `${siteUrl}/${rel.slice(0, -'index.html'.length)}`
  }
  return `${siteUrl}/${rel}`
}

const toIsoDate = (d) => d.toISOString().slice(0, 10)

const pickPostLastmod = (rel, postsByUrl) => {
  const match = rel.match(/^posts\/(.+)\.html$/)
  if (!match) return null
  const slug = match[1]
  const post = postsByUrl[slug]
  if (!post) return null
  const raw = post.dateModified || post.datePublished || post.dateCreated
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : toIsoDate(d)
}

const buildSitemapXml = (entries) => {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const { url, lastmod } of entries) {
    lines.push('  <url>')
    lines.push(`    <loc>${url}</loc>`)
    lines.push(`    <lastmod>${lastmod}</lastmod>`)
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  lines.push('')
  return lines.join('\n')
}

const main = () => {
  const rootDir = path.join(__dirname, '..')
  const distDir = path.join(rootDir, 'dist')
  const postsPath = path.join(rootDir, 'src', 'data', 'posts.json')
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'))
  const postsByUrl = Object.fromEntries(
    posts.filter((p) => p && p.url).map((p) => [p.url, p])
  )

  const files = walkHtml(distDir).sort()
  const entries = files.map((file) => {
    const rel = path.relative(distDir, file).split(path.sep).join('/')
    const postLast = pickPostLastmod(rel, postsByUrl)
    const lastmod =
      postLast || toIsoDate(new Date(fs.statSync(file).mtime))
    return { url: toCanonicalUrl(file, distDir, SITE_URL), lastmod }
  })

  const outputPath = path.join(distDir, 'sitemap.xml')
  fs.writeFileSync(outputPath, buildSitemapXml(entries), 'utf8')
  console.log(`wrote ${outputPath} (${entries.length} URLs)`)
}

if (require.main === module) {
  main()
}

module.exports = {
  SITE_URL,
  SKIP_FILES,
  walkHtml,
  toCanonicalUrl,
  toIsoDate,
  pickPostLastmod,
  buildSitemapXml,
}
```

- [ ] **Step 3.4: Run test — expect PASS**

```bash
yarn test scripts/generate-sitemap.test.js
```

Expected: all pass.

- [ ] **Step 3.5: Commit**

```bash
git add scripts/generate-sitemap.js scripts/generate-sitemap.test.js
git commit -m "feat(agent-ready): add generate-sitemap.js (dist-glob, post dateModified override)"
```

---

## Task 4: `generate-md-twins.js` — phase 1 (manifest)

Probe `src/data/posts/<url>.md` for each public post, write `src/generated/md-twins.json`.

**Files:**
- Create: `scripts/generate-md-twins.js`
- Create: `scripts/generate-md-twins.test.js`

- [ ] **Step 4.1: Write failing test (phase 1)**

Create `scripts/generate-md-twins.test.js`:

```js
const path = require('path')
const os = require('os')
const fs = require('fs')
const { buildManifest } = require('./generate-md-twins')

const makeFixture = () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'md-twins-'))
  const srcData = path.join(tmp, 'src', 'data')
  const srcDataPosts = path.join(srcData, 'posts')
  const generated = path.join(tmp, 'src', 'generated')
  fs.mkdirSync(srcDataPosts, { recursive: true })
  fs.mkdirSync(generated, { recursive: true })
  fs.writeFileSync(path.join(srcDataPosts, 'alpha.md'), '# alpha\n')
  fs.writeFileSync(path.join(srcDataPosts, 'beta.md'), '# beta\n')
  fs.writeFileSync(
    path.join(srcData, 'posts.json'),
    JSON.stringify([
      { url: 'alpha', headline: 'A' },
      { url: 'beta', headline: 'B', private: true },
      { url: 'gamma', headline: 'G' },
    ])
  )
  return { tmp, srcData, srcDataPosts, generated }
}

describe('buildManifest', () => {
  let fx
  beforeEach(() => {
    fx = makeFixture()
  })
  afterEach(() => fs.rmSync(fx.tmp, { recursive: true, force: true }))

  test('includes public posts whose .md source exists', () => {
    const { manifest } = buildManifest({
      postsJsonPath: path.join(fx.srcData, 'posts.json'),
      postsMdDir: fx.srcDataPosts,
    })
    expect(manifest).toEqual({ slugs: ['alpha'] })
  })

  test('omits private posts even if md source exists', () => {
    const { manifest } = buildManifest({
      postsJsonPath: path.join(fx.srcData, 'posts.json'),
      postsMdDir: fx.srcDataPosts,
    })
    expect(manifest.slugs).not.toContain('beta')
  })

  test('omits posts with no md source', () => {
    const { manifest } = buildManifest({
      postsJsonPath: path.join(fx.srcData, 'posts.json'),
      postsMdDir: fx.srcDataPosts,
    })
    expect(manifest.slugs).not.toContain('gamma')
  })

  test('reports public post count and twin count', () => {
    const { totals } = buildManifest({
      postsJsonPath: path.join(fx.srcData, 'posts.json'),
      postsMdDir: fx.srcDataPosts,
    })
    expect(totals).toEqual({ twins: 1, publicPosts: 2 })
  })
})
```

- [ ] **Step 4.2: Run test — expect FAIL**

```bash
yarn test scripts/generate-md-twins.test.js
```

Expected: module-not-found.

- [ ] **Step 4.3: Implement phase 1 only**

Create `scripts/generate-md-twins.js` with `buildManifest` + `writeManifest` only. `copyTwins` is deliberately omitted here; it will be added in Task 5 after its own failing test.

```js
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const DEFAULT_POSTS_JSON = path.join(ROOT, 'src', 'data', 'posts.json')
const DEFAULT_POSTS_MD_DIR = path.join(ROOT, 'src', 'data', 'posts')
const DEFAULT_MANIFEST_PATH = path.join(
  ROOT,
  'src',
  'generated',
  'md-twins.json'
)
const DEFAULT_DIST_POSTS_DIR = path.join(ROOT, 'dist', 'posts')

const loadPosts = (postsJsonPath) =>
  JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'))

const isPublic = (post) => post && post.url && !post.private

const buildManifest = ({ postsJsonPath, postsMdDir }) => {
  const posts = loadPosts(postsJsonPath).filter(isPublic)
  const slugs = []
  for (const post of posts) {
    const candidate = path.join(postsMdDir, `${post.url}.md`)
    if (fs.existsSync(candidate)) slugs.push(post.url)
  }
  return {
    manifest: { slugs },
    totals: { twins: slugs.length, publicPosts: posts.length },
  }
}

const writeManifest = ({
  postsJsonPath = DEFAULT_POSTS_JSON,
  postsMdDir = DEFAULT_POSTS_MD_DIR,
  manifestPath = DEFAULT_MANIFEST_PATH,
} = {}) => {
  const { manifest, totals } = buildManifest({ postsJsonPath, postsMdDir })
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  )
  console.log(
    `manifest: ${totals.twins} twins for ${totals.publicPosts} public posts → ${manifestPath}`
  )
  return { manifest, totals }
}

const main = () => {
  const flag = process.argv[2]
  if (flag === '--manifest') return writeManifest()
  if (flag === '--copy') {
    console.error('--copy not implemented yet (added in Task 5)')
    process.exit(1)
  }
  console.error('usage: generate-md-twins.js [--manifest|--copy]')
  process.exit(1)
}

if (require.main === module) {
  main()
}

module.exports = {
  buildManifest,
  writeManifest,
  DEFAULT_POSTS_JSON,
  DEFAULT_POSTS_MD_DIR,
  DEFAULT_MANIFEST_PATH,
  DEFAULT_DIST_POSTS_DIR,
}
```

- [ ] **Step 4.4: Run test — expect PASS**

```bash
yarn test scripts/generate-md-twins.test.js
```

Expected: phase 1 tests green.

- [ ] **Step 4.5: Smoke-run manifest on real data**

```bash
node scripts/generate-md-twins.js --manifest
cat src/generated/md-twins.json | head -20
```

Expected: JSON with a non-empty `slugs` array; console prints `manifest: N twins for M public posts`.

- [ ] **Step 4.6: Commit phase 1**

```bash
git add scripts/generate-md-twins.js scripts/generate-md-twins.test.js
git commit -m "feat(agent-ready): add generate-md-twins.js phase 1 (manifest)"
```

---

## Task 5: `generate-md-twins.js` — phase 2 (copy)

- [ ] **Step 5.1: Add failing phase-2 test to `scripts/generate-md-twins.test.js`**

Append to the file:

```js
const { copyTwins } = require('./generate-md-twins')

describe('copyTwins', () => {
  let fx
  beforeEach(() => {
    fx = makeFixture()
    fs.writeFileSync(
      path.join(fx.generated, 'md-twins.json'),
      JSON.stringify({ slugs: ['alpha'] })
    )
  })
  afterEach(() => fs.rmSync(fx.tmp, { recursive: true, force: true }))

  test('copies manifest-listed md files to distPostsDir', () => {
    const distPosts = path.join(fx.tmp, 'dist', 'posts')
    const { copied } = copyTwins({
      manifestPath: path.join(fx.generated, 'md-twins.json'),
      postsMdDir: fx.srcDataPosts,
      distPostsDir: distPosts,
    })
    expect(copied).toBe(1)
    expect(fs.readFileSync(path.join(distPosts, 'alpha.md'), 'utf8')).toBe(
      '# alpha\n'
    )
  })

  test('does not copy slugs not in manifest', () => {
    const distPosts = path.join(fx.tmp, 'dist', 'posts')
    copyTwins({
      manifestPath: path.join(fx.generated, 'md-twins.json'),
      postsMdDir: fx.srcDataPosts,
      distPostsDir: distPosts,
    })
    expect(fs.existsSync(path.join(distPosts, 'beta.md'))).toBe(false)
  })
})
```

- [ ] **Step 5.2: Run tests — expect FAIL**

```bash
yarn test scripts/generate-md-twins.test.js
```

Expected: new `copyTwins` tests fail because the function is not yet exported.

- [ ] **Step 5.3: Implement `copyTwins` in `scripts/generate-md-twins.js`**

Inside `scripts/generate-md-twins.js`, add `copyTwins` next to `writeManifest`:

```js
const copyTwins = ({
  manifestPath = DEFAULT_MANIFEST_PATH,
  postsMdDir = DEFAULT_POSTS_MD_DIR,
  distPostsDir = DEFAULT_DIST_POSTS_DIR,
} = {}) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  fs.mkdirSync(distPostsDir, { recursive: true })
  let copied = 0
  for (const slug of manifest.slugs) {
    const src = path.join(postsMdDir, `${slug}.md`)
    const dst = path.join(distPostsDir, `${slug}.md`)
    fs.copyFileSync(src, dst)
    copied += 1
  }
  console.log(`copied ${copied} markdown twins → ${distPostsDir}`)
  return { copied }
}
```

Update `main()` to route `--copy` to `copyTwins()`:

```js
const main = () => {
  const flag = process.argv[2]
  if (flag === '--manifest') return writeManifest()
  if (flag === '--copy') return copyTwins()
  console.error('usage: generate-md-twins.js [--manifest|--copy]')
  process.exit(1)
}
```

Update `module.exports` to include `copyTwins`:

```js
module.exports = {
  buildManifest,
  writeManifest,
  copyTwins,
  DEFAULT_POSTS_JSON,
  DEFAULT_POSTS_MD_DIR,
  DEFAULT_MANIFEST_PATH,
  DEFAULT_DIST_POSTS_DIR,
}
```

- [ ] **Step 5.4: Run tests — expect PASS**

```bash
yarn test scripts/generate-md-twins.test.js
```

Expected: all phase-1 + phase-2 tests green.

- [ ] **Step 5.5: Commit**

```bash
git add scripts/generate-md-twins.js scripts/generate-md-twins.test.js
git commit -m "feat(agent-ready): add generate-md-twins phase 2 (copy)"
```

---

## Task 6: Post component — conditional markdown-twin `<link>`

`src/pages/Post/index.jsx` already uses `<Helmet>`. Add a static import of the manifest (so webpack inlines it) and a conditional `<link>`.

**Files:**
- Modify: `src/pages/Post/index.jsx`

- [ ] **Step 6.1: Ensure manifest exists (non-empty) for webpack to import**

```bash
node scripts/generate-md-twins.js --manifest
ls src/generated/md-twins.json
```

Expected: file exists. Leave it in place for the rest of the plan.

- [ ] **Step 6.2: Edit `src/pages/Post/index.jsx`**

Find:

```js
import profile from 'data/profile.json'
import { index, contents } from 'data/public-post'
```

Add below those imports:

```js
import mdTwinsManifest from '../../generated/md-twins.json'

const mdTwinSlugs = new Set(mdTwinsManifest.slugs)
```

Find the existing Helmet block (around lines 48–53):

```jsx
{
  meta &&
  <Helmet>
    <title>{ meta.headline } - caasih.net</title>
  </Helmet>
}
```

Replace with:

```jsx
{
  meta &&
  <Helmet>
    <title>{ meta.headline } - caasih.net</title>
    {
      mdTwinSlugs.has(pid) &&
      <link rel="alternate" type="text/markdown" href={`/posts/${pid}.md`} />
    }
  </Helmet>
}
```

- [ ] **Step 6.3: Run existing Post tests — ensure nothing broke**

```bash
yarn test src/pages/Post
yarn test src/Root
```

Expected: green (only the pre-existing smoke tests).

- [ ] **Step 6.4: Run lint**

```bash
yarn lint
```

Expected: clean or unchanged.

- [ ] **Step 6.5: Commit**

```bash
git add src/pages/Post/index.jsx
git commit -m "feat(agent-ready): advertise markdown twin via Helmet when manifest lists slug"
```

---

## Task 7: Root — feed discovery `<link>` tags

Add atom + rss + feed+json alternates to the global Helmet in `src/Root/Root.jsx`.

**Files:**
- Modify: `src/Root/Root.jsx`

- [ ] **Step 7.1: Edit `src/Root/Root.jsx`**

Find:

```jsx
<Helmet>
  <title>caasih.net</title>
</Helmet>
```

Replace with:

```jsx
<Helmet>
  <title>caasih.net</title>
  <link rel="alternate" type="application/atom+xml" href="/atom.xml" title="caasih.net Atom feed" />
  <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="caasih.net RSS feed" />
  <link rel="alternate" type="application/feed+json" href="/feed.json" title="caasih.net JSON feed" />
</Helmet>
```

- [ ] **Step 7.2: Run tests**

```bash
yarn test src/Root
```

Expected: green.

- [ ] **Step 7.3: Commit**

```bash
git add src/Root/Root.jsx
git commit -m "feat(agent-ready): advertise atom, rss, and JSON feeds via <link rel=alternate>"
```

---

## Task 8: Wire generators into the `build` chain

Rewire `package.json` `build` so every generator runs in the correct order during `yarn build`.

**Files:**
- Modify: `package.json`

- [ ] **Step 8.1: Edit scripts block**

In `package.json`, replace these lines:

```json
    "build:webpack": "npm run re:build && webpack --config ./build.webpack.config.js",
    "build:snapshot": "react-snapshot --build-dir ./dist",
    "build:feed": "node ./scripts/generate-feed.js",
    "build": "npm run clean && cross-env NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npm run build:webpack && npm run build:snapshot && npm run clean:manifest && npm run build:feed",
```

with:

```json
    "build:md-twins-manifest": "node ./scripts/generate-md-twins.js --manifest",
    "build:webpack": "npm run re:build && webpack --config ./build.webpack.config.js",
    "build:snapshot": "react-snapshot --build-dir ./dist",
    "build:feed": "node ./scripts/generate-feed.js",
    "build:robots": "node ./scripts/generate-robots.js",
    "build:sitemap": "node ./scripts/generate-sitemap.js",
    "build:md-twins": "node ./scripts/generate-md-twins.js --copy",
    "build": "npm run clean && npm run build:md-twins-manifest && cross-env NODE_ENV=production NODE_OPTIONS=--openssl-legacy-provider npm run build:webpack && npm run build:snapshot && npm run clean:manifest && npm run build:feed && npm run build:robots && npm run build:sitemap && npm run build:md-twins",
```

- [ ] **Step 8.2: Sanity-check JSON**

```bash
node -e "console.log(Object.keys(require('./package.json').scripts).filter(k => k.startsWith('build')).sort())"
```

Expected: list includes `build`, `build:feed`, `build:md-twins`, `build:md-twins-manifest`, `build:robots`, `build:sitemap`, `build:snapshot`, `build:webpack`, `build:will`.

- [ ] **Step 8.3: Commit**

```bash
git add package.json
git commit -m "chore(agent-ready): wire robots, sitemap, and md-twins into build chain"
```

---

## Task 9: End-to-end verification

Build the site, spot-check every new artifact.

- [ ] **Step 9.1: Full build**

```bash
yarn build
```

Expected: exits 0; logs from each generator appear; `dist/` populated.

If it fails: diagnose with single steps (`yarn build:md-twins-manifest`, etc.); fix root cause; do NOT add `--no-verify` or suppress errors.

- [ ] **Step 9.2: Verify robots.txt**

```bash
grep -c '^User-agent:' dist/robots.txt
grep -c '^Content-Signal:' dist/robots.txt
grep '^Sitemap:' dist/robots.txt
```

Expected: User-agent count = 18 (wildcard + 17 AI bots); Content-Signal count = 1; Sitemap line points at `https://caasih.net/sitemap.xml`.

- [ ] **Step 9.3: Verify sitemap.xml**

```bash
head -5 dist/sitemap.xml
grep -c '<loc>' dist/sitemap.xml
grep '<loc>https://caasih.net/</loc>' dist/sitemap.xml
grep '<loc>https://caasih.net/continuity.html</loc>' dist/sitemap.xml || echo 'continuity absent — run yarn build:will if wanted'
```

Expected: XML declaration + urlset on lines 1–2; `<loc>` count roughly matches `find dist -name '*.html' | wc -l` minus skip-list; homepage appears.

- [ ] **Step 9.4: Confirm skip-list coverage**

```bash
find dist -name '*.html' | sort > /tmp/dist-html.txt
grep -oE '<loc>[^<]+</loc>' dist/sitemap.xml | sort > /tmp/sitemap-urls.txt
wc -l /tmp/dist-html.txt /tmp/sitemap-urls.txt
```

Expected: HTML count exceeds sitemap count by exactly the number of skipped files (`404.html`, `200.html`, any `reusable.html`). If the gap is larger, inspect which files were skipped and decide whether the skip list needs to grow (per the spec's empirical finalization note).

- [ ] **Step 9.5: Verify markdown twins**

```bash
ls dist/posts/*.md | wc -l
cat src/generated/md-twins.json | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["slugs"]))'
```

Expected: both counts match.

- [ ] **Step 9.6: Verify post HTML advertises its twin**

Pick a slug known to have a twin (from `src/generated/md-twins.json`, e.g. `2026-04-14-react-is-not-haskell`).

```bash
SLUG=$(python3 -c 'import json; print(json.load(open("src/generated/md-twins.json"))["slugs"][0])')
echo "checking $SLUG"
grep -c "type=\"text/markdown\"" "dist/posts/${SLUG}.html"
```

Expected: count = 1.

- [ ] **Step 9.7: Verify post HTML without a twin does NOT advertise one**

```bash
grep -L "type=\"text/markdown\"" dist/posts/*.html | head -5
```

Expected: at least one post without the link tag (any post whose slug is not in the manifest).

- [ ] **Step 9.8: Verify feed discovery on homepage**

```bash
grep 'rel="alternate"' dist/index.html
```

Expected: three matches — atom, rss, feed+json.

- [ ] **Step 9.9: Run full test suite**

```bash
yarn test
```

Expected: all pass, including existing `Root.test.jsx` and any Post tests.

- [ ] **Step 9.10: Run lint**

```bash
yarn lint
```

Expected: clean.

- [ ] **Step 9.11: Commit any cleanup if steps 9.x surfaced issues**

Fix any issues as separate commits per repo convention (one commit per reviewer concern). Do not amend earlier commits.

---

## Task 10: Push + PR

- [ ] **Step 10.1: Push branch**

```bash
gh api repos/:owner/:repo/git/refs/heads/feat/agent-ready >/dev/null 2>&1 || gh repo view --json defaultBranchRef >/dev/null
git push -u origin feat/agent-ready
```

- [ ] **Step 10.2: Open PR**

```bash
gh pr create --title "feat: agent-ready site (robots, sitemap, md twins, feed discovery)" --body "$(cat <<'EOF'
## Summary
- Adds `robots.txt` (AI bot rules + `Content-Signal`), `sitemap.xml` (dist-glob), per-post markdown twins, and feed-discovery `<link>` tags.
- Out of scope (deferred by design): `Link:` response headers, true `Accept: text/markdown` negotiation, API catalog, OAuth/MCP/WebMCP, legacy page resurrection.

## Test plan
- [ ] `yarn test` passes
- [ ] `yarn lint` clean
- [ ] `yarn build` succeeds end-to-end
- [ ] `dist/robots.txt`, `dist/sitemap.xml`, `dist/posts/*.md` present
- [ ] Sample post HTML contains `<link rel="alternate" type="text/markdown">`
- [ ] Homepage HTML contains atom + rss + feed+json `<link>` tags
- [ ] After deploy: `curl https://caasih.net/robots.txt` returns 200 with Sitemap directive
- [ ] Re-run isitagentready.com — items 1, 2, 5, 6 pass

Spec: `docs/superpowers/specs/000-agent-ready-design.md`
Plan: `docs/superpowers/plans/000-agent-ready-plan.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 10.3: Local review loop**

Per user CLAUDE.md PR Review Lifecycle: ask main session to dispatch subagent reviewers before requesting external review; address each reviewer concern as a separate commit.

---

## Notes

- **Keep `src/generated/md-twins.json` out of commits.** `.gitignore` covers it; do not `git add -f`.
- **`yarn build:will` remains a manual step.** Run it before `yarn build` when `src/continuity.jade` changes so `dist/continuity.html` is fresh when the sitemap globs.
- **If `react-snapshot` emits unexpected intermediates** (e.g. `dist/posts/index.html` alongside `dist/posts.html`), extend `SKIP_FILES` in `generate-sitemap.js` and add a regression test. Do this in a dedicated commit.
- **Deploy is unchanged.** `yarn deploy` still runs `gh-pages -t -d dist`. The new artifacts ship automatically.
