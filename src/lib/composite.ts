import type { Category, Cloth } from "./types.ts";
import { CUT_STILL } from "./catalog.ts";

/** First three wearable cats. Outerwear and accessories stay collage. */
export const COMPOSITE_CATS: Category[] = ["tops", "bottoms", "shoes"];

export type Anchor = {
  z: number;
  top: string;
  left: string;
  width: string;
  height: string;
};

const CAT_ANCHOR: Record<string, Anchor> = {
  shoes: { z: 1, top: "70%", left: "28%", width: "44%", height: "28%" },
  bottoms: { z: 2, top: "40%", left: "24%", width: "52%", height: "38%" },
  tops: { z: 3, top: "6%", left: "20%", width: "60%", height: "40%" },
};

export type CompositeLayer = {
  id: number;
  src: string;
  cut: string;
  cat: Category;
  anchor: Anchor;
};

export type CompositePlan =
  | { kind: "composite"; layers: CompositeLayer[] }
  | { kind: "collage"; skipped: string[] };

export function cutHasStill(cut: string): boolean {
  return CUT_STILL.some(([re]) => re.test(cut));
}

export function anchorFor(cut: string | undefined, cat: Category): Anchor | null {
  if (!COMPOSITE_CATS.includes(cat)) return null;
  if (!cut || !cutHasStill(cut)) return null;
  return CAT_ANCHOR[cat] ?? null;
}

/** Layer real stills on a silent form. No generation. Missing anchors → collage. */
export function compositePlan(pieces: Cloth[]): CompositePlan {
  const skipped: string[] = [];
  const layers: CompositeLayer[] = [];
  for (const p of pieces) {
    const cut = p.cut || p.name;
    const anchor = anchorFor(p.cut, p.cat);
    if (!anchor || !p.photo) {
      skipped.push(cut);
      continue;
    }
    layers.push({ id: p.id, src: p.photo, cut, cat: p.cat, anchor });
  }
  if (skipped.length) return { kind: "collage", skipped };
  if (!layers.length) return { kind: "collage", skipped: ["empty"] };
  layers.sort((a, b) => a.anchor.z - b.anchor.z);
  return { kind: "composite", layers };
}
