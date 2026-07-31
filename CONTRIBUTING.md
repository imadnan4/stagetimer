# Contributing to StageTimer

Thanks for wanting to help! This document explains how the repository is
organized and what every contribution must satisfy before it is merged.

## Repository layout

```
src/               Next.js frontend (static export)
src/app/           Pages (home, /control, /display) + layout + fonts
src/components/    Reusable components (e.g. SupportButton)
src/lib/           Pure helpers (time formatting, session links, WS client)
server/            Express + WebSocket backend (server.js), Dockerfile
tests/             Vitest suites: tests/server (REST + WS) and tests/frontend (jsdom)
scripts/           Build/start helpers
```

## Branching model

```
main        Production. Deployed to Heroku (backend) and Netlify (frontend).
            Protected: never push here directly. Only the maintainer merges
            release-ready work into main.

develop     Integration branch. This is the base every contributor starts from
            and every pull request targets. It always contains the latest
            reviewed work.

feature/*   Your branch, cut from develop:
            git checkout develop && git pull && git checkout -b feature/my-change
```

Pull requests are opened **against `develop`**, never against `main`.

## Development setup

```bash
npm install
npm run dev:all     # starts the Express server + Next dev server
```

Environment variables are documented in `.env.example` — local defaults work
for development without any of them.

## Quality gates (required for every PR)

1. **CodeRabbit review** — the CodeRabbit GitHub App reviews every PR
   automatically (see `.coderabbit.yaml`). **All review comments must be
   resolved** before merging: either fix the issue, or reply to the thread
   with a clear justification for why it is not a real issue and mark it
   resolved. Do not merge with open threads.
2. **Tests pass** — run the full suite locally before pushing:

   ```bash
   npm test
   ```

   All 44+ tests (REST API, webhook signatures, WebSocket flows, frontend
   utilities and components) must pass. Add tests for new behavior in
   `tests/`.
3. **Lint and types are clean**:

   ```bash
   npm run lint
   npx tsc --noEmit
   ```

4. **Optional but recommended** — run CodeRabbit locally before pushing to
   catch issues early:

   ```bash
   npx coderabbitai auth login
   cr review --agent -t uncommitted
   ```

## Commit conventions

Use conventional, lowercase commit messages:

```
feat:   new feature
fix:    bug fix
docs:   documentation
test:   tests
refactor: code change without behavior change
chore:  maintenance, tooling
```

Example: `fix: validate webhook signature over raw request body`.

## License

StageTimer is released under the **MIT License** (see `LICENSE`). Anyone may
use, copy, modify and distribute the software, for free or commercially, but
every copy or substantial portion must retain the copyright notice naming the
original author:

> Copyright (c) 2026 imadnan4 (https://github.com/imadnan4)

If you build on this project, please credit the original author in your
project's README or About page — that is all we ask in return.
