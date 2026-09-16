import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noonIST } from "./clock.ts";
import {
  MIN_AGE,
  ageYears,
  applyLifetime,
  dateBounds,
  generationFromAge,
  generationFromBirthDate,
  isMinor,
  modeFromGeneration,
} from "./generations.ts";
import type { Generation, Mode } from "./types.ts";

const EDGES: { age: number; from: Generation; to: Generation }[] = [
  { age: 13, from: "alpha", to: "teen" },
  { age: 17, from: "teen", to: "z" },
  { age: 24, from: "z", to: "zlate" },
  { age: 29, from: "zlate", to: "mill" },
  { age: 41, from: "mill", to: "x" },
  { age: 54, from: "x", to: "prime" },
];

describe("generation boundaries — last day of a band vs first day of the next", () => {
  it("stays in the band the day before the birthday, flips on the birthday in India", () => {
    for (const { age, from, to } of EDGES) {
      const born = "2000-09-11";
      const last = noonIST(2000 + age, 9, 10);
      const first = noonIST(2000 + age, 9, 11);
      assert.equal(ageYears(born, last), age - 1, `${from} last day age`);
      assert.equal(generationFromBirthDate(born, last), from);
      assert.equal(ageYears(born, first), age);
      assert.equal(generationFromBirthDate(born, first), from);
      const next = noonIST(2000 + age + 1, 9, 11);
      assert.equal(generationFromBirthDate(born, next), to);
    }
  });

  it("flips at 00:00 IST, not at UTC midnight", () => {
    const born = "2013-09-11";
    const stillAlpha = new Date("2027-09-10T18:29:00Z");
    const nowTeen = new Date("2027-09-10T18:30:00Z");
    assert.equal(generationFromBirthDate(born, stillAlpha), "alpha");
    assert.equal(ageYears(born, stillAlpha), 13);
    assert.equal(generationFromBirthDate(born, nowTeen), "teen");
    assert.equal(ageYears(born, nowTeen), 14);
  });

  it("inclusive ends of each published band", () => {
    assert.equal(generationFromAge(10), "alpha");
    assert.equal(generationFromAge(13), "alpha");
    assert.equal(generationFromAge(14), "teen");
    assert.equal(generationFromAge(17), "teen");
    assert.equal(generationFromAge(18), "z");
    assert.equal(generationFromAge(24), "z");
    assert.equal(generationFromAge(25), "zlate");
    assert.equal(generationFromAge(29), "zlate");
    assert.equal(generationFromAge(30), "mill");
    assert.equal(generationFromAge(41), "mill");
    assert.equal(generationFromAge(42), "x");
    assert.equal(generationFromAge(54), "x");
    assert.equal(generationFromAge(55), "prime");
  });

  it("mode flips with majority, not with a slogan", () => {
    assert.equal(modeFromGeneration("teen"), "closet");
    assert.equal(modeFromGeneration("z"), "house");
    assert.equal(isMinor("teen"), true);
    assert.equal(isMinor("z"), false);
  });
});

describe("leap day and invalid dates", () => {
  it("a 29 Feb child does not age on 28 Feb in a common year", () => {
    const born = "2012-02-29";
    assert.equal(ageYears(born, noonIST(2026, 2, 28)), 13);
    assert.equal(generationFromBirthDate(born, noonIST(2026, 2, 28)), "alpha");
    assert.equal(ageYears(born, noonIST(2026, 3, 1)), 14);
    assert.equal(generationFromBirthDate(born, noonIST(2026, 3, 1)), "teen");
  });

  it("does age on 29 Feb in a leap year", () => {
    const born = "2012-02-29";
    assert.equal(ageYears(born, noonIST(2024, 2, 28)), 11);
    assert.equal(ageYears(born, noonIST(2024, 2, 29)), 12);
  });

  it("garbage dates are age 0, not a thrown error", () => {
    assert.equal(ageYears("2026-02-29", noonIST(2026, 9, 11)), 0);
    assert.equal(ageYears("not-a-date", noonIST(2026, 9, 11)), 0);
    assert.equal(ageYears("", noonIST(2026, 9, 11)), 0);
  });

  it("under 10 is still mapped, but the form will not accept them", () => {
    assert.equal(generationFromAge(9), "alpha");
    assert.equal(MIN_AGE, 10);
    const bounds = dateBounds(noonIST(2026, 9, 11));
    assert.equal(bounds.max, "2016-09-11");
    assert.equal(ageYears(bounds.max, noonIST(2026, 9, 11)), 10);
  });
});

describe("applyLifetime on the edge", () => {
  it("is a no-op on the same India day", () => {
    const meta = {
      birthDate: "2013-09-11",
      ageBand: "alpha" as Generation,
      cohort: "closet" as Mode,
      lastSyncDate: "2026-09-11",
    };
    const same = applyLifetime(meta, noonIST(2026, 9, 11));
    assert.equal(same, meta);
  });

  it("rewrites the band at 00:00 IST the birthday they turn 14", () => {
    const meta = {
      birthDate: "2013-09-11",
      ageBand: "alpha" as Generation,
      cohort: "closet" as Mode,
      lastSyncDate: "2027-09-10",
    };
    const before = applyLifetime(meta, new Date("2027-09-10T18:29:00Z"));
    assert.equal(before.ageBand, "alpha");
    const after = applyLifetime(meta, new Date("2027-09-10T18:30:00Z"));
    assert.equal(after.ageBand, "teen");
    assert.equal(after.lastSyncDate, "2027-09-11");
  });
});
