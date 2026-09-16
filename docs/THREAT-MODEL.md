# Threat model — Amirelle

Map only. 15 Sep 2026. No fixes this turn.

**Assets:** camera-roll stills (data URLs), birth date (minors), gender, city, taste, wears, look history, Better Auth session, `XAI_API_KEY` (server), house rail stills (Unsplash).

**Actors:** same-device user; XSS in origin; sibling `*.grok.me` tenant; network observer; xAI; Unsplash; wttr.in; stolen-session holder.

---

## Boundaries (ranked)

### S1 — Browser origin / `localStorage`

**Boundary:** this origin’s storage (`STORAGE_KEYS` in `src/lib/privacy.ts`). Closet photos live as `data:image/jpeg` on `amirelle_user_v1`. Birth and gender also in `sessionStorage` / `localStorage` and, after onboard, on the account.

**Attacker gains:** every photo the member brought; wear log; taste; pins; sitting count; a minor’s birth date. Same-device: DevTools. Cross-origin: any XSS on this origin.

**Mitigation now:** photos never sent on the grill line (`leavesDeviceForGrill` / `grillWardrobe`). No Google Photos library scan. Sandbox without `allow-same-origin` cannot read `localStorage` (preview quirk, not a product control). Wipe in Privacy clears every `STORAGE_KEYS` row. No HttpOnly on local data — by design, local-first.

### S1 — `grillOutfit` server function → xAI

**Boundary:** `src/lib/style-me.ts` `createServerFn` POST. **No `authMiddleware`.** Client sends wardrobe lines (`id|cat|name|color|brand`), city, occ, mood, generation `tone`, calendar. Handler calls `https://api.x.ai/v1/chat/completions` with `process.env.XAI_API_KEY`.

**Attacker gains:** spend the app owner’s xAI quota from any caller who can hit the function; send a crafted wardrobe/prompt to xAI; learn keep/cut copy. Not photos (stripped). Prompt injection via wardrobe `name` / `force` / `calendar` can steer the model; `gateGrillLook` still blocks illegal *plates*, not the outbound prompt.

**Mitigation now:** no photos in the payload. 14s timeout. JSON-only parse. `gateGrillLook` before return. Missing key returns a string error. Sitting meter is **client** `meta` — not a server quota.

### S2 — Better Auth session + `/api/auth/*`

**Boundary:** `src/routes/api/auth/$.ts`, Better Auth cookies, `authMiddleware` → `context.userId`.

**Attacker gains:** with a stolen session: `getProfile` / `saveProfile` (birth, gender, city, identity) for that `user_id`. Not the closet (closet is not on the server).

**Mitigation now:** `assertSameSiteRequest` on scripted sibling-tenant calls (`src/lib/auth/isolation.server.ts`). `__Host-` cookies + `trustedOrigins` (auth skill). Profile SQL scoped by `context.userId`, never a client-sent id.

### S2 — Profile rows (Postgres)

**Boundary:** `profiles` table via `src/lib/profile.ts`. Fields: `birth_date`, `gender`, `city`, `identity`, `onboarded`. Minors’ dates live here once they have an account. **REQUIRES-HUMAN-REVIEW** (`/docs/REVIEW-REQUIRED.md`).

**Attacker gains:** DB dump or stolen `userId` → age/gender/city. No photos in this table.

**Mitigation now:** auth middleware + user_id bind. Closet not replicated. Human-gate copy is not a control.

### S2 — Third-party stills (Unsplash)

**Boundary:** `<img src="https://images.unsplash.com/photo-…">` from `PHOTO()` in `src/lib/catalog.ts`. Browser fetches on every rail render.

**Attacker gains:** Unsplash (and any CDN observer) sees member IP, referrer, which stills loaded — a coarse dress-timing signal. A compromised Unsplash id serves a different image (phishing/malware page if navigation, or tracking pixel). Mixed-content not an issue (https).

**Mitigation now:** `https` only. House stills are not the member’s photos. User roll is data URLs (no third-party fetch). No `crossorigin` credentialed cookies to Unsplash.

### S3 — Image inputs (camera roll)

**Boundary:** `<input type="file" accept="image/*">` → `fileToRailPhoto` (`src/lib/photos.ts`) → canvas JPEG data URL in `localStorage`.

**Attacker gains:** a huge file fills quota (user sees `QUOTA_MSG`, previous closet kept). A crafted SVG/script image: canvas re-encode to JPEG drops script. EXIF may survive until draw; canvas raster does not keep GPS as metadata in the JPEG we write at 0.72. XSS still reads the stored data URL (see S1).

**Mitigation now:** rasterize to 800×1066 JPEG. Roll cap 20 / 80. Grill wardrobe omits `photo`. Quota failure is visible, not a silent drop.

### S3 — `fetchWeather`

**Boundary:** unauthenticated `createServerFn` POST, `city` interpolated into `https://wttr.in/${city}?format=j1`.

**Attacker gains:** use the app server as a client to wttr.in (limited SSRF: scheme/host fixed). City string is `encodeURIComponent`’d. Weather JSON shapes the plate (suede veto etc.) — a lie about weather, not a data steal.

**Mitigation now:** host is fixed. Failure returns `DEFAULT_WEATHER`. No member PII in the request besides the city they typed.

### S3 — Preview host bridge

**Boundary:** `postMessage` from allowlisted Grok embedder (`src/lib/preview-host-bridge.ts`). Types: hello, navigate, history, connector-token-ready.

**Attacker gains:** if a non-embedder origin were accepted, it could `navigate` in-app (open `/login`, not steal storage — storage is same-origin). Connector token event is for `app-data`, not the closet.

**Mitigation now:** origin allowlist + `isSafeBridgePath` (must start `/`, no `//`). Top-level runs noop.

### S3 — Rendered look / grill copy

**Boundary:** model `keep` / `cut` / `roast` strings rendered as text in the desk.

**Attacker gains:** stored XSS if those strings were HTML-injected. React text nodes escape. `items` from the model are not used as `img src`.

**Mitigation now:** React text. `validateLook` on pieces, not on copy. `assertRenderableLook` in LookStack (dev throw).

---

## What is not a boundary

- House catalog of ~15k synthetic pieces — not member data.
- Membership preview unlock — no payment SDK, no card.
- `validateLook` — integrity of a *look*, not a security gate.
- Client sitting meter — a product rule; wiping `amirelle_meta_v4` is a full STORAGE_KEYS clear, not a bypass of a server quota (there is none).

---

## Severity list (no fixes)

1. **S1** XSS or shared browser → full local closet + minor birth date.
2. **S1** Unauthenticated grill → xAI key spend + wardrobe names to a third party.
3. **S2** Stolen session → profile (birth/gender/city), not photos.
4. **S2** Unsplash requests leak IP / which stills.
5. **S3** Weather city SSRF-to-wttr; file quota; preview navigate; model copy XSS (mitigated by React).
