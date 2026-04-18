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
