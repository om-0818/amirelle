import { ESSAYS, PRACTICE } from "./practice.ts";
import type { Cloth, HistoryEntry } from "./types.ts";

export function currentPractice(day: number) {
  const n = Number.isFinite(day) ? Math.trunc(day) : 1;
  const i = Math.min(PRACTICE.length, Math.max(1, n)) - 1;
  return PRACTICE[i] ?? PRACTICE[0];
}

export function looksSafe(history: HistoryEntry[] | undefined | null): HistoryEntry[] {
  return Array.isArray(history) ? history : [];
}

export function piecesForLook(entry: HistoryEntry, closet: Cloth[]): Cloth[] {
  const rows = Array.isArray(entry.pieces) ? entry.pieces : [];
  return rows.map((p, i) => {
    const hit = closet.find((c) => c.name === p.name && c.cat === p.cat && (c.brand ?? "") === (p.brand ?? ""));
    if (hit) return hit;
    return {
      id: -(i + 1),
      name: p.name,
      cat: p.cat,
      color: "",
      photo: p.photo,
      brand: p.brand,
    };
  });
}

export function journalEssays(): { slug: string; title: string; dek: string; body: string }[] {
  return [...ESSAYS];
}
