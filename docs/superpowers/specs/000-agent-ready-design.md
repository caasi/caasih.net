# Agent-Ready caasih.net — Design

## Summary

Make caasih.net legible to AI agents and crawlers by publishing the discovery primitives that work on a static GitHub Pages host. Scope is deliberately narrow: items that require server-side header or content-negotiation control are declared out of scope and deferred until (or if) the origin moves behind a host that supports them.

## Goals

1. Publish a valid `robots.txt` with explicit rules for general and AI-specific crawlers, a `Sitemap:` directive, and `Content-Signal:` declarations.
2. Publish `sitemap.xml` covering every HTML URL currently deployed under `dist/`.
3. Publish per-post markdown twins (`/posts/<slug>.md`) for posts that have a matching `src/data/posts/<slug>.md` source, and advertise them via `<link rel="alternate" type="text/markdown">` in the post HTML head.
4. Add feed discovery: HTML `<head>` exposes `<link rel="alternate">` for `application/atom+xml`, `application/rss+xml`, and `application/feed+json`. Confirmed absent today; this spec adds them unconditionally.

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
src/data/posts/*.md ─┼──► scripts/generate-sitemap.js     ──► dist/sitemap.xml
dist/**/*.html ──────┘    scripts/generate-robots.js      ──► dist/robots.txt
                          scripts/generate-md-twins.js    ──► phase 1: src/generated/md-twins.json (manifest)
                                                             phase 2: dist/posts/<slug>.md (copies)

src/pages/Post/*.jsx ───► <Helmet><link rel="alternate" type="text/markdown" ...>
```

Pipeline order, appended to `package.json` `build`:

```
clean
  → build:md-twins-manifest    # phase 1: write src/generated/md-twins.json
  → build:webpack              # webpack imports manifest → inlined into bundle
  → build:snapshot             # react-snapshot renders HTML with conditional <link>
  → clean:manifest
  → build:feed
  → build:robots
  → build:sitemap
  → build:md-twins             # phase 2: copy src/data/posts/<slug>.md → dist/posts/<slug>.md
```

The manifest is written to `src/generated/md-twins.json` (not `dist/`, because `clean` wipes `dist/` and webpack cannot import from `dist/` anyway — webpack needs a source-tree path it can resolve at compile time). `src/generated/` is gitignored. Phase 1 must precede `build:webpack` so the manifest is bundled into the JS. Phase 2 (the actual `.md` copies) can run any time after `build:snapshot`; placed near the end for clarity.

## Components

### `scripts/generate-robots.js`

Pure constant output. No inputs.

- Wildcard `User-agent: *` block with `Allow: /` and `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.
- Explicit `User-agent` blocks with `Allow: /` for: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, Claude-User, Google-Extended, PerplexityBot, PerplexityBot-User, CCBot, Applebot-Extended, Bytespider, Meta-ExternalAgent, Amazonbot, DuckAssistBot, Timpibot.
- Trailing `Sitemap: https://caasih.net/sitemap.xml`.
- Writes `dist/robots.txt`, UTF-8, LF line endings, no BOM.
- Leading comment line citing source URLs for `Content-Signal` (https://contentsignals.org/) and the IETF draft (https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/) so future maintainers can re-check when the draft moves.

### `scripts/generate-sitemap.js`

Dist-glob based: discovers whatever is actually deployed.

- Glob `dist/**/*.html`.
- Skip: `404.html`, `200.html`, `reusable.html`, anything under `node_modules`. The exact skip list is confirmed against a real `yarn build` output during implementation — react-snapshot may emit intermediates (e.g. `dist/posts/index.html` alongside `dist/posts.html`) that also need exclusion. Finalize the skip list empirically, not by guess.
- URL mapping:
  - `dist/index.html` → `https://caasih.net/`
  - `dist/<name>.html` → `https://caasih.net/<name>.html`
  - `dist/<dir>/index.html` → `https://caasih.net/<dir>/`
  - `dist/<dir>/<name>.html` → `https://caasih.net/<dir>/<name>.html`
- `<lastmod>`: default to file mtime. For paths that match `/posts/<slug>.html` and have a corresponding entry in `src/data/posts.json`, override with `dateModified` (falling back to `datePublished`, then `dateCreated`).
- Emits `dist/sitemap.xml` per sitemaps.org 0.9 schema. Root element `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`. No `<priority>`, no `<changefreq>` — scope β treats all deployed pages as equal.

