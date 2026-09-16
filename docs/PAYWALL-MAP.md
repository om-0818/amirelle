# Paywall map

Complimentary members get a **correct, complete, occasion-legal plate**. We gate depth, never correctness. Membership does not buy legality.

`corePlateBlocked(plan)` is always `false`. Source of truth: `GATES` in `src/lib/membership.ts`.

## Surfaces

| Surface | Free | Member | Gates |
| --- | --- | --- | --- |
| Today plate | Complete occasion-legal look from the rail. Holds, Almost, Not this. | The same plate. Membership does not make a look more legal. | never |
| Stylist sitting | 1 sitting a day, India civil midnight | Unlimited sittings | depth |
| Looks kept | 8 looks | 80 looks | depth |
| Your photos | 20 photos from the roll, on this device | 80 photos from the roll, on this device | depth |
| Membership desk | Invitation. Preview unlock. No card. | The desk is open | depth |

## Core rule

A free user always receives a plated look that would pass `validateLook` on Today. If the stylist sitting is spent, Style still plates from the rail and says so. It does not bounce them to Membership instead of a look.

## Not gated

Closet browse, pins, week strip, cost per wear, practice, essays, privacy, dark mode, the house rail, first-run (birth + gender).

## Money

Preview unlock sets plan `atelier` with `billed: false`, `card: false`. No payment SDK. Prices on the desk are invitation copy, not a charge.

## Review

Live billing, refunds, and legal copy stay in `/docs/REVIEW-REQUIRED.md`. This map does not authorise a charge.
