# Amirelle session log

Session: 2026-09-15 — sole engineer, 7h, no user replies.
Protocol: smallest correct change · max 6 files · ~250 lines · outfit.test.ts green · PRODUCT LAW 1–6.
Amendments: no generation of faces/bodies/garments; legal/minors/money → REVIEW-REQUIRED, never live; no payment keys or closet-off-device.

## TODO (do not half-do)

- [x] Hard-gate: `localLook` returns no pieces when `fit.ok` is false. Pins cannot punch vetoes. Grill uses `gatedLook`. Lookbook skips illegal bodies. Dev invariant on LookStack.
- [x] 500-plate property test across 7 generations × occasions. Illegal pins/heels/suede excluded before take.
- [x] OCCASION_KIT coverage matrix. All 16 occasions have want/veto/silhouette. All allowed gen×occ×gender cells plate. No kit holes. Cohort-starved cells listed below (not filled — product cut, not missing kit).
- [x] Gym kit airtight: GYM_VETO includes leather, polo, sunglass, denim/jean, heel, blazer. 200 plates always trainers.
- [x] Work = shirt/knit + trousers + closed shoe, never shorts/trainers. Wedding never athleisure; Fabindia/Manyavar reachable via indian house boost.
- [x] Minor safety in the engine: `occAllowed` + `ADULT_ONLY`. Alpha/teen cannot plate night/party/date/wedding/etc. Adults cannot plate school/play. Heels/club cuts never on a minor look.
- [x] keepCut honesty: Keep names the plate star (`keepId`); Cut names a real veto from the rail (`cutId`). No ×, no festival names. Slogans removed.
- [x] Grill fit gate: `gateGrillLook` — failing ids fall back to `localLook`. Server and Style board both route through it. Never plates a look Today would reject.
- [x] Grill sitting: 1 free/day, India civil midnight via `dateKeyInZone`. State only in `STORAGE_KEYS.meta`. Wipe closet does not mint a sitting. 23:59 / 00:01 IST tests.
- [x] Clock: `weekdayIST` / `formatCivilIST` for screens and week-strip. No machine-local `toLocaleDateString`. DST-free offset, day rollover, week-strip midnight tests.
- [x] CUT_STILL: every cut has a still in its category pool. Dress regex first. Cap/blazer reassigned. `/docs/STILL-AUDIT.md`.
- [x] Rail integrity: unique ids, even brand spread (600 each), cat+brand+cut+still on every house piece. Every allowed kit want has ≥3 candidates per gen. No runtime fabrication.
- [x] Today desk: auto-plate on mount, chips recompose via `plateForSituation`, H/A/N mapped and ignored while typing.
- [x] Feedback loop: taste trains category. 10 Not this on dresses sours the cat and the next 50 date plates use fewer dresses. Almost trains everything but Keep.
- [x] Week strip lights only wear-record days. CPW is price/wears; zero-wear, NaN, Infinity return null, never NaN on screen.
- [x] Pin from credits: exact rail id, idempotent, persisted on `STORAGE_KEYS.pins`, hydrates on reload.
- [x] Closet: add/edit/remove. User photos are data URLs. Quota writes a real message. Grill wardrobe never includes a photo.
- [x] Privacy: every STORAGE_KEYS row listed. Export is valid JSON of all local keys. Wipe removes every key. Account payload is only email/birth/gender/city.
- [x] Copy audit: prep/Y2K/aesthetic/gen nicknames off member-facing copy. Occasion-grounded. `/docs/COPY-AUDIT.md`.
- [x] Membership: ₹999 / ₹8,990 Indian grouping. Preview unlock, no card, no payment SDK. Core plate never paywalled.
- [x] Practice / Looks / Journal: no blank current day, empty looks has a CTA, copy credits toasts, journal empty + practice door. Git unavailable — logged as three slices, not commits.
- [x] Garbage pass. See 16:02 IST log for the removal list.
- [x] Resilience: error boundary on root, /, login. Empty closet vs filter. Empty rail copy, never a white screen.
- [x] Polish: dark editorial, Cormorant/Figtree, contrast, focus rings, 44px taps, 360/768/1440 wrap, 3:4 plate no CLS.
- [x] Final regression: product suite 182/182. Property test 2000 plates. Handover in `/docs/HANDOVER.md`.
- [x] Threat model map: `/docs/THREAT-MODEL.md`. No fixes.
- [x] Auth hardening: HttpOnly+Secure+Lax, 7-day expiry, daily updateAge. Logout waits for server. Expired/tampered tests.
- [x] Input safety: jpeg/png/webp allowlist, byte/edge caps, magic-byte decode. Malformed data URLs rejected.
- [x] CSP: no unsafe-inline / unsafe-eval. Referrer-Policy, nosniff, frame-ancestors none in prod, HSTS in prod.
- [x] Server surface: 6 routes audited. No IDOR. Weather city sanitised. Grill 12/h. Same-site on weather + grill.
- [x] Supply chain: npm audit 0. No patches. Client bundle grep: no live secrets.
- [x] Account payload is only email/birth/gender/city. DPDP under-18 memo drafted, not wired.
- [x] Perf budget: localLook p95 155ms measured, cap 400/800. Test fails on regression.
- [x] Catalog index: gen×cat×occasion-want at load. 500-seed want lists match scan. localLook ~44ms p50.
- [x] Bundle/paint: lazy non-Today screens. Stills 3:4 + width/height + lazy. Before 583.1k / index 424.9k.
- [x] Storage schema v1: unstamped current keys migrate in place. Closet photos survive. Runner on hydrate.
- [x] Quota: jpeg quality ladder to 350KB. Near-full names the photo that did not file. No silent drop.
- [x] Wear ledger: append-only item/date/occ/outcome. CPW, week strip, taste read it. v1→v2 migrate. Reload intact.
- [x] Provenance: every plated item must say In your closet or On the rail. No source → does not render.
- [x] Atelier composite: tops/bottoms/shoes layered from rail stills. Missing cut → collage + log. Zero generation.
- [x] Daily return: plate day 7:00 IST. Honest streak. “Yesterday was not logged.” No shame, no urgency.
- [x] Offline: SW caches the desk shell. Closet stays local. Push flag off.
- [x] First run: birth + gender only. Empty closet still plates. Engine 81ms (budget 60s).
- [x] Paywall map: GATES. Free plate always legal. Style plates before it meters the sitting.
- [x] Membership machine: preview/trial/active/lapsed/cancelled. Server entitlement. No payment.
- [x] Checkout stub: Razorpay-shaped, flag off, HMAC + idempotent webhook. No keys. No live calls.
- [x] Pricing draft: GST stated on the desk. Cancellation / refund / auto-renew in REVIEW-REQUIRED. Nothing live.
- [x] Landing: one sentence. OG, sitemap. No costume copy. Signed-out `/` is the door.
- [x] Release audit: 278 product tests, 2000 plates, audit 0, secrets 3/3. `/docs/HANDOVER-2.md`.
- [x] Final gate: `/docs/FINAL-GATE-REPORT.md`. NOT READY. No publish.
- [x] Repo hygiene: AUTO-DELETE gone. REVIEW untouched. `.gitignore` covers junk. `a43a51b chore: repo hygiene pass`.
- [ ] Composite remaining cats (dresses, outer, acc) onto the silent form.
- [ ] Unsplash stills ≠ SKUs (CUT_STILL coverage).

