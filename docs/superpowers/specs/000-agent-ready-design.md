# Agent-Ready caasih.net — Design

## Summary

Make caasih.net legible to AI agents and crawlers by publishing the discovery primitives that work on a static GitHub Pages host. Scope is deliberately narrow: items that require server-side header or content-negotiation control are declared out of scope and deferred until (or if) the origin moves behind a host that supports them.

## Goals

1. Publish a valid `robots.txt` with explicit rules for general and AI-specific crawlers, a `Sitemap:` directive, and `Content-Signal:` declarations.
2. Publish `sitemap.xml` covering every HTML URL currently deployed under `dist/`.
3. Publish per-post markdown twins (`/posts/<slug>.md`) for posts that have a matching `src/md/<slug>.markdown` source, and advertise them via `<link rel="alternate" type="text/markdown">` in the post HTML head.
4. Verify feed discovery: HTML `<head>` exposes `<link rel="alternate">` for `application/atom+xml` and `application/feed+json`. Add if missing.

## Non-Goals

- `Link:` response headers (RFC 8288). GitHub Pages provides no header control.
- True `Accept: text/markdown` content negotiation. No server-side branching on static hosts. Markdown twins are a predictable-URL workaround, not content negotiation.
- API catalog (RFC 9727). No API is exposed; static JSON feeds are advertised through HTML `<link rel="alternate">` already.
- OAuth/OIDC discovery, OAuth Protected Resource Metadata. No authenticated resources exist.
- MCP Server Card. No MCP server exists.
- WebMCP. No site-level tools worth exposing.
- Agent Skills discovery index. No curated skill set to publish.
- Resurrecting un-deployed legacy experiments (`src/ld25`, `src/ld26`, `src/ld28-*`, `src/vr`, `src/reward`, `src/strokes`, `src/ie`, `src/fun-cashier-viewer`). These are not currently present in `dist/` or the `gh-pages` branch and are deliberately excluded from this spec. A separate spec may revive them later.

## Architecture

Three build-time generators plus one component-level change. All artifacts are static files inside `dist/`. No runtime code, no new service, no host migration.

```
src/data/posts.json ─┐
src/md/*.markdown ───┼──► scripts/generate-sitemap.js     ──► dist/sitemap.xml
dist/**/*.html ──────┘    scripts/generate-robots.js      ──► dist/robots.txt
                          scripts/generate-md-twins.js    ──► dist/posts/<slug>.md (subset)
                                                             + dist/.agent-md-twins.json (manifest)

src/pages/Post/*.jsx ───► <Helmet><link rel="alternate" type="text/markdown" ...>
```

Pipeline order, appended to `package.json` `build`:

```
clean
  → build:webpack (includes md-twins manifest emit, pre-snapshot)
  → build:snapshot
  → clean:manifest
  → build:feed
  → build:robots
  → build:sitemap
  → build:md-twins   # writes *.md files from manifest
```

The markdown-twins manifest is emitted **before** `react-snapshot` runs so that the Post component can import the slug list at webpack build time and decide whether to render the alternate link. The actual `.md` file copies happen **after** snapshot.

## Components

### `scripts/generate-robots.js`

Pure constant output. No inputs.

- Wildcard `User-agent: *` block with `Allow: /` and `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.
- Explicit `User-agent` blocks with `Allow: /` for: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, Claude-User, Google-Extended, PerplexityBot, PerplexityBot-User, CCBot, Applebot-Extended, Bytespider, Meta-ExternalAgent, Amazonbot, DuckAssistBot, Timpibot.
- Trailing `Sitemap: https://caasih.net/sitemap.xml`.
- Writes `dist/robots.txt`, UTF-8, LF line endings, no BOM.

### `scripts/generate-sitemap.js`

Dist-glob based: discovers whatever is actually deployed.

- Glob `dist/**/*.html`.
- Skip: `404.html`, `200.html`, `reusable.html`, anything under `node_modules`.
- URL mapping:
  - `dist/index.html` → `https://caasih.net/`
  - `dist/<name>.html` → `https://caasih.net/<name>.html`
  - `dist/<dir>/index.html` → `https://caasih.net/<dir>/`
  - `dist/<dir>/<name>.html` → `https://caasih.net/<dir>/<name>.html`
