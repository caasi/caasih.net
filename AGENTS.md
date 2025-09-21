# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/` with entrypoints such as `index.jsx` and `Root/`. Feature code sits in `components/`, `pages/`, and `store/`; content is under `data/` and `md/`. `.bs.js` files are generated from Reason/ReScript—leave them untouched. Vendor utilities stay in `lib/`, configs in `config/`, and `dist/`, `output/`, `coverage/` are disposable outputs.

## Build, Test, and Development Commands
- `yarn start` – launch webpack dev server plus the ReScript watcher.
- `yarn dev` – clean stale bundles, then run the development webpack build once.
- `yarn build` – run the production pipeline (`build:webpack`, `react-snapshot`, manifest cleanup).
- `yarn lint` / `yarn prettier` – enforce ESLint and Prettier defaults before pushing.
- `yarn re:build` – regenerate Reason/ReScript output when the watcher is stopped.

## Coding Style & Naming Conventions
The repository Prettier profile enforces two-space indent, single quotes, no semicolons, and ES5 trailing commas. Keep React components PascalCase with colocated `index.css` styles. Reason/ReScript modules expose camelCase bindings; never edit the compiled neighbours. Run `yarn lint` to catch React/JS concerns.

## Polyglot Contributions
Treat the site as a multi-language playground: JavaScript, TypeScript, PureScript, ReScript, or any toolchain that compiles to HTML/CSS/JS is welcome. When adding a language, document the build steps and shared targets so other contributors can reproduce the pipeline.

## Testing Guidelines
Jest powers unit tests; see `src/Root/Root.test.jsx` for structure. Add new suites as `*.test.jsx` beside the code they exercise. Use `yarn test` for single runs, `yarn test -- --watch` while iterating, and `yarn test -- --coverage` before major submissions.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) with imperative, scoped messages under 72 characters. Pull requests should summarise changes, list verification steps (commands, screenshots for visuals), and link issues or posts. Ensure `yarn build` and `yarn test` pass locally before requesting review.

## Deployment & Snapshot Notes
Production builds rely on `react-snapshot`; run `yarn build` to refresh `dist/` and inspect output before publishing. `yarn deploy` pushes the snapshot to GitHub Pages. Adjust `reactSnapshot.snapshotDelay` only when new pages need extra render time.
