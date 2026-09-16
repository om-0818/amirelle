# Final pre-publish gate — 16 Sep 2026 19:18 IST

Audit only. Not a publish. Not a deploy. Kai decides go-live.

Evidence from current code, a fresh `npm run build`, served `http://127.0.0.1:8080`, and tests run this turn.

## 1. ENGINE GATE

- **PASS** — `outfit.test.ts` 59/59 this turn, including “2000 random plates keep a wearable body” (76.2s).
- **PASS** — Current `localLook` empties `pieces` when `!fit.ok`. `LookStack` runs `assertRenderableLook` and paints an empty plate if the gate fails. Looks replay re-validates. ENGINE-MAP.md (15 Sep) is stale; the retry hole is closed in code.
- **PASS** — OCCASION_KIT coverage: “every allowed generation × occasion plates within retry” green this turn.
- **PASS** — Minor-safety tests green: alpha/teen cannot plate night/party/date; adults never school/play; no heels on minor plates.

## 2. PROVENANCE AND HONESTY

- **PASS** — `plateHasProvenance` blocks render without closet/rail. `provenance.test.ts` 3/3.
- **PASS** — `keepCut` strips `×` and festival names; tests assert ids on the plate or rejected pool.
- **FAIL** — Costume grep is clean of Y2K / twin houses / aesthetic. Login still interpolates `gen.gen` (“Gen Z”) in the served HTML. Header still prints `gen.gen`. Generation nicknames as labels.

## 3. DATA AND PRIVACY

- **PASS** — `ACCOUNT_FIELDS` is exactly `email,birth,gender,city`. New test fails if that array grows. `accountPayload` drops extra keys. Note: server `profiles` still has `identity` + `onboarded` (not the account payload).
- **PASS** — `storage-migrate.test.ts`: v1 fixture comes out intact with a ledger.
- **PASS** — Export-after-delete: every `STORAGE_KEYS` local value is `null`; no leftover `"kept"`. 8/8 privacy tests.
- **PASS** — `REVIEW-REQUIRED` is not imported by any live `src` path (only `membership.test.ts` reads the file). Privacy Policy / ToS drafted there this turn, still not routed.

## 4. SECURITY

- **PASS** — Served `/` and `/login`: `Content-Security-Policy` (no `unsafe-inline` / `unsafe-eval`), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- **FAIL** — `Strict-Transport-Security` is **not** on the served 8080 response (prod-only in `securityHeaders("prod")`). Not verified on a production host.
- **PASS** — Live routes: `/api/auth/$` broker; `getProfile`/`saveProfile` `authMiddleware` + `context.userId`; weather + grill `assertSameSiteRequest` + rate tokens. Razorpay webhook listed, **not mounted**.
- **FLAGGED** — `getConnectorReadiness` remains unauthenticated, unrated, no user rows.
- **PASS** — Fresh production build; `client-bundle-secrets.test.mjs` 3/3 on `.vercel/output/static`.
- **FAIL** — Session cookie flags exist in `server.ts` (`HttpOnly`, `Secure`, `SameSite=lax`, `__Host-`). No `Set-Cookie` observed on `/api/auth/get-session` (404). Not verified on an actual issued cookie this audit.

## 5. PERFORMANCE

- **PASS** — Fresh `profilePlateCycle(2)`: localLook p95 **666 ms** / max 666 (budget 750 / 1200). occasionScore / stripLook / validateLook inside caps. `budgetFailures` empty.
- **PASS** — Index chunk **361.0 kB** (was 424.9). All client JS assets **614.7 kB** vs recorded 583.1 — split chunks, index smaller.
- **PASS** — Plate locked 3:4 with width/height/lazy; polish tests 360 / 768 / 1440 wrap. Not re-measured in a browser this turn.

## 6. RESILIENCE

