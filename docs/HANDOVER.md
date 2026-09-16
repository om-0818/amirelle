# Amirelle handover — 15 Sep 2026 16:10 IST

India-first AI style desk. Not a chatbot. Not a Pinterest clone. React 19 + TanStack Start + Zustand + Tailwind v4 + Better Auth. Local-first closet.

## What shipped this session

Engine: every look path through `validateLook`; gym/work/wedding kits; minor safety in the engine; keep/cut names real pieces; grill falls back to a legal plate; 1 free sitting/day on India civil midnight.

Clock: `Asia/Kolkata` only. No DST. No festival names. Week strip and CPW from real wears.

Rail: ~100 cuts × 6 cats × ~20 houses. Still audit. Taste loop is wired (10 Not-this sours a category). Pins are the exact id. Closet photos are data URLs; quota speaks. Privacy export/wipe covers every `STORAGE_KEYS` row.

Desk: Today auto-plates; H/A/N; membership ₹999 / ₹8,990 preview unlock, no card; practice / looks / journal empty states; error boundaries on `/`, `/login`, root; 3:4 plate that does not jump.

**Regression:** product suite **182 / 182 pass**, including the composition property test at **2000** plates. `outfit.test.ts` green.

**Screen walk:** Chromium on `/` and `/login` — login/welcome paint, 0 `pageerror`. Continue hits Google OAuth (auth is ON), so Closet / Look / Looks / Practice / Journal / Membership / Privacy were not clicked live. Those screens are covered by `desk-screens`, `membership`, `privacy`, `closet-local`, `today-desk` tests.

## Assumptions logged this session

From `/docs/LOG.md`, condensed:

1. A plate that cannot finish stays empty. The house rail is rich enough that 2000 random legal (gen × occ × gender × weather) plates all `fit.ok`.
2. A pin means “prefer if legal,” never “force a veto.”
3. Collage of rail stills satisfies NO GENERATION. New looks set `lastVisual: null`.
4. `vibe` in code is the occasion label. Members never see the word.
5. `GENERATIONS.gen` nicknames stay in data; they are not a look.
6. Instant `new Date()` is allowed inside `clock.ts` / sitting defaults. Screens must not call `toLocaleDateString` without `HOUSE_TZ`.
7. IST 23:59 = UTC 18:29; 00:01 = UTC 18:31. Atelier is unmetered.
8. Complimentary still plates Today. The sitting meter is not a paywall on the look.
9. Preview membership unlocks with no card. Nothing in `/docs/REVIEW-REQUIRED.md` is live.
10. Account payload is only email / birth / gender / city. Photos never leave the browser.
11. House SKUs persist by id, not a clone. User-roll upserts the same id.
12. Light toggle stays; default is dark editorial. Weather only tints the existing accent token.
13. TanStack Query stays as a Start peer. Unused Radix remains in `node_modules` until a later install.
14. No git in this sandbox — practice/looks/journal were three slices, not three commits.
15. Catalog `build()` still fills `SAMPLE_CLOSET` in this build. An empty rail must not invent a garment.
16. Date looks start on a dress, so 10 Not-this can sour that category.
17. Auto-plate skips if a look is already on the desk. W is an alias for Holds.

## Known-broken (by severity)

| Sev | Item | Where |
| --- | --- | --- |
| **S1** | Unsplash stills are not the SKU. A “poplin shirt” may show the wrong garment. | `src/lib/catalog.ts`, `/docs/STILL-AUDIT.md` |
| **S1** | The plate is a collage, not a person wearing the look. Silent-form composite was never built. | `src/components/look-stack.tsx` |
| **S2** | Auth ON: Continue on login opens Google. The desk cannot be walked without a session. | `src/routes/login.tsx`, `src/lib/auth/` |
| **S2** | `npm test` fails 13 **platform** `scripts/*.test.mjs` (auth template expects `VITE_AUTH_ENABLED=false`; migration-plan expects no app SQL). Product suite is green when run on `src/lib/*.test.ts`. | `package.json` `test` script |
| **S3** | Login dek still interpolates `{gen.gen}` (“Gen Z”). Copy audit missed this file. | `src/routes/login.tsx` ~133 |
| **S3** | No live billing, GST, refunds, or DPDP policy. Draft only. | `/docs/REVIEW-REQUIRED.md` |
| **S3** | Grill needs `XAI_API_KEY`. Without it, the sitting still spends and falls back to `localLook`. | `src/lib/style-me.ts` |
| **S3** | Header still prints `gen.gen` under the mark. | `src/components/shell.tsx` |

## Three highest-value next tasks

1. **Silent-form composite (no face, no generated body).** Composite ordered rail stills onto a fixed silhouette so Tonight looks worn, not tiled. If it cannot be done without generating a body, keep the collage.  
   Open: [`src/components/look-stack.tsx`](src/components/look-stack.tsx), [`src/lib/outfit.ts`](src/lib/outfit.ts) (`orderedPieces`), [`src/lib/catalog.ts`](src/lib/catalog.ts) (`CUT_STILL`). Law: NO GENERATION.

2. **Replace Unsplash with honest stills.** Either licensed house photography per cut, or a clearly labelled illustration — never a photo that pretends to be the SKU.  
   Open: [`src/lib/catalog.ts`](src/lib/catalog.ts), [`/docs/STILL-AUDIT.md`](/docs/STILL-AUDIT.md), [`src/lib/sample-closet.test.ts`](src/lib/sample-closet.test.ts).

3. **Human-gate money and minors, then copy-fix login.** Do not wire Stripe. Finish `/docs/REVIEW-REQUIRED.md` with counsel. Meanwhile strip `{gen.gen}` from login/shell so the desk does not label a person as a generation.  
   Open: [`/docs/REVIEW-REQUIRED.md`](/docs/REVIEW-REQUIRED.md), [`src/routes/login.tsx`](src/routes/login.tsx), [`src/components/shell.tsx`](src/components/shell.tsx), [`src/lib/membership.ts`](src/lib/membership.ts). Never weaken `validateLook`.

Do not start speculative work. The next queued message is the next task.
