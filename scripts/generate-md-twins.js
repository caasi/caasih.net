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
