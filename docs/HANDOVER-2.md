# Amirelle handover — 16 Sep 2026 19:09 IST

Second batch. First batch: `/docs/HANDOVER.md` (15 Sep). Product law still holds: rail-only looks, `validateLook` before paint, local closet, no generation, money/minors stay in REVIEW-REQUIRED.

## What shipped across both batches

**Engine (batch 1).** Every look path through `validateLook`. Gym / work / wedding kits. Minor safety in the engine. keep/cut names real pieces. Grill falls back to a legal plate. 1 free sitting/day on India civil midnight.

**Clock, rail, desk (batch 1).** `Asia/Kolkata` only. House catalog, still audit, wired taste, pins, quota that speaks, privacy export/wipe. Today auto-plates. ₹999 / ₹8,990 preview, no card. Error boundaries. 3:4 plate.

**Hardening (batch 1).** Threat model (map only). Auth cookie flags. Photo MIME caps. CSP. Server surface / no IDOR. npm audit 0. Account payload four keys. Perf budget. Catalog indices.

**This batch (36–50).**

| Slice | What landed |
| --- | --- |
| Bundle / paint | Lazy non-Today screens. Stills width/height/lazy, 3:4. |
| Storage v1→v2 | Schema runner. Closets survive. Wear ledger folded in. |
| Quota | Photos downscaled to 350 KB. Named failure, never silent. |
| Wear ledger | Append-only item / date / occasion / outcome. CPW, week, taste read it. |
| Provenance | Every plated piece: In your closet, or On the rail. |
| Composite | Tops / bottoms / shoes on a silent form. Missing cut → collage. No generation. |
| Daily return | Plate day 7:00 IST. Honest streak. “Yesterday was not logged.” |
| Offline | Service worker caches the desk. Closet stays here. Push flag off. |
| First run | Birth + gender only. Empty closet still plates. Engine **81 ms** (budget 60 s). |
| Paywall | `GATES`. Free plate always legal. Style plates before it meters a sitting. |
| Member machine | preview / trial / active / lapsed / cancelled. Server entitlement. Lapse mid-session. |
| Checkout stub | Razorpay-shaped. Flag **off**. HMAC + idempotent webhook. No keys. No live calls. |
| Pricing draft | Inclusive of GST on the desk, marked not an invoice. Cancel / refund / auto-renew drafted. |
| Landing | One sentence. OG + sitemap. Signed-out `/` is the door. |

## Regression (this audit)

- `tsc --noEmit` clean.
- Product suite: **219** `src/lib` tests (this run, excluding outfit) + **59** `outfit.test.ts` including the **2000-plate** property test — **278 pass, 0 fail**.
- `npm audit --omit=dev`: **0** vulnerabilities.
- `scripts/client-bundle-secrets.test.mjs`: **3/3** (no live secrets in the client grep).
- Platform `scripts/*.test.mjs` (auth template vs app-on) still fail if you run the whole `npm test` string. Product files above are the ship gate.

## Screen walk

Chromium on `http://127.0.0.1:8080`:

| Path | HTTP | What painted |
| --- | --- | --- |
| `/` | 200 | Title Amirelle. Signed-out door (landing) or session pending. |
| `/login` | 200 | h1 Amirelle. Birth + who we dress. |
| `/sitemap.xml` | 200 | `/` and `/login`. |

Auth is ON, so Closet / Look / Looks / Practice / Journal / Membership / Privacy were not clicked live. Covered by `desk-screens`, `membership`, `privacy`, `closet-local`, `today-desk`. One `$_TSR` bootstrap invariant on a too-fast first paint — Start, not a white screen.

## REQUIRES-HUMAN-REVIEW (one list)

Nothing below is live. Do not publish as final. Source: `/docs/REVIEW-REQUIRED.md`.