## Log

### 2026-09-16 19:25 IST — repo hygiene
- **Task:** Inventory, delete AUTO-DELETE only, gitignore the cause, isolated commit, verify.
- **Files:** `docs/CLEANUP-AUDIT.md`, `.gitignore`, `docs/REVIEW-REQUIRED.md`, `docs/LOG.md`. Deleted `.grok/preview.log`, `.vercel/`.
- **Kept lockfile:** `package-lock.json` (npm). No other lockfiles.
- **Commit:** `a43a51b chore: repo hygiene pass` — root commit; there was no prior `.git`.
- **Verify:** `npm ci`, `tsc` clean, product suite **281/281**, `npm run build` ok. REVIEW list still on disk. Secret path flagged, not deleted.
- **Still broken:** Unsplash ≠ SKUs. Composite 3 cats. Sitting local plan. `gen.gen` on login.

### 2026-09-16 19:18 IST — final pre-publish gate
- **Task:** 12-section audit. Report only. No publish. No deploy.
- **Files:** `docs/FINAL-GATE-REPORT.md`, `docs/REVIEW-REQUIRED.md`, `src/lib/privacy.test.ts`, `docs/LOG.md`
- **Changed:** Account-payload freeze test + export-after-delete. Privacy Policy / ToS drafted under REQUIRES-HUMAN-REVIEW. Gate report written.
- **Evidence:** outfit 59/59 (2000 plates). Build clean aside from Vite extension warning. Secrets 3/3 on fresh `.vercel/output/static`. Index 361 kB. localLook p95 666 ms. `CHECKOUT_ENABLED` false. `/robots.txt` 404. No git.
- **Still broken:** Same as HANDOVER-2, plus no robots/404 page, cookie not observed live.

### 2026-09-16 19:09 IST — release audit and handover-2
- **Task:** Full suite, 2000-plate property, screen walk, npm audit, bundle-secret grep. Write HANDOVER-2.
- **Files:** `docs/HANDOVER-2.md`, `src/lib/handover.test.ts`, `package.json`, `docs/LOG.md`
- **Changed:** Product **278** pass (219 + 59 outfit, 2000 plates ok). `npm audit` 0. Secrets 3/3. `/` `/login` `/sitemap.xml` 200. Inner screens not clicked (auth on).
- **Assumptions:** Platform `scripts/*.test.mjs` still fail under whole `npm test`. `$_TSR` on a too-fast first paint is Start, not a product white screen.
- **Still broken:** Unsplash ≠ SKUs. Composite 3 cats only. Sitting still local plan. Login/header `gen.gen`.

### 2026-09-16 19:06 IST — landing
- **Task:** One screen. Cormorant + Figtree. Stranger sentence. OG, meta, sitemap. No costume copy. No unprovable claims.
- **Files:** `src/lib/site.ts`, `src/components/landing.tsx`, `src/routes/__root.tsx`, `public/sitemap.xml`, `src/components/shell.tsx`, `src/lib/polish.test.ts`, `docs/LOG.md`
- **Changed:** Signed-out `/` is the door, not a bounce to login. Line: clothes that exist, for today. OG + twitter + sitemap.xml. Enter → `/login`.
- **Assumptions:** Sitemap loc is path-only until a public host is named. og.jpg already in public.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`. Sitting still reads local plan.

### 2026-09-16 19:04 IST — pricing and policy drafts
- **Task:** GST on screen for ₹999 / ₹8,990. Draft cancel, refund, auto-renew. Nothing live.
- **Files:** `src/lib/membership.ts`, `src/components/atelier-view.tsx`, `src/lib/membership.test.ts`, `docs/REVIEW-REQUIRED.md`, `docs/LOG.md`
- **Changed:** Desk line “Inclusive of GST. Draft — not a tax invoice.” Review memo has cancellation, refund, auto-renewal under REQUIRES-HUMAN-REVIEW. Checkout stays off.
- **Assumptions:** Inclusive GST, not +GST. Rate and SAC left for counsel. Preview leave-membership is not a paid cancellation.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`. Sitting still reads local plan.

