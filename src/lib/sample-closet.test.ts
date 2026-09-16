import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CUTS, HOUSES_ONLINE, SAMPLE_CLOSET, forCohort, forYou, photoFor, stillCats, stillIdFromPhoto } from "./catalog.ts";
import { GENERATIONS } from "./generations.ts";
import { OCCASION_KIT, occasionScore } from "./outfit.ts";
import { occasionsFor } from "./types.ts";
import type { Category } from "./types.ts";

const CATS: Category[] = ["tops", "bottoms", "dresses", "shoes", "accessories", "outerwear"];

describe("catalog density", () => {
  it("puts at least 100 pieces in every category at every house", () => {
    for (const brand of HOUSES_ONLINE) {
      for (const cat of CATS) {
        const n = SAMPLE_CLOSET.filter((c) => c.brand === brand.name && c.cat === cat).length;
        assert.equal(n >= 100, true, `${brand.name} ${cat} has ${n}`);
      }
    }
  });

  it("forces every photo into the same 3:4 frame", () => {
    const bad = SAMPLE_CLOSET.filter(
      (c) => !c.photo || !c.photo.includes("w=800") || !c.photo.includes("h=1066"),
    );
    assert.equal(bad.length, 0);
  });

  it("keeps heels off the alpha rail", () => {
    const alpha = forCohort(SAMPLE_CLOSET, "alpha");
    assert.equal(alpha.length > 100, true);
    const heels = alpha.filter((c) => /heel|pump|stiletto|slingback/i.test(c.name));
    assert.equal(heels.length, 0);
  });

  it("cuts the rail for a woman vs a man", () => {
    const femme = forYou(SAMPLE_CLOSET, "z", "femme");
    const masc = forYou(SAMPLE_CLOSET, "z", "masc");
    assert.equal(femme.some((c) => c.cat === "dresses"), true);
    assert.equal(masc.some((c) => c.cat === "dresses"), false);
    assert.equal(masc.some((c) => /heel|pump|stiletto/i.test(c.name)), false);
    assert.equal(femme.length !== masc.length, true);
  });
});

describe("CUT_STILL", () => {
  it("every cut has a still whose declared category includes the cut", () => {
    const missing: string[] = [];
    const mismatch: string[] = [];
    for (const cat of CATS) {
      for (const cut of CUTS[cat]) {
        const url = photoFor(cat, cut, 0);
        const id = stillIdFromPhoto(url);
        if (!id) missing.push(`${cat}/${cut}`);
        else {
          const declared = stillCats(id);
          if (!declared.includes(cat)) mismatch.push(`${cat}/${cut} → ${id} (${declared.join("|") || "none"})`);
        }
      }
    }
    assert.deepEqual(missing, [], missing.join("; "));
    assert.deepEqual(mismatch, [], mismatch.join("; "));
  });
});

describe("rail integrity", () => {
  it("has unique ids, even brand spread, and a complete card on every house piece", () => {
    const ids = SAMPLE_CLOSET.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    const perBrand = new Map<string, number>();
    for (const c of SAMPLE_CLOSET) {
      assert.ok(c.cat, `cat ${c.id}`);
      assert.ok(c.brand, `brand ${c.id}`);
      assert.ok(c.cut, `cut ${c.id}`);
      assert.ok(CUTS[c.cat].includes(c.cut), `${c.brand} ${c.cut} not a ${c.cat} cut`);
      assert.ok(c.photo && stillIdFromPhoto(c.photo), `still ${c.id}`);
      perBrand.set(c.brand, (perBrand.get(c.brand) ?? 0) + 1);
    }
    assert.equal(perBrand.size, HOUSES_ONLINE.length);
    const mean = SAMPLE_CLOSET.length / perBrand.size;
    for (const [brand, n] of perBrand) {
      assert.ok(n >= mean * 0.85 && n <= mean * 1.15, `${brand} ${n} vs mean ${mean}`);
    }
  });

  it("every OCCASION_KIT want has at least three candidates per generation", () => {
    const starved: string[] = [];
    for (const g of GENERATIONS) {
      const rail = forCohort(SAMPLE_CLOSET, g.id);
      for (const occ of occasionsFor(g.id)) {
        const kit = OCCASION_KIT[occ.id];
        assert.ok(kit, occ.id);
        const n = rail.filter((c) => occasionScore(c, occ.id) > 0).length;
        if (n < 3) starved.push(`${g.id}/${occ.id} ${n}`);
      }
    }
    assert.deepEqual(starved, [], starved.join("; "));
  });
});
