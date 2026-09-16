import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { forYou } from "./catalog.ts";
import { noonIST } from "./clock.ts";
import { chrome } from "./copy.ts";
import { fashionPulse } from "./fashion-clock.ts";
import {
  GENERATIONS,
  applyLifetime,
  birthDateForGeneration,
  genderOptions,
  generationFromAge,
  generationFromBirthDate,
  isMinor,
  modeFromGeneration,
} from "./generations.ts";
import { identitiesFor } from "./practice.ts";
import { SAMPLE_CLOSET } from "./sample-closet.ts";
import { occasionsFor, type Gender, type Generation } from "./types.ts";

const NOW = noonIST(2026, 9, 11);

describe("generation model — every published band", () => {
  it("min and max ages land in their own band", () => {
    for (const g of GENERATIONS) {
      assert.equal(generationFromAge(g.minAge), g.id, `${g.id} min ${g.minAge}`);
      const max = Math.min(g.maxAge, 80);
      assert.equal(generationFromAge(max), g.id, `${g.id} max ${max}`);
    }
  });

  it("round-trips a mid-band birth date back to the same generation", () => {
    for (const g of GENERATIONS) {
      const iso = birthDateForGeneration(g.id, NOW);
      assert.equal(generationFromBirthDate(iso, NOW), g.id, g.id);
    }
  });

  it("only alpha and teen are minors, and only they get closet mode", () => {
    for (const g of GENERATIONS) {
      const minor = g.id === "alpha" || g.id === "teen";
      assert.equal(isMinor(g.id), minor);
      assert.equal(modeFromGeneration(g.id), minor ? "closet" : "house");
    }
  });

  it("labels who we dress in the language of that age", () => {
    for (const g of GENERATIONS) {
      const labels = genderOptions(g.id).map((o) => o.label);
      if (isMinor(g.id)) {
        assert.deepEqual(labels, ["Girl", "Boy", "Both"]);
      } else {
        assert.deepEqual(labels, ["Woman", "Man", "Both"]);
      }
    }
  });

  it("alpha has school and no night out; adults have work and no school", () => {
    const alpha = occasionsFor("alpha").map((o) => o.id);
    const mill = occasionsFor("mill").map((o) => o.id);
    assert.equal(alpha.includes("school"), true);
    assert.equal(alpha.includes("night"), false);
    assert.equal(alpha.includes("date"), false);
    assert.equal(mill.includes("school"), false);
    assert.equal(mill.includes("work"), true);
    assert.equal(mill.includes("night"), true);
  });

  it("minors get school identities; adults get mix/day", () => {
    assert.equal(
      identitiesFor("alpha").some((i) => i.id === "school"),
      true,
    );
    assert.equal(
      identitiesFor("mill").some((i) => i.id === "mix"),
      true,
    );
    assert.equal(
      identitiesFor("mill").some((i) => i.id === "school"),
      false,
    );
  });

  it("chrome is one house — no twin-house labels", () => {
    const c = chrome();
    assert.equal(c.closet, "Closet");
    assert.equal(c.style, "Look");
    assert.doesNotMatch(JSON.stringify(c), /play the house|modern uniform|quiet luxury|heritage/i);
  });
});

describe("generation model × rail", () => {
  const gens: Generation[] = GENERATIONS.map((g) => g.id);
  const genders: Gender[] = ["femme", "masc", "both"];

  it("every generation × gender still has a wearable rail", () => {
    for (const gen of gens) {
      for (const gender of genders) {
        const rail = forYou(SAMPLE_CLOSET, gen, gender);
        assert.equal(rail.length > 80, true, `${gen} ${gender} is ${rail.length}`);
        const cats = new Set(rail.map((c) => c.cat));
        assert.equal(cats.has("tops"), true);
        assert.equal(cats.has("bottoms"), true);
        assert.equal(cats.has("shoes"), true);
      }
    }
  });

  it("a man's rail has no dresses or heels; a girl's has no heels if she is alpha", () => {
    const man = forYou(SAMPLE_CLOSET, "mill", "masc");
    assert.equal(man.some((c) => c.cat === "dresses"), false);
    assert.equal(man.some((c) => /heel|pump|stiletto/i.test(c.name)), false);
    const girl = forYou(SAMPLE_CLOSET, "alpha", "femme");
    assert.equal(girl.some((c) => /heel|pump|stiletto/i.test(c.name)), false);
  });
});

describe("generation model — aging is a lifetime, not a costume", () => {
  it("the same birth date crosses teen on the birthday, not on 1 January", () => {
    const born = "2013-09-11";
    assert.equal(generationFromBirthDate(born, noonIST(2026, 9, 10)), "alpha");
    assert.equal(generationFromBirthDate(born, noonIST(2026, 9, 11)), "alpha");
    assert.equal(generationFromBirthDate(born, noonIST(2027, 9, 11)), "teen");
  });

  it("applyLifetime rewrites the band when the calendar moves", () => {
    const meta = {
      birthDate: "2013-09-11",
      ageBand: "alpha" as Generation,
      cohort: "closet" as const,
      lastSyncDate: "2026-09-11",
    };
    const same = applyLifetime(meta, noonIST(2026, 9, 11));
    assert.equal(same, meta);
    const later = applyLifetime(meta, noonIST(2027, 9, 11));
    assert.equal(later.ageBand, "teen");
    assert.equal(later.lastSyncDate, "2027-09-11");
  });

  it("the stylist prompt names the member in the present, without a generation costume", () => {
    for (const g of GENERATIONS) {
      const pulse = fashionPulse(g.id, NOW);
      assert.match(pulse.prompt, /Member is/);
      assert.match(pulse.prompt, new RegExp(g.years.replace("–", "[–-]")));
      assert.match(pulse.prompt, /Dress the day they named/);
      assert.doesNotMatch(pulse.prompt, /ganesh|prep|Y2K|aesthetic|Gen Z|Boomer/i);
    }
  });
});
