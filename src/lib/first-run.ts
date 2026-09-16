import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { EMPTY_TASTE } from "./habit.ts";
import { plateForSituation } from "./today-desk.ts";
import type { Cloth, Gender, Generation } from "./types.ts";

export const FIRST_RUN_BUDGET_MS = 60_000;
export const FIRST_RUN_ASKS = ["birth", "gender"] as const;

/** House rail if the closet is empty. Never a blank plate. */
export function firstLookRail(clothes: Cloth[], gen: Generation, gender: Gender | ""): Cloth[] {
  const filtered = forYou(clothes, gen, gender);
  if (filtered.length) return filtered;
  return forYou(SAMPLE_CLOSET, gen, gender);
}

export function firstPlate(
  clothes: Cloth[],
  gen: Generation,
  gender: Gender | "",
  occ = "casual",
) {
  return plateForSituation(firstLookRail(clothes, gen, gender), "", [], gen, EMPTY_TASTE, occ);
}

export function timeFirstPlate(
  clothes: Cloth[],
  gen: Generation = "z",
  gender: Gender | "" = "femme",
): { ms: number; pieces: number; ok: boolean } {
  const t0 = performance.now();
  const look = firstPlate(clothes, gen, gender);
  const ms = performance.now() - t0;
  return { ms, pieces: look.pieces.length, ok: look.fit.ok && look.pieces.length > 0 };
}
