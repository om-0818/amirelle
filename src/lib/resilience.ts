import type { Cloth } from "./types.ts";

export const EMPTY_CLOSET =
  "Nothing on this rail yet. Bring a photo of a piece you own, or reset the filters.";

export const RAIL_FAILED =
  "The house rail did not load. Bring a photo, or open the closet and try again.";

const FALLBACK_ERROR = "The desk hit a snag. The look is still on your rail.";

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_ERROR;
}

export function railStatus(clothes: Cloth[] | undefined | null): {
  ok: boolean;
  clothes: Cloth[];
  message: string;
} {
  if (!Array.isArray(clothes) || clothes.length === 0) {
    return { ok: false, clothes: [], message: RAIL_FAILED };
  }
  return { ok: true, clothes, message: "" };
}

export function closetEmpty(all: number, filtered: number): "none" | "filter" | "ok" {
  if (all <= 0) return "none";
  if (filtered <= 0) return "filter";
  return "ok";
}