- `<lastmod>`: default to file mtime. For paths that match `/posts/<slug>.html` and have a corresponding entry in `src/data/posts.json`, override with `dateModified` (falling back to `datePublished`, then `dateCreated`).
- Emits `dist/sitemap.xml` per sitemaps.org 0.9 schema. Root element `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`. No `<priority>`, no `<changefreq>` — scope β treats all deployed pages as equal.

Implication: non-React static pages built manually (`yarn build:will` produces `dist/continuity.html`) are captured automatically as long as they exist in `dist/` when sitemap runs. This is the intended behavior; freshness of manually-built pages remains the author's workflow responsibility.

### `scripts/generate-md-twins.js`

Two-phase script:

**Phase 1 — manifest (pre-snapshot):**
- Read `src/data/posts.json`. For each `!private` entry with a `url`, probe `src/md/<url>.markdown`.
- Emit `dist/.agent-md-twins.json` with shape `{ "slugs": ["<slug>", ...] }`.
- Webpack alias or direct fs read in the Post component consumes this.

**Phase 2 — copy (post-snapshot):**
- For each slug in the manifest, copy `src/md/<slug>.markdown` → `dist/posts/<slug>.md` verbatim (no transform, no frontmatter injection).

The script is invoked twice in the build pipeline. Phase 1 runs inside or just before `build:webpack`; phase 2 runs as `build:md-twins` after snapshot.

### Post component `<Helmet>` change

Locate the post page component (likely under `src/pages/Post/` or `src/pages/Posts/`; identify via grep for `Helmet` usage during implementation).

Change: read the twin manifest at build time; when the current post's slug is in the list, render:

```jsx
<link rel="alternate" type="text/markdown" href={`/posts/${slug}.md`} />
```

Otherwise render nothing. No runtime fetch, no probe.

### Feed discovery verification

Audit whichever component owns the top-level `<head>` (`src/Root/`, `src/index.jade`, or a shared layout). Confirm presence of:

- `<link rel="alternate" type="application/atom+xml" href="/atom.xml" title="...">`
- `<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="...">`
- `<link rel="alternate" type="application/feed+json" href="/feed.json" title="...">`

Add any missing entries. This is a one-line-per-type change.

## Data Flow

**Build time:**

1. `clean` — remove stale bundles.
2. `build:webpack` — ReScript + webpack compile. Emits `md-twins` manifest before snapshot so component can consume it.
3. `build:snapshot` — `react-snapshot` walks routes, writes rendered HTML including the conditional `<link rel="alternate" type="text/markdown">`.
4. `clean:manifest` — drop webpack runtime manifest.
5. `build:feed` — existing: writes `feed.xml`, `feed.json`, `atom.xml`.
6. `build:robots` — writes `robots.txt`.
7. `build:sitemap` — globs `dist/**/*.html`, writes `sitemap.xml`.
8. `build:md-twins` — copies `.md` files per manifest.

**Deploy:** `yarn deploy` → `gh-pages -t -d dist` publishes `dist/` to the `gh-pages` branch. `.md`, `.txt`, `.xml` files are shipped by default.

**Runtime (agent):** agent fetches `/robots.txt` → discovers policy + sitemap location → fetches `/sitemap.xml` → crawls listed URLs → on post HTML, sees `<link rel="alternate" type="text/markdown">` → fetches `/posts/<slug>.md` → indexes clean source.

## Error Handling

- **Missing `src/md/<slug>.markdown`**: expected for most posts. Skip silently. Log count at end: `generated N of M post twins`.
- **Malformed `posts.json` entry** (no `url`, no dates): filter out with a warning. Matches `generate-feed.js` behavior.
- **Unparseable HTML in `dist/`**: not defended against. `react-snapshot` controls the output; user-authored static HTML is trusted.
- **Any generator throws**: non-zero exit. `yarn build` fails fast. No silent fallback.
- **`gh-pages` deploy omits `.md` or `.xml`**: `gh-pages` copies all files by default. Verify once after first deploy; no per-file whitelist expected.

