import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { indexedWant, scanWant, localLook } from "./outfit.ts";
import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { EMPTY_TASTE } from "./habit.ts";
import { GENERATIONS } from "./generations.ts";
import { occasionsFor, type Category, type Generation } from "./types.ts";

const CATS: Category[] = ["tops", "bottoms", "dresses", "shoes", "accessories", "outerwear"];
const GENDERS = ["femme", "masc", "both"] as const;

describe("catalog index", () => {
  it("matches scan selection over 500 seeds", () => {
    for (let seed = 0; seed < 500; seed++) {
      const gen = GENERATIONS[seed % GENERATIONS.length].id as Generation;
      const occs = occasionsFor(gen);
      const occ = occs[seed % occs.length].id;
      const cat = CATS[seed % CATS.length];
      const gender = GENDERS[seed % GENDERS.length];
      const rail = forYou(SAMPLE_CLOSET, gen, gender);
      const allowed = new Set(rail.map((c) => c.id));
      const oldIds = scanWant(rail, cat, occ).map((c) => c.id);
      const newIds = indexedWant(gen, cat, occ, allowed).map((c) => c.id);
      assert.deepEqual(newIds, oldIds, `seed ${seed} ${gen} ${occ} ${cat} ${gender}`);
    }
  });

  it("localLook still plates a legal look after indexing", () => {
    const rail = forYou(SAMPLE_CLOSET, "z", "both");
    const look = localLook(rail, "", [], "z", [], EMPTY_TASTE, "work");
    assert.equal(look.fit.ok, true);
    assert.equal(look.pieces.some((p) => p.cat === "shoes"), true);
  });
});