- **FLAGGED** — `errorComponent: AppErrorComponent` on `__root`, `/`, `/login`. Did **not** force a live throw per route.
- **PASS** — Empty closet copy `EMPTY_CLOSET`; rail fail `RAIL_FAILED`; quota `QUOTA_MSG` names the photo. Today falls back to the house rail so first-run is never blank.
- **FLAGGED** — SW caches `/`, `/theme-boot.js`, `/favicon.svg`; tests assert no localStorage in the worker. Did **not** open Today with the network off.

## 7. ACCESSIBILITY

- **FLAGGED** — Did not complete a keyboard-only walk of Today/Closet (auth on). Landing `Enter` and login fields are in the tab order. `:focus-visible` and `min-height: 2.75rem` are in CSS.
- **PASS** — Contrast tests: `#f4efe7` on `#0a0908` ≥ 12; muted `#9a9288` ≥ 4.5; accent on dark ≥ 4.5.
- **PASS** — Tap targets: `h-11` / `min-h-11` / 44px utility. Not a live device lab.

## 8. BUSINESS READINESS

- **PASS** — `corePlateBlocked("free") === false`. Complimentary work plate `fit.ok` this turn. Style boards a rail look before it meters the sitting.
- **PASS** — Lapse mid-session: server record `until` yesterday → `lapsed`, `entitled: false`, local `atelier` ignored. `member-machine.test.ts` green.
- **PASS** — `CHECKOUT_ENABLED = false as const`. Grep: only checkout.ts, its test, and handover docs. `createOrder` always `{ ok: false, reason: "off" }`.
- **PASS** — Membership desk shows “Inclusive of GST. Draft — not a tax invoice.” Refund / cancellation / auto-renew live only in REVIEW-REQUIRED, not on the desk.

## 9. LEGAL, PRIVACY POLICY, AND MINORS

- **FLAGGED** — Always. Privacy Policy and Terms drafted into `/docs/REVIEW-REQUIRED.md` this turn. Not mounted. DPDP under-18 still a memo. Minors still enter on birth date with no parental-consent gate. Kai must decide. This section cannot be PASS.

## 10. SEO AND METADATA

- **PASS** — Served login HTML: `<title>Amirelle</title>`, meta description (clothes that actually exist), `og:title`, `og:image`, favicon link.
- **PASS** — `GET /sitemap.xml` 200; `GET /favicon.svg` 200; `GET /og.jpg` 200.
- **FAIL** — `GET /robots.txt` **404**.
- **FAIL** — `GET /this-page-does-not-exist-amirelle` is HTTP 404 but the body is the app shell (title Amirelle), not a dedicated 404 page. No `notFoundComponent`.

## 11. BUILD AND ENVIRONMENT

- **PASS** — `npm run build` completed. Client 1997 modules, SSR 372, Nitro vercel preset. Warning: Vite native config loader — `import "./src/lib/security-headers"` missing file extension in `vite.config.ts`. `DATABASE_URL not set — skipping` on migrate (PGLite fallback).
- **PASS** — Bundle-secret grep 3/3 on the fresh output. Checkout flag off. No payment SDK in `package.json`.
- **FAIL** — Did not click every screen. Chromium `/` and `/login` earlier this session hit TanStack `$_TSR` bootstrap invariant on a too-fast first paint. Login HTML contains “Gen Z”. Inner desk not walked (auth).

## 12. ROLLBACK

- **FAIL** — No `.git` in this sandbox. Cannot confirm a last known-good commit. Cannot tag. `fatal: not a git repository`.

## Summary

The engine still plates legal looks: 2000-property green, minors held, free members get a complete occasion-legal plate, checkout is off, GST is labelled a draft, secrets are not in the fresh client bundle. That is the product spine.

It is not go-live. Login still names a generation. There is no robots.txt, no real 404, no verified Set-Cookie, no HSTS on the response we actually served, no git tag, and the legal pages are drafts in a review file. Auth blocked a full click-through. Kai owns publish.

NOT READY: no robots.txt; no dedicated 404 page; no git tag / rollback; session cookie flags not seen on a live Set-Cookie; login/header still print generation nicknames; Privacy Policy and Terms remain drafts for Kai.
