import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noonIST } from "./clock.ts";
import { fashionPulse, pieceScore } from "./fashion-clock.ts";
import type { Cloth } from "./types.ts";

describe("fashionPulse", () => {
  it("does not name a festival on 11 Sep 2026", () => {
    const pulse = fashionPulse("z", noonIST(2026, 9, 11));
    assert.equal(pulse.festival, null);
    assert.equal(pulse.season, "monsoon");
    assert.doesNotMatch(pulse.seasonLabel, /ganesh/i);
    assert.doesNotMatch(pulse.prompt, /ganesh/i);
  });

  it("keys the day in India, not the machine", () => {
    const pulse = fashionPulse("mill", noonIST(2026, 9, 11));
    assert.equal(pulse.dateKey, "2026-09-11");
    const eve = fashionPulse("z", new Date("2026-09-11T18:29:00Z"));
    const dawn = fashionPulse("z", new Date("2026-09-11T18:31:00Z"));
    assert.equal(eve.dateKey, "2026-09-11");
    assert.equal(dawn.dateKey, "2026-09-12");
  });

  it("week colour notes are weather and cloth, not a costume", () => {
    for (const month of [1, 4, 7, 10]) {
      const pulse = fashionPulse("z", noonIST(2026, month, 11));
      assert.doesNotMatch(pulse.colorNote, /prep|Y2K|core|aesthetic|vibe|twin/i);
      assert.doesNotMatch(pulse.prompt, /prep|Y2K|tween|Boomer|Young Z/i);
    }
  });
});

describe("pieceScore", () => {
  const pulse = fashionPulse("z", noonIST(2026, 9, 11));
  const cloth = (over: Partial<Cloth>): Cloth => ({
    id: 1,
    name: "Test",
    cat: "tops",
    color: "black",
    photo: null,
    ...over,
  });

  it("rewards the week's colours", () => {
    const hot = pieceScore(cloth({ color: pulse.colors[0] }), pulse);
    const cold = pieceScore(cloth({ color: "chartreuse" }), pulse);
    assert.equal(hot > cold, true);
  });

  it("penalises suede in monsoon", () => {
    const suede = pieceScore(cloth({ name: "Suede loafer", cat: "shoes", color: "tan" }), pulse);
    const boot = pieceScore(cloth({ name: "Leather boot", cat: "shoes", color: "black" }), pulse);
    assert.equal(boot > suede, true);
  });
});
