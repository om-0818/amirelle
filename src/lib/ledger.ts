import { trainTaste, EMPTY_TASTE, type Taste, type WornDay } from "./habit.ts";
import type { Cloth } from "./types.ts";

export type WearOutcome = "worn" | "almost" | "not";

export type WearRecord = {
  item: number;
  date: string;
  occ: string;
  outcome: WearOutcome;
};

const OUTCOMES = new Set<WearOutcome>(["worn", "almost", "not"]);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DIR: Record<WearOutcome, 1 | -1 | 2> = { worn: 2, almost: -1, not: -1 };

export function parseLedger(raw: string): WearRecord[] {
  if (!raw) return [];
  try {
    const rows = JSON.parse(raw) as unknown;
    if (!Array.isArray(rows)) return [];
    const out: WearRecord[] = [];
    for (const r of rows) {
      if (!r || typeof r !== "object") continue;
      const rec = r as Partial<WearRecord>;
      if (typeof rec.item !== "number" || !Number.isFinite(rec.item)) continue;
      if (typeof rec.date !== "string" || !DAY.test(rec.date)) continue;
      if (typeof rec.occ !== "string" || !rec.occ) continue;
      if (!OUTCOMES.has(rec.outcome as WearOutcome)) continue;
      out.push({ item: rec.item, date: rec.date, occ: rec.occ, outcome: rec.outcome as WearOutcome });
    }
    return out;
  } catch {
    return [];
  }
}

/** Append-only. Never edit a past row. */
export function appendWear(ledger: WearRecord[], row: WearRecord): WearRecord[] {
  return [...ledger, row];
}

export function countsFromLedger(ledger: WearRecord[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const r of ledger) {
    if (r.outcome !== "worn") continue;
    counts[r.item] = (counts[r.item] ?? 0) + 1;
  }
  return counts;
}

export function daysFromLedger(ledger: WearRecord[]): WornDay[] {
  const byDate = new Map<string, string>();
  for (const r of ledger) {
    if (r.outcome !== "worn") continue;
    const vibe = r.occ ? r.occ[0].toUpperCase() + r.occ.slice(1) : "Worn";
    byDate.set(r.date, vibe);
  }
  return [...byDate.entries()].reverse().map(([iso, vibe]) => ({ iso, vibe }));
}

export function tasteFromLedger(ledger: WearRecord[], pieceOf: (id: number) => Cloth | undefined): Taste {
  let taste = { ...EMPTY_TASTE, brands: {}, colors: {}, cats: {} };
  for (const r of ledger) {
    const c = pieceOf(r.item);
    if (!c) continue;
    taste = trainTaste(taste, [c], DIR[r.outcome]);
  }
  return taste;
}

export function ledgerFromV1(input: {
  counts?: Record<string, number>;
  wornLog?: { iso: string; vibe?: string }[];
  lastWear?: string;
  lastWornIds?: number[];
}): WearRecord[] {
  const rows: WearRecord[] = [];
  const last = input.lastWear || input.wornLog?.[0]?.iso || "";
  const lastOcc = (input.wornLog?.find((w) => w.iso === last)?.vibe || "casual").toLowerCase();
  const have = new Map<number, number>();
  if (last && input.lastWornIds?.length) {
    for (const id of input.lastWornIds) {
      rows.push({ item: id, date: last, occ: lastOcc || "casual", outcome: "worn" });
      have.set(id, (have.get(id) ?? 0) + 1);
    }
  }
  for (const [k, n] of Object.entries(input.counts ?? {})) {
    const id = Number(k);
    if (!Number.isFinite(id) || n <= 0) continue;
    let got = have.get(id) ?? 0;
    const date = last || "1970-01-01";
    while (got < n) {
      rows.push({ item: id, date, occ: lastOcc || "casual", outcome: "worn" });
      got += 1;
    }
  }
  return rows;
}