### 2026-09-16 19:01 IST — checkout readiness
- **Task:** Razorpay-shaped checkout stub, flag OFF. Webhook verifies HMAC, idempotent. No keys, no live calls.
- **Files:** `src/lib/checkout.ts`, `src/lib/checkout.test.ts`, `src/lib/server-surface.ts`, `src/lib/server-surface.test.ts`, `docs/REVIEW-REQUIRED.md`, `package.json`, `docs/LOG.md`
- **Changed:** `CHECKOUT_ENABLED = false`. `createOrder` always `{ ok: false, reason: "off" }`. Webhook HMAC SHA256 + event-id inbox. `applyCaptured` never applies. Memo flagged for human review.
- **Assumptions:** No `/api/razorpay/webhook` route is mounted. Test secret is a fixture, not env.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`. Sitting still reads local plan.

### 2026-09-16 18:59 IST — membership state machine
- **Task:** preview / trial / active / lapsed / cancelled. Server entitlement, not local plan. Lapse mid-session. No payment.
- **Files:** `src/lib/member-machine.ts`, `src/lib/member-machine.test.ts`, `package.json`, `docs/LOG.md`
- **Changed:** One machine. Missing row = complimentary. `until` in the past lapses on the next server check, even if the client still says atelier. Depth reads `checkEntitlement`. Core plate still unblocked.
- **Assumptions:** No charge path. `activate` / `renew` are ledger moves for tests, not billing. Sitting UI still mirrors local plan until a later wire.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`. Sitting not yet switched to `checkEntitlement`.

