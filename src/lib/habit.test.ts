import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noonIST } from "./clock.ts";
import { costPerWear, formatCpw, neglected, sortByCpw, tasteScore, trainTaste, wardrobeMetrics, weekStrip, EMPTY_TASTE } from "./habit.ts";
import { localDateKey } from "./types.ts";
import type { Cloth } from "./types.ts";
import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { localLook } from "./outfit.ts";

const piece = (over: Partial<Cloth>): Cloth => ({
  id: 1,
  name: "Shirt",
  cat: "tops",
  color: "white",
  photo: null,
  brand: "COS",
  ...over,
});

describe("costPerWear", () => {
  it("divides price by actual wears", () => {
    assert.equal(costPerWear(4500, 1), 4500);
    assert.equal(costPerWear(4500, 2), 2250);
    assert.equal(costPerWear(3990, 3), 1330);
  });
  it("is silent on zero-wear, missing price, and non-finite inputs", () => {
    assert.equal(costPerWear(undefined, 3), null);
    assert.equal(costPerWear(4500, 0), null);
    assert.equal(costPerWear(0, 2), null);
    assert.equal(costPerWear(4500, Number.NaN), null);
    assert.equal(costPerWear(Number.POSITIVE_INFINITY, 1), null);
    assert.equal(costPerWear(4500, Number.POSITIVE_INFINITY), null);
    assert.equal(formatCpw(Number.NaN), "");
    assert.equal(formatCpw(Number.POSITIVE_INFINITY), "");
  });
});

describe("wardrobeMetrics", () => {
  it("averages cost a wear and names the best and the quiet", () => {
    const clothes = [
      piece({ id: 1, name: "Shirt", brand: "COS", price: 4000 }),
      piece({ id: 2, name: "Knit", brand: "Zara", price: 2000 }),
      piece({ id: 3, name: "Quiet", brand: "Arket", price: 8000 }),
    ];
    const m = wardrobeMetrics(clothes, { 1: 4, 2: 1 });
    assert.equal(m.worn, 2);
    assert.equal(m.quiet, 1);
    assert.equal(m.avgCpw, Math.round((1000 + 2000) / 2));
    assert.equal(m.best?.cpw, 1000);
    assert.equal(m.worst?.cpw, 2000);
    assert.equal(formatCpw(1000), "₹1,000");
    const ordered = sortByCpw(clothes, { 1: 4, 2: 1 });
    assert.equal(ordered[0].id, 1);
    assert.equal(ordered[ordered.length - 1].id, 3);
    const empty = wardrobeMetrics(clothes, {});
    assert.equal(empty.worn, 0);
    assert.equal(empty.avgCpw, null);
    assert.equal(empty.best, null);
    assert.equal(Number.isFinite(empty.wears), true);
  });
});

describe("taste", () => {
  it("trains brands twice as hard as colour, and the category", () => {
    const t = trainTaste({ brands: {}, colors: {}, cats: {} }, [piece({ brand: "COS", color: "Navy" })], 1);
    assert.equal(t.brands.COS, 1);
    assert.equal(t.colors.navy, 1);
    assert.equal(t.cats.tops, 1);
    assert.equal(tasteScore(piece({ brand: "COS", color: "navy" }), t), 5);
  });

  it("ten Not this on dresses reduces dresses in the next 50 plates", () => {
    const rail = forYou(SAMPLE_CLOSET, "z", "femme");
    const rate = (taste: typeof EMPTY_TASTE, n = 50) => {
      let d = 0;
      for (let i = 0; i < n; i++) {
        const look = localLook(rail, "", [], "z", [], taste, "date");
        if (look.pieces.some((p) => p.cat === "dresses")) d += 1;
      }
      return d / n;
    };
    const before = rate(EMPTY_TASTE);
    let taste = EMPTY_TASTE;
    for (let i = 0; i < 10; i++) {
      const look = localLook(rail, "", [], "z", [], taste, "date");
      assert.ok(look.pieces.length, `empty skip ${i}`);
      taste = trainTaste(taste, look.pieces, -1);
    }
    const after = rate(taste);
    assert.ok(before > 0, `baseline dresses ${before}`);
    assert.ok(after < before, `dresses ${before} → ${after}`);
  });
});

describe("neglected", () => {
  it("returns unworn pieces first", () => {
    const clothes = [piece({ id: 1 }), piece({ id: 2, name: "Quiet" }), piece({ id: 3 })];
    const found = neglected(clothes, { 1: 4, 3: 1 }, 2);
    assert.deepEqual(
      found.map((c) => c.id),
      [2],
    );
  });
});

describe("weekStrip", () => {
  it("fills the India Friday, not UTC", () => {
    const friday = noonIST(2026, 9, 11);
    const iso = localDateKey(friday);
    const days = weekStrip([{ iso, vibe: "Casual" }], friday);
    assert.equal(days.length, 7);
    const hit = days.find((d) => d.iso === iso);
    assert.equal(hit?.vibe, "Casual");
    assert.equal(days[6].iso, iso);
    assert.equal(days[6].label, "F");
  });

  it("the strip rolls at India midnight, not UTC", () => {
    const friEve = new Date("2026-09-11T18:29:00Z");
    const satDawn = new Date("2026-09-11T18:31:00Z");
    const eve = weekStrip([], friEve);
    const dawn = weekStrip([], satDawn);
    assert.equal(eve[6].iso, "2026-09-11");
    assert.equal(eve[6].label, "F");
    assert.equal(dawn[6].iso, "2026-09-12");
    assert.equal(dawn[6].label, "S");
    assert.equal(dawn[5].iso, "2026-09-11");
    assert.equal(dawn[0].iso, "2026-09-06");
  });

  it("lights only days that have a wear record", () => {
    const tue = noonIST(2026, 9, 15);
    const log = [
      { iso: "2026-09-15", vibe: "Gym" },
      { iso: "2026-09-13", vibe: "Work" },
      { iso: "2026-09-01", vibe: "Too old" },
    ];
    const days = weekStrip(log, tue);
    assert.equal(days.length, 7);
    assert.equal(days[6].iso, "2026-09-15");
    assert.equal(days[6].vibe, "Gym");
    assert.equal(days[4].iso, "2026-09-13");
    assert.equal(days[4].vibe, "Work");
    assert.equal(days[5].vibe, undefined);
    assert.equal(days.some((d) => d.vibe === "Too old"), false);
    const newest = weekStrip(
      [
        { iso: "2026-09-15", vibe: "Date" },
        { iso: "2026-09-15", vibe: "Gym" },
      ],
      tue,
    );
    assert.equal(newest[6].vibe, "Date");
  });
});
