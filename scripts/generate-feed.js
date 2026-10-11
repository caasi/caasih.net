const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://caasih.net'
const DIST_DIR = path.join(__dirname, '..', 'dist')
const POSTS_PATH = path.join(__dirname, '..', 'src', 'data', 'posts.json')
const PROFILE_PATH = path.join(__dirname, '..', 'src', 'data', 'profile.json')

const toDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const stripMarkdown = (content) =>
  content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]*)\)/g, '$1')
    .replace(/[#>*_\-\r]/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const main = async () => {
  const { Feed } = await import('feed')
  const posts = loadJson(POSTS_PATH)
  const profile = loadJson(PROFILE_PATH)
  const authorName = profile.alternateName || profile.name || 'caasi'

  const publicPosts = posts
    .filter((post) => !post.private && post.url && post.headline)
    .map((post) => {
      const publishedDate = toDate(post.datePublished || post.dateCreated || post.dateModified)
      const updatedDate = toDate(post.dateModified || post.datePublished || post.dateCreated)
      return {
        ...post,
        publishedDate,
        updatedDate,
      }
    })
    .filter((post) => post.publishedDate)
    .sort((left, right) => right.publishedDate.getTime() - left.publishedDate.getTime())

  const feedUpdated = publicPosts.reduce(
    (latest, post) =>
      post.updatedDate && post.updatedDate > latest ? post.updatedDate : latest,
    new Date(0),
  )

  const feed = new Feed({
    id: SITE_URL,
    link: SITE_URL,
    title: 'caasih.net',
    description: 'Personal site for interactive writing, archives, and sketches',
    language: 'zh-TW',
    updated: feedUpdated,
    generator: 'feed',
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
      atom: `${SITE_URL}/atom.xml`,
      json: `${SITE_URL}/feed.json`,
    },
    author: {
      name: authorName,
      email: (profile.email || '').replace(/^mailto:/, ''),
      link: SITE_URL,
    },
  })

  for (const post of publicPosts) {
    const postUrl = `${SITE_URL}/posts/${post.url}`
    const markdownPath = path.join(
      __dirname,
      '..',
      'src',
      'data',
      'posts',
      `${post.url}.md`,
    )
    const markdownContent = fs.existsSync(markdownPath)
      ? fs.readFileSync(markdownPath, 'utf8')
      : ''
    const description = stripMarkdown(markdownContent).slice(0, 280)

    feed.addItem({
      id: postUrl,
      link: postUrl,
      title: post.headline,
      description,
      date: post.publishedDate,
    })
  }

  fs.mkdirSync(DIST_DIR, { recursive: true })
  fs.writeFileSync(path.join(DIST_DIR, 'feed.xml'), feed.rss2(), 'utf8')
  fs.writeFileSync(path.join(DIST_DIR, 'atom.xml'), feed.atom1(), 'utf8')
  fs.writeFileSync(path.join(DIST_DIR, 'feed.json'), feed.json1(), 'utf8')

  console.log(`Generated feeds for ${publicPosts.length} public posts in ${DIST_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