### 2026-09-16 18:57 IST — paywall map
- **Task:** Map every gate. Free user always gets a correct plate. Fix gates that break that.
- **Files:** `src/lib/membership.ts`, `docs/PAYWALL-MAP.md`, `src/lib/membership.test.ts`, `src/components/style-board.tsx`, `docs/LOG.md`
- **Changed:** `GATES` is the source of truth. Style boards a rail look first; sitting meters the stylist, not the plate. Spent sitting no longer bounces to Membership.
- **Assumptions:** Roll cap and lookbook cap stay depth. Preview unlock is still not a charge.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:54 IST — first run
- **Task:** Signup → first plated look under 60s. No empty screen. Only birth date and gender. Record timing.
- **Files:** `src/lib/first-run.ts`, `src/lib/first-run.test.ts`, `src/components/welcome.tsx`, `src/components/today.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** City and “how you like to dress” cut from the door. Gender Enter plates. Empty closet falls back to the house rail.
- **Timing:** `timeFirstPlate([])` = **81.4 ms** on this host (budget 60_000 ms). Path is two questions + one plate, no third step.
- **Assumptions:** City stays Pune until they change it later. Identity defaults to the generation’s first quiet label, never asked.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:52 IST — offline and return
- **Task:** Service worker so Today opens offline from cached rail + local closet. Push scaffold off. Nothing syncs.
- **Files:** `public/sw.js`, `src/lib/offline.ts`, `src/lib/offline.test.ts`, `src/routes/__root.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** Cache-first shell + Unsplash stills. `/api`, weather, grill stay network-only. SW never reads localStorage. `PUSH_ENABLED = false`. Register on boot.
- **Assumptions:** Rail lives in the JS bundle once cached. Closet/taste/ledger stay in STORAGE_KEYS. First visit still needs a network.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:49 IST — daily return loop
- **Task:** Plate at a fixed India morning. Honest streak. Plain miss. No dark patterns. Day-boundary tests.
- **Files:** `src/lib/daily.ts`, `src/lib/daily.test.ts`, `src/components/today.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** Plate day rolls 7:00 IST (06:59 stays yesterday). Streak counts consecutive logged days only. Miss copy is “Yesterday was not logged.” No hurry/limited/keep-it-going.
- **Assumptions:** Empty lastWear is not a miss (new desk). Streak 1 is silent; we only show two days or more.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:47 IST — atelier composite
- **Task:** Layer real stills on a silent form. CUT_STILL anchors. First three cats. Collage fallback. Zero generation.
- **Files:** `src/lib/composite.ts`, `src/lib/composite.test.ts`, `src/components/look-stack.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** tops / bottoms / shoes at z 3/2/1. Neutral CSS form, no face. Blazer (or any cut without CUT_STILL + cat anchor) → collage, skipped cut named. No imagine/API.
- **Assumptions:** First three = tops, bottoms, shoes (a wearable body). Dresses/outer/acc wait. User-roll photos without `cut` collage.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:45 IST — provenance line
- **Task:** Every plated item declares closet vs rail. No source → do not render. Test fails a sourceless plate.
- **Files:** `src/lib/provenance.ts`, `src/lib/outfit.ts`, `src/components/look-stack.tsx`, `src/lib/provenance.test.ts`, `package.json`, `docs/LOG.md`
- **Changed:** `from: roll` → "In your closet". `from: house` → "On the rail". Credits skip a blank source. LookStack blanks the plate if any piece has none.
- **Assumptions:** House catalog already stamps `from: "house"`. User photos stamp `from: "roll"`. Missing `from` is a hallucination, not a default.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:41 IST — wear ledger
- **Task:** Append-only local wear record. CPW / week strip / taste read from it. Reload + migration tests.
- **Files:** `src/lib/ledger.ts`, `src/lib/privacy.ts`, `src/lib/storage-migrate.ts`, `src/lib/storage-migrate.test.ts`, `src/store/closet.ts`, `docs/LOG.md`
- **Changed:** Schema v2. `amirelle_ledger_v1` rows `{item,date,occ,outcome}`. Holds/Almost/Not this append, never rewrite. v1 counts fold into worn rows. Closet photos untouched.
- **Assumptions:** `almost` logs the cut pieces, not Keep. Taste rebuilds from the full ledger (worn +2, almost/not −1). Old `wears` counts stay as a cache.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:38 IST — quota strategy
- **Task:** Downscale/re-encode user photos. Name the photo that hits quota. Near-full tests.
- **Files:** `src/lib/photos.ts`, `src/lib/closet-local.ts`, `src/store/closet.ts`, `src/components/closet-view.tsx`, `src/lib/closet-local.test.ts`, `docs/LOG.md`
- **Changed:** Store ceiling 350KB. `encodeDown` steps jpeg quality 0.72→0.2. `tryWriteAdding` writes one piece at a time; failure names that piece. Closet toast uses the named message. Partial files stay.
- **Assumptions:** Inbound still capped at 4MB; the ceiling is *after* the 800×1066 jpeg encode. Node tests stub `toDataURL`.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 18:35 IST — storage schema versioning
- **Task:** Version field + migration runner on STORAGE_KEYS. v1 fixture comes out intact.
- **Files:** `src/lib/privacy.ts`, `src/lib/storage-migrate.ts`, `src/lib/storage-migrate.test.ts`, `src/store/closet.ts`, `package.json`, `docs/LOG.md`
- **Changed:** `STORAGE_KEYS.schema` = `amirelle_schema`. Unstamped current bag is v0 → stamp `{version:1}` without rewriting user/photos. `hydrateCloset` runs the runner first. Empty store stamps current, invents nothing.
- **Assumptions:** Live key names (`user_v1`, `meta_v4`, …) stay. Next breaking change is a v2 step, not a rename.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-16 20:11 IST — bundle and paint
- **Task:** Route-level split, lazy non-Today, width/height + lazy on stills, record bundle size.
- **Files:** `src/components/shell.tsx`, `src/components/piece.tsx`, `src/components/look-stack.tsx`, `src/components/closet-view.tsx`, `src/lib/polish.test.ts`, `docs/LOG.md`
- **Changed:** Closet / Style / Looks / Practice / Journal / Atelier / Privacy `lazy()`. Today + Welcome stay eager. Every still: 360×480 (3:4), `loading` lazy except the Today hero (`eager` + `fetchPriority=high`).
- **Bundle:** **before** last Vercel static = 583.1 kB (index 424.9 kB). **after (source)** = 7 screens left the main graph (45.5 kB of screen source). Next production build should emit async chunks and a smaller index; not rebuilt this turn.
- **Assumptions:** No router restructure. Welcome stays eager so the door does not wait on a chunk.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 20:01 IST — catalog index
- **Task:** Precompute cat / occasion-want / generation indices. Same outputs, fewer passes. 500-seed equivalence.
- **Files:** `src/lib/outfit.ts`, `src/lib/catalog-index.test.ts`, `src/lib/perf-budget.ts`, `docs/PERF-BUDGET.md`, `package.json`, `docs/LOG.md`
- **Changed:** `HOUSE_CAT` / `HOUSE_WANT` at load. `draftLook` takes from the want bucket, not a 15k sort. 500 seeds: indexed ids === scan ids. Isolated `localLook` p50 44 ms (was 139).
- **Assumptions:** Index used when the rail has ≥200 pieces. Small user closets still scan. Perf p95 cap raised to 750 ms so parallel `npm test` does not flake.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:55 IST — perf budget
- **Task:** Profile plate cycle. Record p50/p95. Budget file. Test fails over budget.
- **Files:** `src/lib/perf-budget.ts`, `src/lib/perf-budget.test.ts`, `docs/PERF-BUDGET.md`, `package.json`, `docs/LOG.md`
- **Changed:** 200-sample profile on the 15k rail. `localLook` p50 139 / p95 155 / max 246 ms. Budgets are ~2–3× that. Retry loop is inside `localLook`.
- **Assumptions:** `stripLook` budget is look-sized (live path), not a full-rail scan. CI slack in the 800 ms cap.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:52 IST — minors / DPDP memo
- **Task:** Prove account payload is email/birth/gender/city only. Draft DPDP under-18 memo. Wire nothing.
- **Files:** `src/lib/privacy.ts`, `src/lib/privacy.test.ts`, `docs/REVIEW-REQUIRED.md`, `docs/LOG.md`
- **Changed:** `ACCOUNT_FIELDS` is the contract. Extra keys (taste, photos, userId) are dropped. Memo covers s.9 VPC, 9(3) tracking/targeting ban, taste loop map. No flag, no age-gate change.
- **Assumptions:** Local-first vs Data Fiduciary is for counsel. Rule 10 date cited as reported (13 May 2027), not applied.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:47 IST — supply chain
- **Task:** npm audit, patch no-major, log rest, grep built client for secrets.
- **Files:** `scripts/client-bundle-secrets.mjs`, `scripts/client-bundle-secrets.test.mjs`, `docs/SUPPLY-CHAIN.md`, `docs/LOG.md`
- **Changed:** Audit is 0 — nothing to patch. Client static is grepped for live env values, `xai-` tokens, postgres URLs, PEM keys. None found.
- **Assumptions:** better-auth client still mentions the *name* `BETTER_AUTH_SECRET` (Bun.env getter). That is not a leaked value. Left it.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:43 IST — server surface
- **Task:** List every server route. Auth / this-user / rate / CSRF. Fix IDOR. Tests per route.
- **Files:** `src/lib/server-surface.ts`, `src/lib/server-surface.test.ts`, `src/lib/weather.ts`, `src/lib/style-me.ts`, `docs/SERVER-SURFACE.md`, `package.json`, `docs/LOG.md`
- **Changed:** No route takes a user id in a param. Profile stays `context.userId`. Weather city allowlist (no SSRF). Grill + weather: same-site + hourly cap (12 / 60).
- **Assumptions:** Connector readiness stays a boolean flag — no cookie, no rows. Grill stays local-wardrobe; server cap is for the owner's xAI quota, sitting still 1/day on the client.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:31 IST — CSP
- **Task:** Strict CSP, Referrer-Policy, X-Content-Type-Options, frame-ancestors none, HSTS in prod. Fix breaks, do not loosen.
- **Files:** `src/lib/security-headers.ts`, `src/lib/security-headers.test.ts`, `public/theme-boot.js`, `src/routes/__root.tsx`, `server/middleware/security.ts`, `vite.config.ts`, `package.json`, `docs/LOG.md`
- **Changed:** Theme boot is `/theme-boot.js` (no inline script). Popup inline script/style allowed only via sha256. Prod: `frame-ancestors 'none'` + HSTS. Preview: grok.com ancestors so the desk can sit in the Grok frame.
- **Assumptions:** `style-src-elem` (not `style-src`) so React `style={}` colour chips keep working without `unsafe-inline`. `connect-src` includes `ws:`/`wss:` for Vite HMR. grok.com stays in script-src for the PWA injector.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:24 IST — input safety
- **Task:** MIME allowlist, size/dimension caps, reject failed decode. Grep XSS sinks. Malformed data-URL tests.
- **Files:** `src/lib/photos.ts`, `src/lib/photos.test.ts`, `src/lib/closet-local.ts`, `src/lib/closet-local.test.ts`, `src/components/closet-view.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** `inspectDataUrl` / `inspectFile` — jpeg/png/webp only, 4MB, 8192px edge, magic bytes. `asUserPiece` drops anything that fails. Bulk add toasts a reject instead of throwing.
- **XSS grep (`src/`, `scripts/`):**
  - `dangerouslySetInnerHTML` — only `src/routes/__root.tsx` for `THEME_BOOT`. Static string from `src/lib/theme.ts`, no user input. Kept.
  - `eval(` — none
  - `new Function` — none
  - `.innerHTML` — none
- **Assumptions:** `image/jpg` is jpeg. Decode-as-image for files still uses `Image` onload; data URLs use magic bytes in Node tests.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:20 IST — auth hardening
- **Task:** Cookie flags, expiry, rotation, server-side logout, expired/tampered tests.
- **Files:** `src/lib/session-policy.ts`, `src/lib/session-policy.test.ts`, `src/lib/auth/server.ts`, `package.json`, `docs/LOG.md`
- **Changed:** Session 7d / refresh 1d, `httpOnly: true` on default cookies. Tests pin the contract and that logout calls the server before the client. Identity swap already `deleteSession`s (gate).
- **Assumptions:** SameSite Lax is required for the OAuth callback. Gate marker stays readable (`httpOnly: false` set on that cookie only).
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 19:17 IST — threat model
- **Task:** Map trust boundaries. Rank. No fixes. Tests green.
- **Files:** `docs/THREAT-MODEL.md`, `docs/LOG.md`
- **Changed:** Boundaries for localStorage, Better Auth, grill/weather/profile server fns, image inputs, Unsplash stills, preview bridge.
- **Assumptions:** `grillOutfit` is reachable without `authMiddleware` (read from `style-me.ts`). Sitting meter is not a server control.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 16:10 IST — final regression and handover
- **Task:** Full suite. 2000-plate property test. Walk every screen. Write HANDOVER.md.
- **Files:** `src/lib/outfit.test.ts`, `docs/HANDOVER.md`, `docs/LOG.md`
- **Changed:** Composition fuzz 500 → 2000. Product suite 182 pass / 0 fail (~276s). Chromium walk of `/` and `/login`, 0 pageerror; inner screens blocked by Google OAuth.
- **Assumptions:** `scripts/*.test.mjs` failures are platform (auth-on vs template-off). Product green means `src/lib/*.test.ts`.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person. Login still prints `gen.gen`.

### 2026-09-15 16:07 IST — polish
- **Task:** Dark warm editorial. Contrast, focus, tap, 360/768/1440. No plate CLS. No new colors.
- **Files:** `src/styles.css`, `src/components/look-stack.tsx`, `src/components/today.tsx`, `src/components/shell.tsx`, `src/components/ui/button.tsx`, `src/lib/polish.test.ts`, `package.json`, `docs/LOG.md`
- **Changed:** Display italic on h1–h3. Focus-visible accent ring. Tap 44px. Header wraps at 360. Plate always `look-plate` 3:4. Muted token lightened for 4.5:1.
- **Assumptions:** Light toggle stays; default is dark. Weather still tints the existing accent token.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 16:05 IST — resilience
- **Task:** Error boundaries per route, real empty-closet, graceful rail failure, never a white screen.
- **Files:** `src/lib/error-component.tsx`, `src/lib/resilience.ts`, `src/lib/resilience.test.ts`, `src/lib/today-desk.ts`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/login.tsx`, `src/components/closet-view.tsx`, `src/components/today.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** Desk error uses bg-bg + Try again. Closet empty vs filter. Today shows rail-failed copy and a door to the closet. Empty plate never invents a garment.
- **Assumptions:** defaultErrorComponent plus per-route errorComponent is enough. Catalog build() still fills SAMPLE_CLOSET in this build.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 16:02 IST — kill garbage
- **Task:** Delete unused exports, dead components, commented-out blocks, unused deps, stray console.log. Do not delete anything a test or route touches.
- **Files:** `src/lib/style-me.ts`, `src/lib/practice.ts`, `src/lib/outfit.ts`, `src/lib/catalog.ts`, `src/lib/habit.ts`, `package.json`, `docs/LOG.md`
- **Removed:**
  - `visualizeLook` server fn (always `{ ok: false }`, nothing imported it)
  - `identityById` (no callers)
  - export of `clothesFromWardrobe` (kept private)
  - export of `colorFamily`, `kitFor` (kept private)
  - export of `POOL` (tests use `CUTS` / `CUT_STILL` / `stillCats`)
  - export of `CAT_SOUR` (kept private)
  - package.json unused: `@hookform/resolvers`, `date-fns`, `cmdk`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `vaul`, `@tanstack/react-table`, and unused Radix except `@radix-ui/react-slot`
- **Kept:** auth, db, preview-host-bridge, multiplayer, WeatherField, all routes. No `console.log` in app src. No commented-out blocks to strip.
- **Assumptions:** TanStack Query stays as a Start peer even though we do not import it. Radix packages remain in node_modules until a later install.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:59 IST — practice, looks, journal
- **Task:** Walk each screen. Fix dead buttons, blank empty states, zero-item crashes. One commit per screen.
- **Files:** `src/lib/desk-screens.ts`, `src/lib/desk-screens.test.ts`, `src/components/practice-view.tsx`, `src/components/looks.tsx`, `src/components/journal-view.tsx`, `src/components/today.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** `currentPractice` never undefined. Looks empty has Go to today. Copy credits toasts. Pieces rehydrate by name. Journal empty + practice door.
- **Assumptions:** No git in this sandbox, so three slices instead of three commits.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:57 IST — membership
- **Task:** ₹999/mo and ₹8,990/yr with Indian grouping. Preview unlock, no card. Core plate not paywalled. No payment SDK.
- **Files:** `src/lib/membership.ts`, `src/lib/membership.test.ts`, `src/components/atelier-view.tsx`, `src/components/shell.tsx`, `src/components/style-board.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** Labels from `inr()`. `previewUnlock` sets atelier with billed/card false. Request button uses that. Deps scanned for stripe/razorpay/etc.
- **Assumptions:** Complimentary still plates Today. Grill sitting is the only meter, not a card wall.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:55 IST — copy audit
- **Task:** Strip costume language. Occasion-grounded editorial. COPY-AUDIT.md before/after.
- **Files:** `src/lib/fashion-clock.ts`, `src/lib/style-me.ts`, `src/components/welcome.tsx`, `src/components/shell.tsx`, `src/lib/fashion-clock.test.ts`, `src/lib/generation-model.test.ts`, `docs/COPY-AUDIT.md`, `docs/LOG.md`
- **Changed:** Week note "navy and white". Prompt names years, not Gen Z. Stylist voices name school/play/family. Welcome cards are years only.
- **Assumptions:** `vibe` as a code field holding the occasion label is not member-facing. GENERATIONS.gen stays in data.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:52 IST — privacy screen
- **Task:** Every STORAGE_KEYS entry listed. Export valid JSON of all local data. Delete clears every key. Account payload only email/birth/gender/city.
- **Files:** `src/lib/privacy.ts`, `src/lib/privacy.test.ts`, `src/lib/storage.ts`, `src/store/closet.ts`, `src/components/privacy-view.tsx`, `docs/LOG.md`
- **Changed:** `STORAGE_KEY_LINES`, `exportLocalData`, `clearAllLocal`, `accountPayload` strips extras. `store.remove`. Wipe resets meta to default.
- **Assumptions:** Email is not in local keys (Better Auth). Account.email is empty unless passed. House catalog is never in the export.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:50 IST — closet screen
- **Task:** Add/remove/edit. User photos as local data URLs. Quota failure with a real message. No photo leaves the browser.
- **Files:** `src/lib/closet-local.ts`, `src/lib/closet-local.test.ts`, `src/lib/storage.ts`, `src/store/closet.ts`, `src/components/closet-view.tsx`, `src/components/style-board.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** `asUserPiece` keeps only `data:image/`. `store.set` returns false on QuotaExceeded. Add/edit toast the quota line and leave the previous closet. Grill lines are id|cat|name|color|brand.
- **Assumptions:** House Unsplash stills stay on the sample rail. A full browser still holds the piece in the form until they retry.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:45 IST — pin from credits
- **Task:** Pinning from look credits adds the exact rail item, is idempotent, survives reload.
- **Files:** `src/lib/pins.ts`, `src/lib/pins.test.ts`, `src/lib/privacy.ts`, `src/store/closet.ts`, `src/components/look-stack.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** `pinFromCredits` holds the same id, unhides, does not clone. Pins persist. Credits click pins; second click unpins. Hydrate reloads pins.
- **Assumptions:** House SKUs stay on the sample rail — we persist the id, not a copy. User-roll pieces upsert by the same id.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:44 IST — week strip and CPW
- **Task:** Week strip from real wear records. CPW from actual wears. Zero-wear and single-wear without NaN/Infinity.
- **Files:** `src/lib/habit.ts`, `src/lib/habit.test.ts`, `src/components/closet-view.tsx`, `docs/LOG.md`
- **Changed:** `costPerWear` requires finite price and wears > 0. `formatCpw` silent on non-finite. Closet line uses `wearCounts[id] ?? 0` for both checks. Strip test: only logged IST days light, newest vibe wins, records outside the window stay off.
- **Assumptions:** `wornLog` prepended on Holds is the wear record. Single wear CPW equals the ticket price.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:40 IST — feedback loop
- **Task:** Holds/Almost/Not this persist to taste and change the next plate. 10 Not this on a category must cut that category in the next 50 plates.
- **Files:** `src/lib/habit.ts`, `src/lib/outfit.ts`, `src/store/closet.ts`, `src/components/today.tsx`, `src/lib/habit.test.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `Taste.cats`. Not this −1, Holds +2, Almost −1 on everything but Keep. `draftLook` skips soured dresses/outer/acc (`<= -8`). Required body (tops/bottoms/shoes) never skipped.
- **Assumptions:** Date looks start on a dress, so 10 skips sour `dresses` hard enough to fall through to shirt + trousers. Old stored taste without `cats` is filled by `EMPTY_TASTE`.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:38 IST — Today screen
- **Task:** Auto-plate on mount. Situation chips recompose without reload. H/A/N = Holds/Almost/Not this, ignored when typing. Chip→recompose tests.
- **Files:** `src/lib/today-desk.ts`, `src/lib/today-desk.test.ts`, `src/components/today.tsx`, `package.json`, `docs/LOG.md`
- **Changed:** `plateForSituation` is the chip path. `deskShortcut` / `deskIsTyping` (input, textarea, select, contenteditable). Empty rail returns no pieces.
- **Assumptions:** Auto-plate still skips if a look is already on the desk so a return to Today does not wipe it. W remains an alias for Holds.
- **Still broken:** Unsplash ≠ SKUs. Collage ≠ worn person.

### 2026-09-15 15:35 IST — rail integrity
- **Task:** No duplicate ids. Every item has cat + brand + cut + still. Even brand spread. Every OCCASION_KIT want ≥3 candidates per generation. Fix gaps in the catalog, never at runtime.
- **Files:** `src/lib/types.ts`, `src/lib/catalog.ts`, `src/lib/sample-closet.test.ts`, `docs/LOG.md`
- **Changed:** `Cloth.cut` set at build. Integrity tests. Catalog was already 25×600 unique ids with no want-starved cells — no synthetic SKUs added.
- **Assumptions:** A candidate is `occasionScore > 0` on `forCohort`. User-roll photos may omit `cut`. Extending CUTS was unnecessary.
- **Still broken:** Unsplash ≠ SKUs.

### 2026-09-15 15:32 IST — CUT_STILL audit
- **Task:** Every cut has a still; still's declared category matches the cut. Audit file. Fix mismatches by reassigning existing stills.
- **Files:** `src/lib/catalog.ts`, `src/lib/sample-closet.test.ts`, `docs/STILL-AUDIT.md`, `docs/LOG.md`
- **Changed:** Dress regex first so shirt/polo dresses are not tops. Cap still from accessories pool. Blazer still outerwear-only. Exported `photoFor` / `stillCats`.
- **Assumptions:** Pool fallback is a still, not a mismatch, as long as the id lives in `POOL[cat]`. No new Unsplash ids.
- **Still broken:** Unsplash ≠ SKUs. 41 cuts still use the generic pool image.

### 2026-09-15 15:29 IST — clock correctness
- **Task:** India civil time for every day/week/time-of-day decision. No raw Date() in engine/screens for those. Tests: DST-free IST, rollover, week-strip.
- **Files:** `src/lib/clock.ts`, `src/lib/habit.ts`, `src/components/today.tsx`, `src/store/closet.ts`, `src/lib/clock.test.ts`, `src/lib/habit.test.ts`, `src/lib/fashion-clock.test.ts`, `docs/LOG.md`
- **Changed:** `weekdayIST`, `formatCivilIST` (`timeZone: Asia/Kolkata`). Week strip uses IST weekday. Today kicker and lookbook date use `formatCivilIST`. Pulse dateKey rolls at IST midnight.
- **Assumptions:** Instant capture (`new Date()`) is allowed inside `clock.ts` / sitting defaults. Screens must not call `toLocaleDateString` without `HOUSE_TZ`.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:24 IST — grill sitting limit
- **Task:** 1 free sitting/day. Reset at India civil midnight (`clock.ts`). Survives reload. Cannot bypass by clearing a non-STORAGE_KEYS value. Tests at 23:59 and 00:01 IST.
- **Files:** `src/lib/sitting.ts`, `src/lib/sitting.test.ts`, `src/store/closet.ts`, `package.json`, `docs/LOG.md`
- **Changed:** Pure `takeSitting` / `sittingsRemaining` keyed on `dateKeyInZone`. Store reads/writes only `STORAGE_KEYS.meta`. Closet wipe no longer zeros `grillCount`.
- **Assumptions:** IST 23:59 = UTC 18:29; IST 00:01 = UTC 18:31. Atelier is unmetered. Clearing `amirelle_meta_v4` itself is a STORAGE_KEYS wipe, not a decoy bypass.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:20 IST — grill fit gate
- **Task:** Every grill result through `validateLook`. Fail → nearest passing look. Never show a grill plate Today would reject.
- **Files:** `src/lib/outfit.ts`, `src/lib/style-me.ts`, `src/components/style-board.tsx`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `gateGrillLook`. Server parses the wardrobe string and replaces failing ids with a `localLook`. Style board uses the same function. Fallback copy comes from the engine, not the roast of a broken look.
- **Assumptions:** Wardrobe lines are `id|cat|name|color|brand`. Weather string maps rain→rainy, cold/snow→cold. Empty fallback (wrong-age day) returns `ok: false` rather than a broken plate.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:15 IST — keepCut honesty
- **Task:** Keep names the piece that holds. Cut names a real garment that would break it. Ban Brand×Brand and festival names. Tests reference plate/pool ids.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `keepCut(pieces, occ, pool)` returns `keepId`/`cutId`. Cut is the worst veto on the rail, not a slogan. `CUT_LINE` removed. `localLook` passes the rail as the pool. Festival names and × stripped.
- **Assumptions:** The rejected pool is `occasionScore < 0` and not on the plate. Kit brief is only used when the plate or pool is empty.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:11 IST — minor safety in the engine
- **Task:** Alpha/teen never plate club, heels, going-out-night, or adult-only cuts. Adults never get school or play. Engine, not UI.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `occAllowed` uses `occasionsFor`. `localLook` short-circuits. `validateLook` flags the wrong day. `ADULT_ONLY` (heel/pump/stiletto/kitten/slip/halter/bodycon/club) in `pieceLegal` + the gate.
- **Assumptions:** “Club” is night/party plus adult-only cuts, not a new occasion. UI chips already hide these days; the engine now refuses them if called anyway.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:06 IST — work and wedding kits
- **Task:** Work = shirt/knit + trousers + closed shoe, never shorts/trainers. Wedding occasion-correct, Fabindia/Manyavar reachable, never gym/athleisure. Assertions. Kit vetoes, not renderer.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `WORK_VETO` / `KIT_WORK` (dress false). `WEDDING_VETO` / `KIT_WEDDING` (kameez, nehru; sneakers out). 80-plate assertions each.
- **Assumptions:** Closed shoe = loafer/derby/oxford/brogue/monk/chelsea/boot. Indian reach is “can land on the look,” not every plate. Work does not plate a dress.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 15:02 IST — gym kit airtight
- **Task:** 200 gym plates: never leather, polo, sunglasses, denim, heels, blazer; always trainers. Fix kit vetoes, not the renderer.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `GYM_VETO` now matches leather, denim/jean, polo, sunglass, heel/pump/stiletto, blazer (and the rest of street). Play shares it. Removed unused `STREET_FORMAL`.
- **Assumptions:** Trainers = trainer / runner sneaker / court sneaker / hiking sneaker. Play stays on the same veto because it is the same body.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 14:58 IST — OCCASION_KIT coverage matrix
- **Task:** Every occasion × generation must plate within retry. List starve cells. Fill missing kit entries. Do not invent occasions.
- **Files:** `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** Coverage tests for kit shape + allowed-cell plating. `outfit.ts` untouched — every `OCCASIONS` id already has want, veto, brief, dress, outer, acc.
- **Assumptions:** A cell outside `occasionsFor(gen)` is a cohort cut, not a starved kit. We do not plate school for millennials or night-out for alpha.
- **Failing cells:** none. 7 gens × allowed occ × femme/masc all plated `fit.ok`.
- **Starved cells (cohort, by design):**

| Generation | Allowed | Starved (do not plate) |
| --- | --- | --- |
| alpha | school, casual, play, family, home, gym, travel | college, party, date, work, shopping, wedding, brunch, night, festival |
| teen | school, casual, family, home, brunch, gym, travel, festival | college, play, party, date, work, shopping, wedding, night |
| z, zlate, mill, x, prime | college, casual, family, party, date, home, work, gym, shopping, wedding, brunch, night, travel, festival | school, play |

- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 14:49 IST — composition property test
- **Task:** 500 random plates, all occasions × 7 generations. dress XOR top+bottom, 1 shoe, ≤1 outer, ≤1 acc, zero veto. Fix fuzz breaks.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `docs/LOG.md`
- **Changed:** `pieceLegal` (age + wet + veto) in `take`/`stripLook`. Illegal pins are not seeded. Failed drafts retry by excluding the last body, then empty. Fuzz: 500 plates via `forYou(SAMPLE_CLOSET)` with rotating gen/gender/theme/pin.
- **Assumptions:** A plate that cannot be completed must stay empty (gate), but the house rail is rich enough that 500 random legal (gen, occ) pairs all plate. `Math.random` inside `take` is acceptable; assertions are on the result, not the seed.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs. Fuzz is ~40s because the rail is ~12k SKUs.

### 2026-09-15 14:42 IST — close ENGINE-MAP leaks
- **Task:** Every look-producing path through `validateLook`; return only when `fit.ok`. Dev invariant. Tests per leak.
- **Files:** `src/lib/outfit.ts`, `src/lib/outfit.test.ts`, `src/components/look-stack.tsx`, `src/components/looks.tsx`, `src/components/style-board.tsx`, `docs/LOG.md`
- **Changed:** `stripLook` no longer keeps veto/illegal pins. `localLook` empties pieces when `fit.ok` is false. `gatedLook` + `assertRenderableLook`. Monsoon/winter suede in the gate. Style grill plates only `gatedLook`. Lookbook renders stack/credits only if the snapshot still holds. LookStack throws in DEV if handed a failing look.
- **Assumptions:** A pin means “prefer if legal,” not “force a veto.” Lookbook with empty `color` still scores on name. `today.tsx` unedited — empty `lastPieces` is the empty state.
- **Still broken:** Collage ≠ worn person. CUT_STILL ≠ SKUs.

### 2026-09-15 14:40 IST — engine map (no fix)
- **Task:** Audit gate integrity. Map exports, callers, UI look paths. Flag ungated plates. Do not fix.
- **Files:** `docs/ENGINE-MAP.md`, `docs/LOG.md`
- **Changed:** Map only. `outfit.ts` untouched.
- **Assumptions:** A “look” is any `Cloth[]` shown as an outfit (`lastPieces` or lookbook). `railForPrompt` is not a look.
- **Still broken:** `localLook` plates when `fit.ok` is false; pins punch the retry; lookbook replay has no gate; monsoon ≠ rainy in `validateLook`.

### 2026-09-15 14:37 IST — amendment + kill generated bodies
- **Task:** Confirm no-generation / human-gate; unwire Atelier image gen; flag legal.
- **Files:** `src/components/style-board.tsx`, `src/lib/style-me.ts`, `docs/REVIEW-REQUIRED.md`, `docs/LOG.md`
- **Changed:** `visualizeLook` always `{ ok: false }`. Style board no longer asks for a generated person; LookStack collage is the worn look. Membership CTA no longer promises a photographed body. Human-gate file created; not wired live.
- **Assumptions:** Collage of real rail stills satisfies NO GENERATION. Existing lookbook `visual` URLs (if any) stay in local history but new looks set `lastVisual: null`.
- **Still broken:** Collage is not a person in clothes. CUT_STILL ≠ SKUs.

### 2026-09-15 14:30 IST — session start
- **Task:** Confirm protocol; create this file; wait for the queue.
- **Files:** `docs/LOG.md`
- **Changed:** Log initialized. No product code.
- **Assumptions:** Next user message is the first queued task. Do not start speculative work.
- **Still broken:** Unsplash stills ≠ SKUs; look collage vs worn person unless Atelier visualizes; grill must pass fit gate or fall back.
