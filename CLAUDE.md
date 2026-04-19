# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/` with entrypoints such as `index.jsx` and `Root/`. Feature code sits in `components/`, `pages/`, and `store/`; content is under `data/` and `md/`. Legacy/static surfaces live in directories like `src/ld25`, `src/ld26`, `src/ld28-*`, `vr/`, `reward/`, `strokes/`, and old templates such as `src/*.jade`; treat these as preservation targets, not rewrite candidates. `.bs.js` files are generated from Reason/ReScript—leave them untouched. Vendor utilities stay in `lib/`, configs in `config/`, and `dist/`, `output/`, `coverage/` are disposable outputs.

## Build, Test, and Development Commands
- `yarn start` – launch webpack dev server plus the ReScript watcher.
- `yarn dev` – regenerate the md-twins manifest, clean stale bundles, then run the development webpack build once. The manifest step is idempotent (no rewrite when content is unchanged) so webpack's file watcher is not invalidated on repeated boots.
- `yarn build` – production pipeline: `build:md-twins-manifest` → `build:webpack` → `build:snapshot` (`react-snapshot`) → `clean:manifest` → `build:feed` (RSS via `scripts/generate-feed.js`) → `build:robots` → `build:sitemap` → `build:md-twins`. The md-twins manifest lands at `src/generated/md-twins.json` (gitignored) so the Post component can advertise its markdown twin at bundle time. Both `yarn start` and `yarn dev` regenerate the manifest automatically, so fresh clones need no extra prep.
- `yarn build:will` – compile `src/continuity.jade` into `dist/` when continuity content changes.
- `yarn test` – Jest single run; `yarn test -- --watch` for iteration; `yarn test -- --coverage` before major submissions.
- `yarn deploy` – publish `dist/` to GitHub Pages via `gh-pages` (runs `yarn build` first through `predeploy`).
- `yarn lint` / `yarn prettier` – enforce ESLint and Prettier defaults before pushing.
- `yarn re:build` – regenerate Reason/ReScript output when the watcher is stopped.

## Toolchain Pinning
- Node 20 LTS required (`.nvmrc`, `engines: ">=20 <25"` in `package.json`).
- Yarn 4 via `packageManager: yarn@4.10.2` and `.yarnrc.yml`.
- TypeScript supported alongside JS/ReScript (`tsconfig.json`, `jest-ts-transform.js`; `.ts`/`.tsx` covered by `yarn prettier`).
- `AGENTS.md` is a symlink to `CLAUDE.md` — edit `CLAUDE.md` only.

## Coding Style & Naming Conventions
The repository Prettier profile enforces two-space indent, single quotes, no semicolons, and ES5 trailing commas. Keep React components PascalCase with colocated `index.css` styles. Reason/ReScript modules expose camelCase bindings; never edit the compiled neighbours. Prefer surgical fixes over large refactors in legacy areas; avoid class-to-hooks rewrites or framework churn unless explicitly requested for the touched page. Run `yarn lint` to catch React/JS concerns.

## Legacy Preservation Policy
This repository intentionally keeps older technology to preserve existing static pages and historical experiments.
- Preserve URL structure, rendered markup shape, and page behavior for archived content unless a task explicitly allows breaking changes.
- Do not remove legacy directories, old templates, or build scripts just because they look outdated.
- Avoid dependency/toolchain major upgrades as drive-by changes; propose them separately with clear migration and rollback notes.
- When touching legacy pages, prefer minimal, local edits and document any behavior change in the PR description.
- Treat `NODE_OPTIONS=--openssl-legacy-provider` usage as deliberate compatibility glue in current scripts.

## Agent-Readiness Scope
This site is a static build hosted on GitHub Pages behind Cloudflare; it has no API, no auth, and no MCP server. The `isitagentready.com` scanner targets API/agent-serving sites, so a low score is expected and acceptable here.
- In scope: `robots.txt` (with User-agent rules, AI-bot rules, `Content-Signal`, and `Sitemap:`), `sitemap.xml`, RSS/Atom feeds, and per-post markdown twins at `/posts/{slug}.md`.
- Out of scope: `Link` response headers, `Accept: text/markdown` negotiation, `/.well-known/api-catalog`, OAuth discovery, OAuth protected-resource metadata, MCP server card, agent-skills index, and WebMCP. These require either edge logic (Worker/Transform Rule) or real backing services; do not fabricate them to chase scanner points.
- If a future change introduces a real API, MCP server, or edge layer, revisit this list then — not before.

## Polyglot Contributions
Treat the site as a multi-language playground: JavaScript, TypeScript, PureScript, ReScript, or any toolchain that compiles to HTML/CSS/JS is welcome. When adding a language, document the build steps and shared targets so other contributors can reproduce the pipeline.

## Testing Guidelines
Jest powers unit tests; see `src/Root/Root.test.jsx` for structure. Add new suites as `*.test.jsx` beside the code they exercise. Use `yarn test` for single runs, `yarn test -- --watch` while iterating, and `yarn test -- --coverage` before major submissions. For legacy/static edits, also run `yarn build` and spot-check affected pages in `dist/`.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) with imperative, scoped messages under 72 characters. Pull requests should summarise changes, list verification steps (commands, screenshots for visuals), and link issues or posts. Call out legacy pages/routes touched and whether behavior is intentionally unchanged. Ensure `yarn build` and `yarn test` pass locally before requesting review.

## Deployment & Snapshot Notes
Production builds rely on `react-snapshot`; run `yarn build` to refresh `dist/` and inspect output before publishing. `yarn deploy` pushes the snapshot to GitHub Pages. Adjust `reactSnapshot.snapshotDelay` only when new pages need extra render time.
