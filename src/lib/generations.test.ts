import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noonIST } from "./clock.ts";
import {
  MIN_AGE,
  ageYears,
  dateBounds,
  genderOptions,
  generationFromAge,
  generationFromBirthDate,
  isMinor,
} from "./generations.ts";

describe("generationFromAge", () => {
  it("maps the published bands", () => {
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
    assert.equal(generationFromAge(80), "prime");
  });
});

describe("ageYears", () => {
  it("has not had a birthday yet this year", () => {
    const now = noonIST(2026, 9, 11);
    assert.equal(ageYears("2006-12-01", now), 19);
  });
  it("has had a birthday this year", () => {
    const now = noonIST(2026, 9, 11);
    assert.equal(ageYears("2006-01-01", now), 20);
  });
  it("is exact on the birthday", () => {
    const now = noonIST(2026, 9, 11);
    assert.equal(ageYears("2006-09-11", now), 20);
  });
});

describe("generationFromBirthDate", () => {
  it("uses local calendar age, not a slogan", () => {
    const now = noonIST(2026, 9, 11);
    assert.equal(generationFromBirthDate("2016-01-01", now), "alpha");
    assert.equal(generationFromBirthDate("2010-01-01", now), "teen");
    assert.equal(generationFromBirthDate("2005-07-01", now), "z");
    assert.equal(generationFromBirthDate("1992-01-01", now), "mill");
  });
});

describe("genderOptions", () => {
  it("says girl and boy under 18, woman and man after", () => {
    assert.deepEqual(
      genderOptions("alpha").map((o) => o.label),
      ["Girl", "Boy", "Both"],
    );
    assert.deepEqual(
      genderOptions("teen").map((o) => o.label),
      ["Girl", "Boy", "Both"],
    );
    assert.deepEqual(
      genderOptions("z").map((o) => o.label),
      ["Woman", "Man", "Both"],
    );
    assert.deepEqual(
      genderOptions("mill").map((o) => o.label),
      ["Woman", "Man", "Both"],
    );
  });
});

describe("guards", () => {
  it("marks under-18 as minor", () => {
    assert.equal(isMinor("alpha"), true);
    assert.equal(isMinor("teen"), true);
    assert.equal(isMinor("z"), false);
  });
  it("date bounds keep a 10-year-old as the youngest member", () => {
    const now = noonIST(2026, 9, 11);
    const b = dateBounds(now);
    assert.equal(ageYears(b.max, now) >= MIN_AGE, true);
    assert.match(b.max, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(b.min, /^\d{4}-\d{2}-\d{2}$/);
  });
});
