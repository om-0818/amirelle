# Cleanup audit — 16 Sep 2026 19:25 IST

Inventory first. Deletion only from AUTO-DELETE. REVIEW untouched.

No prior `.git`. Canonical lockfile: `package-lock.json` (npm). No yarn.lock / pnpm-lock.yaml / bun.lockb. No CI config. Kept `package-lock.json`.

Hygiene commit: `a43a51b chore: repo hygiene pass` (root commit — this sandbox had no history). Verify after: `npm ci`, `tsc` clean, product suite 281/281, production build ok.

## AUTO-DELETE

By filename pattern only.

| Path | Why |
| --- | --- |
| `.grok/preview.log` | `*.log` — stray debug output, not a doc |
| `.vercel/` | Build output (Nitro vercel preset writes here; same class as `.output/` / `dist/`) |

Not present: `.DS_Store`, `Thumbs.db`, `*.swp`, `*.swo`, `*~`, `*-old.*`, `*-backup.*`, `*.bak`, `*.orig`, `*_v2.*`, `*-copy.*`, `scratch.*`, `temp.*`, `*.tmp`, `dump.*`, `output.txt`, `console-dump.*`, `dist/`, `.output/`, `.vinxi/`, `build/`.

## REVIEW (do not delete)

| Path | Why it stays |
| --- | --- |
| `src/lib/multiplayer/index.ts` | Starter leftover. Nothing in `src` imports it. |
| `src/lib/multiplayer/p2p.ts` | Same. Skill stub. |
| `src/lib/auth/popup.server.ts` | Looks unused by `@/` import. `vite.config.ts` loads it via `ssrLoadModule`. Live. |
| `playwright-report/` | HTML reporter. Not a listed junk pattern. |
| `test-results/` | Playwright last-run. Not a listed junk pattern. |
| `screenshots/` | Session PNGs. Not imported. Useful for humans. |
| `artifacts/` | Empty-ish sandbox folder. |
| `attachments/image.png` | User upload from chat. |
| `.tanstack/tmp` | Generator cache. |
| `.node_modules.lock` | Sandbox lock, not a JS lockfile. |
| `src/routeTree.gen.ts` | Generated, required. |
| `.grok/` (except `preview.log`) | Platform skills / status. |
| `public/__grok/` | PWA assets. |

## Secrets — REQUIRES-HUMAN-REVIEW

Flag only. Not opened further here. Not deleted. Not scrubbed.

- `src/lib/auth/preview.ts` — filename + comments say a live-preview OAuth client secret lives in this file.

See `/docs/REVIEW-REQUIRED.md`.

## Protected (never candidates)

Routes, root/layout, `vite.config.ts`, `tsconfig.json`, `package.json`, `node_modules/`, `/docs` from this session (including this file), `outfit.test.ts` and every other real test.
