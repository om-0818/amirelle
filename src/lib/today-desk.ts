import { EMPTY_TASTE, type Taste } from "./habit.ts";
import { localLook, type LookDraft } from "./outfit.ts";
import { RAIL_FAILED } from "./resilience.ts";
import type { Cloth, Generation } from "./types.ts";

export type DeskKey = "hold" | "almost" | "skip";

export function deskIsTyping(target: EventTarget | null): boolean {
  if (!target || typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function deskShortcut(key: string, typing: boolean, worn: boolean): DeskKey | null {
  if (typing) return null;
  const k = key.length === 1 ? key.toLowerCase() : key;
  if (k === "n") return "skip";
  if (k === "a") return "almost";
  if ((k === "h" || k === "w") && !worn) return "hold";
  return null;
}

/** Chip path: new situation, same rail, no page reload. */
export function plateForSituation(
  clothes: Cloth[],
  theme: string,
  pinned: number[],
  gen: Generation,
  taste: Taste = EMPTY_TASTE,
  occ = "casual",
  skip: number[] = [],
): LookDraft {
  if (!clothes.length) {
    return {
      pieces: [],
      desc: RAIL_FAILED,
      why: [RAIL_FAILED],
      vibe: "Tonight",
      fit: { ok: false, issues: [{ code: "kit", detail: "Empty rail" }] },
    };
  }
  return localLook(clothes, theme, pinned, gen, skip, taste, occ);
}
