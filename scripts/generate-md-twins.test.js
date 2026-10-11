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

const { writeManifest, copyTwins } = require('./generate-md-twins')

describe('writeManifest idempotence', () => {
  let fx
  beforeEach(() => {
    fx = makeFixture()
  })
  afterEach(() => fs.rmSync(fx.tmp, { recursive: true, force: true }))

  const args = () => ({
    postsJsonPath: path.join(fx.srcData, 'posts.json'),
    postsMdDir: fx.srcDataPosts,
    manifestPath: path.join(fx.generated, 'md-twins.json'),
  })

  test('writes manifest on first run', () => {
    const { wrote } = writeManifest(args())
    expect(wrote).toBe(true)
    expect(fs.existsSync(args().manifestPath)).toBe(true)
  })

  test('skips write when content is unchanged', () => {
    writeManifest(args())
    const before = fs.statSync(args().manifestPath).mtimeMs
    const { wrote } = writeManifest(args())
    const after = fs.statSync(args().manifestPath).mtimeMs
    expect(wrote).toBe(false)
    expect(after).toBe(before)
  })
})

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

  test('prunes stale *.md already present in distPostsDir', () => {
    const distPosts = path.join(fx.tmp, 'dist', 'posts')
    fs.mkdirSync(distPosts, { recursive: true })
    fs.writeFileSync(path.join(distPosts, 'stale.md'), '# stale\n')
    fs.writeFileSync(
      path.join(distPosts, 'private-leak.md'),
      '# was private\n'
    )
    const { copied, pruned } = copyTwins({
      manifestPath: path.join(fx.generated, 'md-twins.json'),
      postsMdDir: fx.srcDataPosts,
      distPostsDir: distPosts,
    })
    expect(pruned).toBe(2)
    expect(copied).toBe(1)
    expect(fs.existsSync(path.join(distPosts, 'stale.md'))).toBe(false)
    expect(fs.existsSync(path.join(distPosts, 'private-leak.md'))).toBe(false)
    expect(fs.existsSync(path.join(distPosts, 'alpha.md'))).toBe(true)
  })

  test('preserves non-markdown siblings (post HTML) in distPostsDir', () => {
    const distPosts = path.join(fx.tmp, 'dist', 'posts')
    fs.mkdirSync(distPosts, { recursive: true })
    fs.writeFileSync(path.join(distPosts, 'alpha.html'), '<html></html>')
    copyTwins({
      manifestPath: path.join(fx.generated, 'md-twins.json'),
      postsMdDir: fx.srcDataPosts,
      distPostsDir: distPosts,
    })
    expect(fs.existsSync(path.join(distPosts, 'alpha.html'))).toBe(true)
  })
})