## Testing

### Unit (Jest, colocated `*.test.js`)

- `scripts/generate-robots.test.js` — assert output contains expected User-agent blocks, Content-Signal line, Sitemap directive. Simple regex assertions, no external robots parser.
- `scripts/generate-sitemap.test.js` — fixture mock dist tree + `posts.json`. Assert XML contains expected `<loc>` entries, correct `<lastmod>` for matched posts, valid root element.
- `scripts/generate-md-twins.test.js` — fixture `src/md/foo.markdown` + matching `posts.json` entry → twin copied. Absent md source → no twin, no error. Manifest contains expected slugs.

### Integration (local `yarn build`)

- `dist/robots.txt` exists, contains Sitemap directive, Content-Signal line, expected User-agent groups.
- `dist/sitemap.xml` exists, lists at minimum `/`, `/posts.html`, `/playground.html`, `/continuity.html` (if present), and each `/posts/<slug>.html`.
- `dist/posts/<slug>.md` exists for every slug whose `src/md/<slug>.markdown` exists.
- `dist/posts/<slug>.html` contains `<link rel="alternate" type="text/markdown">` for those same slugs only.
- `dist/index.html` contains feed `<link rel="alternate">` tags.

### Post-deploy manual sanity

- `curl https://caasih.net/robots.txt` → 200, `text/plain`.
- `curl https://caasih.net/sitemap.xml` → 200, `application/xml`.
- `curl https://caasih.net/posts/<slug>.md` → 200, markdown body.
- Re-run isitagentready.com scan. Items 1 (robots.txt), 2 (sitemap.xml), 5 (AI bot rules), 6 (Content Signals) pass. Items 3 (Link headers) and 4 (markdown content negotiation) remain unaddressed — honest result given static host.

## Dependencies

No new runtime dependencies. If `glob` / `fast-glob` is not already transitive, add `fast-glob` as a dev dependency (one package).

## File Inventory

**New:**

- `scripts/generate-robots.js`
- `scripts/generate-robots.test.js`
- `scripts/generate-sitemap.js`
- `scripts/generate-sitemap.test.js`
- `scripts/generate-md-twins.js`
- `scripts/generate-md-twins.test.js`

**Modified:**

- `package.json` — add `build:robots`, `build:sitemap`, `build:md-twins`, `build:md-twins-manifest`; wire into `build`.
- Post page component (location TBD during impl) — conditional `<Helmet>` `<link>`.
- Root layout or equivalent — verify/add feed discovery `<link>` tags.

## Risk Register

| Risk | Mitigation |
| --- | --- |
| Post component location not yet pinpointed | Grep for `Helmet` usage under `src/pages/` during implementation. |
| Manifest-import timing vs. snapshot | Split generator into manifest (pre-snapshot) + copy (post-snapshot) phases. |
| `gh-pages` strips unknown extensions | Defaults copy all files; verify once after first deploy. |
| Sitemap exceeds 50k URLs | Currently ~100 posts + handful of pages. Not a concern. |
| Content-Signal draft spec shifts | Draft status acknowledged. Revisit if spec changes before RFC. |
| Stale `continuity.html` in sitemap | Existing workflow: run `yarn build:will` before `yarn build` when jade source changes. Unchanged. |
| Twin markdown diverges from rendered HTML | Accept: source markdown is authoritative; HTML is a rendering. Agents reading `.md` get the truer form. |

## Future Doors

- If origin moves behind Cloudflare (or any host with Worker/Function support), `Link:` response headers and true `Accept: text/markdown` content negotiation become feasible. The twin `.md` files already in place make content negotiation a trivial Worker addition — same files, new front door.
- Agent Skills discovery index and API catalog become meaningful only if caasih.net grows a real service surface (MCP server, authenticated endpoint, structured data API). Not currently planned.

## Open Questions

None outstanding at spec-write time. Implementation will surface component-level questions (exact Post component file, exact layout file for feed `<link>` tags) that do not affect the design.
