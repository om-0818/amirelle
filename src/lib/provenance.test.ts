import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { lookCredits, localLook } from "./outfit.ts";
import { plateHasProvenance, provenanceLine } from "./provenance.ts";
import { EMPTY_TASTE } from "./habit.ts";
import type { Cloth } from "./types.ts";

const C = (over: Partial<Cloth> & Pick<Cloth, "id" | "name" | "cat">): Cloth => ({
  color: "black",
  photo: null,
  brand: "COS",
  gens: ["z"],
  ...over,
});

describe("provenance", () => {
  it("fails if a plate renders an item with no source", () => {
    const ghost = C({ id: 1, name: "Invented shirt", cat: "tops" });
    assert.equal(ghost.from, undefined);
    assert.equal(provenanceLine(ghost), "");
    assert.equal(plateHasProvenance([ghost]), false);
    assert.equal(lookCredits([ghost])[0].source, "");
    const credits = lookCredits([ghost]).filter((c) => c.source);
    assert.equal(credits.length, 0);
  });

  it("names closet vs rail, and a house plate has a source on every piece", () => {
    assert.equal(provenanceLine(C({ id: 2, name: "Oxford", cat: "tops", from: "roll" })), "In your closet");
    assert.equal(provenanceLine(C({ id: 3, name: "Oxford", cat: "tops", from: "house" })), "On the rail");
    const rail = [
      C({ id: 1, cat: "tops", name: "Poplin shirt", from: "house" }),
      C({ id: 2, cat: "bottoms", name: "Trousers", from: "house" }),
      C({ id: 3, cat: "shoes", name: "Loafer", from: "house" }),
    ];
    const look = localLook(rail, "", [], "z", [], EMPTY_TASTE, "work");
    assert.equal(look.fit.ok, true);
    assert.equal(plateHasProvenance(look.pieces), true);
    for (const p of look.pieces) {
      assert.ok(provenanceLine(p), `missing source on ${p.id} ${p.name}`);
      assert.match(lookCredits([p])[0].source, /In your closet|On the rail/);
    }
    const stack = readFileSync(new URL("../components/look-stack.tsx", import.meta.url), "utf8");
    assert.match(stack, /plateHasProvenance/);
    assert.match(stack, /if \(!c\.source\) return null/);
    assert.match(stack, /\{c\.source\}/);
  });
});
