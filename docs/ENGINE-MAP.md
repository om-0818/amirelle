# Engine map — gate integrity

Read 2026-09-15. `src/lib/outfit.ts` as it stands. **No fixes this turn.**

Gate contract (product law): a look cannot plate unless `validateLook(...).ok === true`.

`LookDraft` = `{ pieces, desc, why, vibe, fit }`. The store does not keep `fit`. UI plates `Cloth[]` via `setLook` → `lastPieces` or `history`.

---

## Exports

| Export | Kind | Callers | Produces a look? | Passes `validateLook`? |
| --- | --- | --- | --- | --- |
| `colorFamily` | util | internal `harmony` only | no | n/a |
| `orderedPieces` | util | `lookCredits`, `stylistNote`, `stripLook`, `look-stack`, `outfit.test` | no (sorts) | no |
| `lookCredits` | util | `creditsText`, `LookCredits` | no (rows) | no |
| `creditsText` | util | `style-board` share, `looks` copy | no (string) | no |
| `OCCASION_KIT` | table | `kitFor` | no | n/a |
| `kitFor` | lookup | engine internals | no | n/a |
| `occasionScore` | score | engine, `railForPrompt`, `outfit.test` | no | n/a |
| `keepCut` | copy | `localLook`, `outfit.test` | no | n/a — runs on whatever pieces it is given |
| `stylistNote` | copy | `tense.test` only (UI uses `keepCut`) | no | n/a |
| `vibeFrom` | copy | `localLook`, `tense.test` | no | n/a |
| `FitIssue` / `FitReport` / `LookDraft` | types | TS only | n/a | n/a |
| `stripLook` | filter | `draftLook`, `style-board` grill, `outfit.test` | yes (Cloth[]) | **no — caller must** |
| `validateLook` | gate | `localLook`, `today` (display only), `style-board` grill, tests | no (report) | is the gate |
| `localLook` | composer | `today.compose`, `style-board.run`, tests | yes (LookDraft) | **calls it, then returns even when `fit.ok === false`** |
| `railForPrompt` | ranking | `style-board` wardrobe string | no (id list, not an outfit) | no |

Private, not exported: `harmony`, `clothBlob`, `outerAllowed`, `accAllowed`, `CUT_LINE`, `draftLook`. `draftLook` always ends in `stripLook`; it never calls `validateLook`.

---

## Composer internals

```
localLook
  → draftLook (pins + take() + stripLook)
  → validateLook
  → up to 5 retries, but only if unpinned veto ids exist
  → always return LookDraft  ← fit.ok may still be false
```

Retry hole: pinned vetoes are never excluded (`!pinned.includes(p.id)`). A pin can force a failing look through `localLook`.

`validateLook` weather only flags suede when `theme` is `"rainy"` or `"cold"`. Monsoon via `fashionPulse.season` is not a theme string — suede can pass the gate on a wet India day if `weather.theme` is empty.

---

## Paths a look reaches the UI

```
[A] Today compose / situation chip / auto-plate / Holds-tomorrow / Almost / Not this
    localLook → setLook(draft.pieces, …)     ← does not read draft.fit.ok
    → lastPieces
    → LookStack, LookCredits, Keep/Cut copy
    Today then re-runs validateLook only to print "This holds" / first issue.
    Failures still render.

[B] Style Look (grill)
    1. localLook → setLook(draft) immediately (same as A, ungated)
    2. grillOutfit returns ids (names only — not photos)
    3. stripLook(matched, occ, pinned)
    4. validateLook — IF ok, replace; ELSE keep draft from (1)
    Second setLook. Grill cannot plate a failing AI look, but can plate a failing localLook.

[C] Lookbook
    saveLook snapshots lastPieces into history (no re-validate)
    Looks.tsx rebuilds Cloth[] with synthetic ids and empty color
    → LookStack + LookCredits
    No validateLook on replay.

[D] Presentation only
    LookStack / LookCredits take any Cloth[]. No gate.
    They are not composers; they will show an illegal body if handed one.
```

`setLook` itself is ungated. `lastPieces` is session memory (not persisted). History is persisted (`amirelle_history_v2`).

Wear / pass / taste train on `lastPieces` without re-checking fit.

---

## Flags (do not fix this turn)

1. **`localLook` is not a hard gate.** It records `fit` and still returns pieces. Product law said a look cannot plate unless `fit.ok`. Today and Style plate anyway.
2. **Pins punch through strip + retry.** A pinned leather jacket at gym will plate.
3. **Lookbook replay** never validates. Pre-gate history and synthetic ids can show an illegal body.
4. **`stripLook` is public** and can emit a Cloth[] with no subsequent gate if a future caller forgets (Style currently does both).
5. **Weather gap inside the gate:** monsoon ≠ `theme === "rainy"`.
6. **Not flags:** `railForPrompt` (not a look); grill names-only (product law 2); collage LookStack (no-generation rule).

---

## UI consumers (non-composers)

- `today.tsx` — composer A + display of `fit`
- `style-board.tsx` — composer B
- `looks.tsx` — path C
- `look-stack.tsx` — path D
