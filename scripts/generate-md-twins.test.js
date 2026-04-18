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
