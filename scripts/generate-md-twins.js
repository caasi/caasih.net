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

const main = () => {
  const flag = process.argv[2]
  if (flag === '--manifest') return writeManifest()
  if (flag === '--copy') return copyTwins()
  console.error('usage: generate-md-twins.js [--manifest|--copy]')
  process.exit(1)
}

if (require.main === module) {
  main()
}

module.exports = {
  buildManifest,
  writeManifest,
  copyTwins,
  DEFAULT_POSTS_JSON,
  DEFAULT_POSTS_MD_DIR,
  DEFAULT_MANIFEST_PATH,
  DEFAULT_DIST_POSTS_DIR,
}