Implication: non-React static pages built manually (`yarn build:will` produces `dist/continuity.html`) are captured automatically as long as they exist in `dist/` when sitemap runs. This is the intended behavior; freshness of manually-built pages remains the author's workflow responsibility.

### `scripts/generate-md-twins.js`

Two-phase script, invoked as two separate npm scripts in the build pipeline.

**Phase 1 — manifest (`build:md-twins-manifest`, runs before `build:webpack`):**
- Read `src/data/posts.json`. For each `!private` entry with a `url`, probe `src/data/posts/<url>.md`.
- Emit `src/generated/md-twins.json` with shape `{ "slugs": ["<slug>", ...] }`.
- Path choice: `src/generated/` is inside the webpack source tree (resolvable at compile time) and survives `clean` (which only touches `dist/`). The directory is gitignored.
- Invocation: `node scripts/generate-md-twins.js --manifest`.

**Phase 2 — copy (`build:md-twins`, runs after `build:snapshot`):**
- Read the manifest emitted in phase 1.
- For each slug, copy `src/data/posts/<slug>.md` → `dist/posts/<slug>.md` verbatim (no transform, no frontmatter injection).
- Invocation: `node scripts/generate-md-twins.js --copy`.

The two phases share one script for code reuse and testability; the CLI flag picks the phase.

### Post component `<Helmet>` change

Locate the post page component (likely under `src/pages/Post/` or `src/pages/Posts/`; identify via grep for `Helmet` usage during implementation).

Change: `import manifest from '../../generated/md-twins.json'` (exact relative path depends on component location) so webpack inlines the slug list into the bundle at compile time — `react-snapshot` renders the built bundle in a headless browser and has no Node `fs` access, so runtime probing is not an option.

When the current post's slug is in the list, render:

```jsx
<link rel="alternate" type="text/markdown" href={`/posts/${slug}.md`} />
```

Otherwise render nothing. No runtime fetch, no fs probe.

### Feed discovery `<link>` tags

`grep -ri "rel=\"alternate\"" src/` returns zero hits at spec-write time — the current site ships no feed discovery at all despite `build:feed` emitting `atom.xml`, `feed.xml`, and `feed.json`. This spec adds them unconditionally.

Target: `src/Root/` (the top-level Helmet host). Add:

- `<link rel="alternate" type="application/atom+xml" href="/atom.xml" title="caasih.net Atom feed">`
- `<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="caasih.net RSS feed">`
- `<link rel="alternate" type="application/feed+json" href="/feed.json" title="caasih.net JSON feed">`

All three formats are already emitted, so advertising all three is correct.

## Data Flow

**Build time:**

1. `clean` — remove stale bundles from `dist/`.
2. `build:md-twins-manifest` — probe `src/data/posts/<slug>.md` for each public post; write `src/generated/md-twins.json`.
3. `build:webpack` — ReScript + webpack compile. Webpack statically imports the manifest from `src/generated/md-twins.json`, inlining the slug list into the bundle.
4. `build:snapshot` — `react-snapshot` walks routes, writes rendered HTML including the conditional `<link rel="alternate" type="text/markdown">` where the slug is in the manifest.
5. `clean:manifest` — drop webpack runtime manifest.
6. `build:feed` — existing: writes `feed.xml`, `feed.json`, `atom.xml`.
7. `build:robots` — writes `robots.txt`.
8. `build:sitemap` — globs `dist/**/*.html`, writes `sitemap.xml`.
9. `build:md-twins` — copies `src/data/posts/<slug>.md` → `dist/posts/<slug>.md` for each slug in the manifest.

**Deploy:** `yarn deploy` → `gh-pages -t -d dist` publishes `dist/` to the `gh-pages` branch. `.md`, `.txt`, `.xml` files ship by default. The `-t` flag includes dotfiles but the twins manifest lives in `src/generated/`, not `dist/`, so nothing build-intermediate leaks.

**Runtime (agent):** agent fetches `/robots.txt` → discovers policy + sitemap location → fetches `/sitemap.xml` → crawls listed URLs → on post HTML, sees `<link rel="alternate" type="text/markdown">` → fetches `/posts/<slug>.md` → indexes clean source.

## Error Handling

- **Missing `src/data/posts/<slug>.md`**: expected for some posts (early entries without source markdown). Skip silently. Log count at end: `generated N of M post twins`.
- **Malformed `posts.json` entry** (no `url`, no dates): filter out with a warning. Matches `generate-feed.js` behavior.
- **Unparseable HTML in `dist/`**: not defended against. `react-snapshot` controls the output; user-authored static HTML is trusted.
- **Any generator throws**: non-zero exit. `yarn build` fails fast. No silent fallback.
- **`gh-pages` deploy omits `.md` or `.xml`**: `gh-pages` copies all files by default. Verify once after first deploy; no per-file whitelist expected.