1. **Minors** — parental consent, under-18 accounts, deletion, girl/boy labels.
2. **DPDP Act s.9** — whether we are a Data Fiduciary for on-device taste; verifiable parental consent; tracking / behavioural monitoring.
3. **Taste loop vs s.9(3)** — Holds / Almost / Not this, `catSoured`, wear log, grill sitting, membership shown to a minor.
4. **GST** — inclusive ₹999 / ₹8,990. Rate, HSN/SAC, whether a tax invoice exists. Desk line is draft, not an invoice.
5. **Cancellation** — paid cancel vs preview `setPlan("free")`. Parent cancels for a minor.
6. **Refund** — 7-day draft, no prorata, GST credit-note path. Preview has no charge.
7. **Auto-renewal** — India-civil `until`, 24h reminder, RBI e-mandate. `CHECKOUT_ENABLED` is false; no job runs.
8. **Checkout** — Razorpay merchant, webhook URL, secret custody, chargebacks. Stub only.
9. **Legal pages** — privacy policy, terms, cookie notice. In-app privacy copy is product voice, not a policy.

## Known-broken (ranked)

| Sev | Item | Where |
| --- | --- | --- |
| **S1** | Unsplash stills are not the SKU. | `src/lib/catalog.ts`, `/docs/STILL-AUDIT.md` |
| **S1** | Composite covers tops / bottoms / shoes only. Dresses, outer, acc still collage. Not a person wearing the look. | `src/lib/composite.ts`, `src/components/look-stack.tsx` |
| **S2** | Sitting / lookbook / roll still read **local** `meta.plan`, not `checkEntitlement`. | `src/lib/sitting.ts`, `src/store/closet.ts` |
| **S2** | Auth ON: inner screens need a session. | `src/routes/login.tsx`, `src/lib/auth/` |
| **S2** | Whole `npm test` includes platform scripts that expect template-off auth. | `package.json` `test` |
| **S3** | Login and header still print `gen.gen`. | `src/routes/login.tsx` ~133, ~169; `src/components/shell.tsx` ~180 |
| **S3** | Sitemap `<loc>` is a path, not an absolute host. | `public/sitemap.xml` |
| **S3** | Grill needs `XAI_API_KEY`; without it the sitting can spend and fall back to the rail. | `src/lib/style-me.ts` |
| **S3** | No live billing. Flag stays off. | `src/lib/checkout.ts` |

## Five highest-value next tasks

1. **Wire depth to the server machine.** `sittingsRemaining`, lookbook cap, and roll cap must call `checkEntitlement(userId, now)`, not `meta.plan`. Fail closed on depth; never block Today.  
   Open: [`src/lib/sitting.ts`](src/lib/sitting.ts), [`src/lib/member-machine.ts`](src/lib/member-machine.ts), [`src/store/closet.ts`](src/store/closet.ts), [`src/components/style-board.tsx`](src/components/style-board.tsx).

2. **Honest stills.** Licensed house photography per cut, or a labelled illustration — never a photo that pretends to be the SKU.  
   Open: [`src/lib/catalog.ts`](src/lib/catalog.ts), [`/docs/STILL-AUDIT.md`](/docs/STILL-AUDIT.md), [`src/lib/sample-closet.test.ts`](src/lib/sample-closet.test.ts).

3. **Finish the silent form.** Anchors for dresses, outerwear, accessories. If a cut has no anchor, keep collage and log it. No generated body.  
   Open: [`src/lib/composite.ts`](src/lib/composite.ts), [`src/components/look-stack.tsx`](src/components/look-stack.tsx), [`src/lib/catalog.ts`](src/lib/catalog.ts) (`CUT_STILL`).

4. **Counsel, then copy.** Do not wire Razorpay. Finish REVIEW-REQUIRED with counsel. Meanwhile strip `{gen.gen}` from login and the header.  
   Open: [`/docs/REVIEW-REQUIRED.md`](/docs/REVIEW-REQUIRED.md), [`src/routes/login.tsx`](src/routes/login.tsx), [`src/components/shell.tsx`](src/components/shell.tsx). Never weaken `validateLook`.

5. **Sitemap host + first-run clock.** Absolute sitemap loc once the public host is named. First-run `new Date()` on Today should go through `clock.ts` only.  
   Open: [`public/sitemap.xml`](public/sitemap.xml), [`src/lib/site.ts`](src/lib/site.ts), [`src/components/today.tsx`](src/components/today.tsx), [`src/lib/daily.ts`](src/lib/daily.ts).

Do not start speculative work. The next queued message is the next task.
