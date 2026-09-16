# REQUIRES-HUMAN-REVIEW

Nothing in this file is wired to a live path. Do not publish as final.
Draft only. The engineer decides nothing here.

## Secrets in the tree — REQUIRES-HUMAN-REVIEW

Flag only. Not deleted. History not rewritten.

- `src/lib/auth/preview.ts` — looks like it holds a live-preview OAuth client secret. Human call: rotate, move to env, or leave as the shared preview client.

## Minors

- Age 10–13 (alpha) and 14–17 (teen) are on the desk with girl/boy labels, modest occasion cuts, no heels/clubwear.
- Birth date is stored on the account so the rail follows the member.
- Photos they bring stay as data URLs in this browser. The stylist is sent names, not pictures.
- **Open:** parental consent, data-retention for under-18, whether a 10-year-old may hold an email account, deletion on request.

## DPDP Act, 2023 — users under 18 (memo, not a decision)

Sources read for this draft: DPDP Act 2023 s.2(k) and s.9; DPDP Rules, 2025 r.10 (G.S.R. 846(E), 13 Nov 2025); public commentaries dated 2026. Counsel must verify current text. This is not legal advice.

### What the statute says (as drafted, not applied)

- **Child** = a person who has not completed 18 years (s.2(k)). No mature-minor carve-out in the Act itself.
- **s.9(1)** — before processing a child's personal data, the Data Fiduciary shall obtain **verifiable consent of the parent / lawful guardian**, in the manner prescribed (Rules r.10: in-house identity already held, details the parent volunteers, or a government / Digital Locker virtual token). A self-ticked "I am the parent" box is widely described as insufficient.
- **s.9(2)** — no processing likely to cause a detrimental effect on a child's well-being. Consent does not lift this.
- **s.9(3)** — the Fiduciary **shall not** undertake tracking or behavioural monitoring of children, or targeted advertising directed at children. Commentaries treat this as **not consent-curable**.
- **s.9(4)–(5)** — Central Government may prescribe class/purpose exemptions or a higher safe-age for a named Fiduciary. None is assumed for Amirelle.
- **Penalty** (Schedule, children's data): commentaries cite up to ₹200 crore per contravention. Confirm against the current Schedule.
- **Rules r.10** commencement is reported as **13 May 2027**. The Act's s.9 is already on the books. Counsel to map what applies on ship date vs that date.

### What Amirelle currently does that counsel must map

Account payload on purpose: **email, birth, gender, city** — nothing else. Birth is how we know under-18. Email is the member door. Gender is "who we dress." City is weather. That is already more than a name.

Local-only closet, photos (data URLs), wears, pins, journal, theme stay in this browser (`STORAGE_KEYS`). Whether on-device storage under our determination of means is still "processing" by a Data Fiduciary is **for counsel**. Do not assume local-first = out of scope.

### Taste loop vs s.9(3) — affected parts (map only)

| Mechanism | What it does | Why it may be in scope of "behavioural monitoring" / targeting |
| --- | --- | --- |
| `trainTaste` / Holds · Almost · Not this | Scores brands, colours, categories from the child's taps | Builds a behavioural preference profile |
| `catSoured` | After enough "Not this", that category is suppressed | Automated monitoring of in-product behaviour |
| `amirelle_taste_v1` | Persists that profile across sessions | Cross-session tracking of taste |
| `wears` / CPW / week strip | Counts what was worn, when | Habit / frequency monitoring |
| Grill sitting (1/day, IST) | Caps and timestamps a stylist call | Session counting; not ads, still a behavioural log |
| Occasion plating from birth → generation | Editorial kit, not a learned profile | Age-based product rule. Still *uses* birth. VPC question, not 9(3) |
| Membership copy (₹999 / ₹8,990) | Upgrade prompts | Whether a paywall shown to a minor is "targeted" is for counsel |
| Unsplash stills / house rail | Catalog, not the child's data | Unlikely 9(3). Separate IP/privacy of stills |

Personalising the next plate from Holds/Almost/Not this is the closest analogue to "personalising recommendations using the child's in-product behaviour", which public playbooks list as **prohibited** under s.9(3) even with parental consent.

### Open questions (do not implement)

1. Is Amirelle a Data Fiduciary for on-device taste, or only for the account row (email/birth/gender/city)?
2. What counts as verifiable parental consent for a 10–17 year old who types a birth date at the door?
3. Must the taste loop, wear log, and grill sitting be **off** for under-18, or is an editorial (non-learned) plate enough?
4. May we show membership pricing to a minor?
5. Retention and deletion: account row vs local keys vs export JSON.
6. Girl/boy labels for minors — data minimisation vs dressing the rail.

No code in this memo. No flag. No age-gate change.

## Membership / money

- Preview copy: ₹999 / month, ₹8,990 / year, “two months given.”
- On-desk GST line (draft, not an invoice): “Inclusive of GST. Draft — not a tax invoice.”
- Preview unlocks the desk; no card is taken in this build.
- **Open:** whether inclusive GST is 18% OIDAR, the HSN/SAC code, and whether a tax invoice is issued on capture.

### Cancellation — REQUIRES-HUMAN-REVIEW

Draft only. Not live. Not a contract.

- Complimentary members have nothing to cancel. Leaving membership in preview returns the desk to complimentary immediately and does not bill.
- A paid month or year (when billing exists) would stop auto-renewal at the end of the paid period. Access stays through `until` on the server machine, then lapses. No partial-day clawback is assumed.
- Cancel from the Membership desk, or in writing to the support address counsel names. Minors: cancellation by the parent / guardian who gave consent (see DPDP memo). Do not treat a local `setPlan("free")` as a paid cancellation.

### Refund — REQUIRES-HUMAN-REVIEW

Draft only. Not live. Not a consumer-policy.

- Preview unlock: no charge, so no refund.
- Draft stance if billing ships: 7 India-civil days from first capture for a full refund if no paid sitting was used; after that, no prorata on the month, year unused months not cashed out. Chargebacks follow the Razorpay merchant agreement (not drafted here).
- GST: a refund of an inclusive price refunds the GST component only when a tax invoice was issued and counsel confirms the credit-note path. This stub issues no invoice.

### Auto-renewal — REQUIRES-HUMAN-REVIEW

Draft only. Not live.

- Month renews on the next India-civil `until` unless cancelled. Year renews on the anniversary `until`.
- Reminder: at least 24 hours before renewal, in-app and email, stating the amount inclusive of GST. Silence is not consent for a first charge; it may be consent for a disclosed renewal once counsel maps RBI e-mandate / card-on-file rules.
- `CHECKOUT_ENABLED` is false. No mandate, no card, no renewal job runs.

### Checkout (Razorpay-shaped stub) — REQUIRES-HUMAN-REVIEW

- `CHECKOUT_ENABLED` is **false**. `CHECKOUT_MODE` is **test**. No live keys, no `api.razorpay.com`, no SDK, no charge.
- Webhook HMAC + idempotent inbox exist as a handler only. Captured events are **not** applied to membership.
- **Open:** merchant account, GST invoice, webhook URL, refunds, chargebacks, who holds the Razorpay webhook secret. Do not ship a live path from this stub.

## Legal

- Privacy copy in-app is product voice, not a policy.
- **Open:** privacy policy, terms, cookie notice, India DPDP applicability (see memo above).

### Privacy Policy — REQUIRES-HUMAN-REVIEW

Draft only. Not a live page. Not published. Not a contract. Kai decides whether this ever ships.

**Who we are (placeholder).** Amirelle is an India-first style desk. Contact and Data Fiduciary details: [FILL: legal entity, address, DPO].

**What we collect on the account.** Email, birth date, gender (who we dress), city. That is the account payload. The server profile row also currently stores a silent identity label and an onboarded flag — counsel to confirm whether those stay.

**What stays on this device.** Closet pieces, photos you brought (as data URLs), pins, wear ledger, taste, looks, journal, theme, sittings. These live in this browser under `STORAGE_KEYS`. They are not uploaded as a photo library. The stylist, when called, is sent names and cuts, not pictures.

**What we do not do.** We do not scan a Google Photos library. We do not sell the closet. Checkout is off; no card is stored in this build.

**Minors (under 18).** Birth date is how we know. Girl/boy labels and occasion cuts apply. India's DPDP Act s.9 — parental consent, no behavioural monitoring or targeting of children — is mapped in the memo above. Taste, wears, and grill sitting may be in scope of s.9(3). **Do not treat this draft as a lawful basis.** Counsel decides. Nothing in this paragraph is wired as a gate.

**Retention and deletion.** Export downloads the local JSON. Delete clears every `STORAGE_KEYS` row in this browser. Account-row deletion on the server: [FILL: process].

**Stills.** House rail photographs are third-party (Unsplash ids). They are not your photos.

### Terms of Service — REQUIRES-HUMAN-REVIEW

Draft only. Not a live page. Not published.

- The desk plates looks from the house rail or from photos you file. It does not invent garments.
- Complimentary members get a correct, occasion-legal plate. Membership, when billed, buys depth (sittings, looks kept, roll photos), not a more legal look.
- Prices on the desk (₹999 / month, ₹8,990 / year, inclusive of GST) are invitation copy. Not a tax invoice. `CHECKOUT_ENABLED` is false. No charge, no auto-renewal, no mandate in this build.
- Cancellation, refund, and auto-renewal drafts live in the Membership / money section above. They are not live terms.
- You must be 10 to enter. Under 18: parent / guardian [FILL: consent mechanism].
- The look is editorial, not a guarantee that a store still stocks that cut.
- Limitation of liability, governing law (India), and dispute forum: [FILL: counsel].

Do not mount these as `/privacy` or `/terms` without Kai.