## Testing

### Unit (Jest, colocated `*.test.js`)

- `scripts/generate-robots.test.js` — assert output contains expected User-agent blocks, Content-Signal line, Sitemap directive. Simple regex assertions, no external robots parser.
- `scripts/generate-sitemap.test.js` — fixture mock dist tree + `posts.json`. Assert XML contains expected `<loc>` entries, correct `<lastmod>` for matched posts, valid root element.
- `scripts/generate-md-twins.test.js` — fixture `src/data/posts/foo.md` + matching `posts.json` entry → twin copied, manifest contains slug. Absent md source → slug omitted from manifest, no copy, no error. Phase 1 and phase 2 tested independently.

### Integration (local `yarn build`)

- `dist/robots.txt` exists, contains Sitemap directive, Content-Signal line, expected User-agent groups.
- `dist/sitemap.xml` exists, lists at minimum `/`, `/posts.html`, `/playground.html`, `/continuity.html` (if present), and each `/posts/<slug>.html`.
- `dist/posts/<slug>.md` exists for every slug whose `src/data/posts/<slug>.md` exists and appears in `posts.json` as non-private.
- `dist/posts/<slug>.html` contains `<link rel="alternate" type="text/markdown">` for those same slugs only.
- `dist/index.html` contains atom + rss + feed+json `<link rel="alternate">` tags.

### Post-deploy manual sanity

- `curl https://caasih.net/robots.txt` → 200, non-empty body containing Sitemap directive.
- `curl https://caasih.net/sitemap.xml` → 200, non-empty body parseable as XML. (Accept either `application/xml` or `text/xml` — GitHub Pages may serve either.)
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
- `scripts/generate-md-twins.js` (handles both `--manifest` and `--copy` via CLI flag)
- `scripts/generate-md-twins.test.js`
- `src/generated/.gitkeep` (placeholder; actual `md-twins.json` is gitignored build output)

**Modified:**

- `package.json` — add `build:md-twins-manifest`, `build:robots`, `build:sitemap`, `build:md-twins`; rewire `build` chain.
- `.gitignore` — add `src/generated/md-twins.json`.
- Post page component (location TBD during impl; identify via grep for `Helmet` in `src/pages/`) — conditional `<Helmet>` `<link rel="alternate" type="text/markdown">`.
- `src/Root/` — add unconditional atom + rss + feed+json `<link rel="alternate">` tags.

## Risk Register

| Risk | Mitigation |
| --- | --- |
| Post component location not yet pinpointed | Grep for `Helmet` usage under `src/pages/` during implementation. |
| Manifest-import timing vs. snapshot | Split generator into phase 1 (manifest, pre-webpack) + phase 2 (copy, post-snapshot). Manifest lives in `src/generated/` so webpack can resolve it statically; `dist/` would not work because `clean` wipes it and webpack cannot import from there anyway. |
| `gh-pages` strips unknown extensions | Defaults copy all files; verify once after first deploy. |
| Sitemap exceeds 50k URLs | Currently ~100 posts + handful of pages. Not a concern. |
| Content-Signal draft spec shifts | Draft status acknowledged. Generator emits a leading comment with draft-URL so regeneration is trivial. Revisit before the draft hits RFC. |
| Stale `continuity.html` in sitemap | Existing workflow: run `yarn build:will` before `yarn build` when jade source changes. Unchanged. |
| Twin markdown diverges from rendered HTML | Accept: source markdown is authoritative; HTML is a rendering. Agents reading `.md` get the truer form. |
| react-snapshot emits unexpected HTML intermediates | Skip list in sitemap generator finalized empirically against real `yarn build` output, not by guess. |

## Future Doors

- If origin moves behind Cloudflare (or any host with Worker/Function support), `Link:` response headers and true `Accept: text/markdown` content negotiation become feasible. The twin `.md` files already in place make content negotiation a trivial Worker addition — same files, new front door.
- Agent Skills discovery index and API catalog become meaningful only if caasih.net grows a real service surface (MCP server, authenticated endpoint, structured data API). Not currently planned.

## Open Questions

None outstanding at spec-write time. Implementation will surface component-level questions (exact Post component file, exact layout file for feed `<link>` tags) that do not affect the design.
