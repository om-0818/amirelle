import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { EMPTY_TASTE } from "./habit.ts";
import { occasionScore } from "./outfit.ts";
import { deskShortcut, plateForSituation } from "./today-desk.ts";

describe("desk keys", () => {
  it("H holds, A almost, N not this", () => {
    assert.equal(deskShortcut("h", false, false), "hold");
    assert.equal(deskShortcut("H", false, false), "hold");
    assert.equal(deskShortcut("a", false, false), "almost");
    assert.equal(deskShortcut("N", false, false), "skip");
  });

  it("ignores keys while a text input has focus, and H after a wear", () => {
    assert.equal(deskShortcut("h", true, false), null);
    assert.equal(deskShortcut("n", true, false), null);
    assert.equal(deskShortcut("a", true, false), null);
    assert.equal(deskShortcut("h", false, true), null);
    assert.equal(deskShortcut("n", false, true), "skip");
  });
});

describe("situation chip recomposes", () => {
  it("gym then work plates a new legal look without a reload", () => {
    const rail = forYou(SAMPLE_CLOSET, "z", "masc");
    const gym = plateForSituation(rail, "", [], "z", EMPTY_TASTE, "gym");
    const work = plateForSituation(rail, "", [], "z", EMPTY_TASTE, "work");
    assert.equal(gym.fit.ok, true);
    assert.equal(work.fit.ok, true);
    assert.ok(gym.pieces.length > 0);
    assert.ok(work.pieces.length > 0);
    for (const p of gym.pieces) assert.ok(occasionScore(p, "gym") >= 0, p.name);
    for (const p of work.pieces) assert.ok(occasionScore(p, "work") >= 0, p.name);
    assert.equal(
      gym.pieces.some((p) => p.cat === "shoes" && /trainer|runner|court sneaker|hiking sneaker/i.test(p.name)),
      true,
    );
    assert.equal(
      work.pieces.some((p) => p.cat === "shoes" && /trainer|sneaker|runner/i.test(p.name)),
      false,
    );
    assert.notEqual(
      gym.pieces.map((p) => p.id).join(","),
      work.pieces.map((p) => p.id).join(","),
    );
  });

  it("an empty rail does not invent a garment", () => {
    const look = plateForSituation([], "", [], "z", EMPTY_TASTE, "gym");
    assert.equal(look.pieces.length, 0);
    assert.equal(look.fit.ok, false);
    assert.ok(look.desc.length > 8);
  });
});
