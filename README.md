# caasih.net

[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]

This is my site. There are many like it, but this one is mine.

Personal site for experimenting with interactive writing, Ludum Dare archives, and web sketches. The repository currently runs on a React 17 + ReasonML stack bundled by Webpack 4, with static builds produced through `react-snapshot`.

## Current Stack Snapshot
- React 17, React Router 5, class-heavy components, and legacy lifecycle usage.
- ReasonML (`bs-platform@8`) generating `.bs.js` alongside source; JavaScript lives in `src/` with CSS modules.
- Webpack 4 configuration in `config/`, `webpack.config.js`, and `build.webpack.config.js`, plus custom static snapshot step.
- Jest 24/Enzyme tests and Travis CI badges that no longer reflect the actual deployment flow.

## Modernization Roadmap
1. **Baseline cleanup** - Drop unused vendor files in `lib/`, prune generated artefacts from git, and document required Node/Yarn versions. Replace Travis badges with GitHub Actions.
2. **Toolchain upgrade** - Move to Node 20 LTS and Yarn Berry or pnpm; replace Webpack 4 + react-snapshot with Vite (SSR + static export) or Astro for a faster iteration loop.
3. **React & routing refresh** - Upgrade to React 18, adopt React Router 6 (or a file-based router if migrating to Astro/Next), and migrate class components to functional components with hooks where practical.
4. **Polyglot workflow** - Treat the project as a multi-language playground: ensure the build stays friendly to code authored in JavaScript, TypeScript, PureScript, ReScript, Elm, Svelte, MDX, or any language that compiles to HTML, CSS, and JS. Document integration patterns, shared build targets, and module boundaries so contributors can mix paradigms safely.
5. **Lang & type strategy** - Decide between modern ReScript (latest compiler + `rescript-lang` ecosystem) or a full TypeScript migration while honouring the polyglot goal. If staying with ReScript, update to `rescript@11`, relocate generated files to `lib/` or `node_modules/.cache`, and simplify interoperability.
6. **Styling and assets** - Consolidate CSS modules or adopt Tailwind/CSS-in-JS, replace manual asset pipelines, and introduce image optimisation in the static build.
7. **Testing & QA** - Upgrade to Jest 29 with React Testing Library, add Playwright or Cypress for interactive pages, and enforce coverage thresholds via CI.
8. **Content & deployment** - Reimport Ludum Dare games, rebuild the continuity page, and migrate deployment to GitHub Pages via GitHub Actions or to a modern static host (Netlify/Vercel).

## Local Development (Legacy)
- `yarn start` – webpack dev server + ReScript watcher.
- `yarn dev` – one-off development build without snapshotting.
- `yarn build` – production webpack bundle + `react-snapshot` export.
- `yarn test` – run Jest 24 suites.

These commands remain for reference until the modernization work replaces the toolchain.

## Content Backlog
- [ ] port Ludum Dare games
- [ ] port the continuity page
- [ ] move ^C posts here
- [ ] add a links page

Contributions aimed at the modernization roadmap should open an issue or discussion first to coordinate the migration path and avoid duplicated work.

[travis-image]: https://img.shields.io/travis/caasi/caasih.net.svg
[travis-url]: https://travis-ci.org/caasi/caasih.net
[codecov-image]: https://img.shields.io/codecov/c/github/caasi/caasih.net.svg
[codecov-url]: https://codecov.io/gh/caasi/caasih.net
