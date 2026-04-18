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
