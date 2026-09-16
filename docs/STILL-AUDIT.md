# CUT_STILL audit

India-first house rail. Every cut must have a still, and that still must be declared in the cut's category pool. No new Unsplash ids — reassigned existing stills only.

## Gate

`photoFor(cat, cut)` → unsplash id. Declared category = pools that contain the id. Pass = id exists and pools include `cat`.

## Fixed this pass

| Cut | Was | Now |
| --- | --- | --- |
| shirt dress, shirt-tail dress, t-shirt dress | tops shirt still (`/shirt/` first) | dress still, dress regex first |
| polo dress, knit polo dress | tops polo still | dress still |
| wrap midi | generic dress pool | dress still (`wrap midi` in dress regex) |
| cap, beanie | `photo-1588850561407-42b7be8d0c0e` (not in any pool — placeholder) | `photo-1553062407-98eeb64c6a31` (accessories) |
| blazer, unstructured blazer, suit jacket | `photo-1594938298603-c8148c4dae35` (tops **and** outerwear) | `photo-1521223890158-f9f7c3d5d504` (outerwear only) |

## Mismatch

None. Test: `CUT_STILL / every cut has a still whose declared category includes the cut`.

## Placeholder

None. Every CUT_STILL id lives in exactly one category pool.

## Pool fallback (named still not mapped — category still matches)

These cuts have no regex in `CUT_STILL`. They take `POOL[cat][0]`. Not a mismatch. Not a SKU photo.

**tops:** silk camisole, merino crew, cashmere crew, rugby knit, turtleneck, boat-neck knit, fine-gauge cardigan

**bottoms:** culottes, denim skirt, midi skirt

**shoes:** slide, monk strap, espadrille, mary jane

**accessories:** leather belt, woven belt, hoop earrings, drop earrings, chain necklace, silk scarf, wool scarf, card holder, wallet, hair clip, ring set, phone pouch

**outerwear:** peacoat, denim jacket, bomber, quilted jacket, chore coat, shacket, cardigan coat, cape coat, field jacket, Nehru jacket, coach jacket, windbreaker, car coat, duffle coat, wrap coat

## Still not a SKU

CUT_STILL is Unsplash, not the house site. That gap stays. Do not pretend these ids are Zara/Mango product shots.
