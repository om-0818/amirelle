import { addDaysIST, dateKeyInZone, weekdayIST } from "./clock.ts";
import { todayKey, yesterdayKey, type Cloth } from "./types.ts";

export type Taste = {
  brands: Record<string, number>;
  colors: Record<string, number>;
  cats: Record<string, number>;
};

export const EMPTY_TASTE: Taste = { brands: {}, colors: {}, cats: {} };

export type WornDay = { iso: string; vibe: string };

/** After this many Not-this on a category, the desk stops reaching for it. */
const CAT_SOUR = -8;

export function tasteScore(c: Cloth, taste: Taste) {
  const b = c.brand ? (taste.brands[c.brand] ?? 0) : 0;
  const col = taste.colors[c.color.toLowerCase()] ?? 0;
  const cat = taste.cats[c.cat] ?? 0;
  return b * 2 + col + cat * 2;
}

export function catSoured(taste: Taste, cat: Cloth["cat"]) {
  return (taste.cats[cat] ?? 0) <= CAT_SOUR;
}

export function trainTaste(taste: Taste, pieces: Cloth[], dir: 1 | -1 | 2): Taste {
  const brands = { ...taste.brands };
  const colors = { ...taste.colors };
  const cats = { ...(taste.cats ?? {}) };
  for (const p of pieces) {
    if (p.brand) brands[p.brand] = (brands[p.brand] ?? 0) + dir;
    const col = p.color.toLowerCase();
    colors[col] = (colors[col] ?? 0) + dir;
    cats[p.cat] = (cats[p.cat] ?? 0) + dir;
  }
  return { brands, colors, cats };
}

export function costPerWear(price: number | undefined, wears: number) {
  if (price == null || !Number.isFinite(price) || price <= 0) return null;
  if (!Number.isFinite(wears) || wears <= 0) return null;
  const n = Math.round(price / wears);
  return Number.isFinite(n) ? n : null;
}

export function formatCpw(n: number) {
  if (!Number.isFinite(n)) return "";
  return `₹${n.toLocaleString("en-IN")}`;
}

export type WardrobeMetrics = {
  pieces: number;
  worn: number;
  quiet: number;
  wears: number;
  avgCpw: number | null;
  best: { name: string; brand?: string; cpw: number } | null;
  worst: { name: string; brand?: string; cpw: number } | null;
};

export function wardrobeMetrics(clothes: Cloth[], counts: Record<number, number>): WardrobeMetrics {
  const priced: { cloth: Cloth; cpw: number; wears: number }[] = [];
  let worn = 0;
  let wears = 0;
  for (const c of clothes) {
    const n = counts[c.id] ?? 0;
    wears += n;
    if (n > 0) worn += 1;
    const cpw = costPerWear(c.price, n);
    if (cpw != null) priced.push({ cloth: c, cpw, wears: n });
  }
  priced.sort((a, b) => a.cpw - b.cpw);
  const avgCpw =
    priced.length === 0 ? null : Math.round(priced.reduce((s, p) => s + p.cpw, 0) / priced.length);
  const best = priced[0]
    ? { name: priced[0].cloth.name, brand: priced[0].cloth.brand, cpw: priced[0].cpw }
    : null;
  const worst = priced[priced.length - 1]
    ? {
        name: priced[priced.length - 1].cloth.name,
        brand: priced[priced.length - 1].cloth.brand,
        cpw: priced[priced.length - 1].cpw,
      }
    : null;
  return {
    pieces: clothes.length,
    worn,
    quiet: clothes.length - worn,
    wears,
    avgCpw,
    best,
    worst,
  };
}

export function sortByCpw(clothes: Cloth[], counts: Record<number, number>) {
  return [...clothes].sort((a, b) => {
    const wa = counts[a.id] ?? 0;
    const wb = counts[b.id] ?? 0;
    const ca = costPerWear(a.price, wa);
    const cb = costPerWear(b.price, wb);
    if (ca == null && cb == null) return 0;
    if (ca == null) return 1;
    if (cb == null) return -1;
    return ca - cb;
  });
}

export function neglected(clothes: Cloth[], counts: Record<number, number>, take = 3) {
  return clothes.filter((c) => (counts[c.id] ?? 0) === 0).slice(0, take);
}

export function nextStreak(lastWear: string, streak: number, now = new Date()) {
  if (!lastWear) return 1;
  if (lastWear === todayKey(now)) return streak;
  if (lastWear === yesterdayKey(now)) return streak + 1;
  return 1;
}

export function weekStrip(log: WornDay[], now = new Date()) {
  const days: { iso: string; label: string; vibe?: string }[] = [];
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = addDaysIST(now, -i);
    const iso = dateKeyInZone(d);
    const weekday = weekdayIST(d);
    const hit = log.find((w) => w.iso === iso);
    days.push({
      iso,
      label: labels[weekday],
      vibe: hit?.vibe,
    });
  }
  return days;
}
