/**
 * Tense-type tests.
 *
 * Past    — what you wore (log, streak from yesterday, lastWear).
 * Present — today in local time, the pulse, "is the brief", "Set tonight".
 * Future  — the generation you will age into, "Set tomorrow", nextStreak if you skip a day.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { noonIST } from "./clock.ts";
import { fashionPulse } from "./fashion-clock.ts";
import { applyLifetime, generationFromBirthDate } from "./generations.ts";
import { nextStreak, weekStrip } from "./habit.ts";
import { stylistNote, vibeFrom } from "./outfit.ts";
import { PRACTICE } from "./practice.ts";
import { localDateKey, todayKey, yesterdayKey, type Cloth, type Generation } from "./types.ts";

const FRI = noonIST(2026, 9, 11);
const SAT = noonIST(2026, 9, 12);
const SUN = noonIST(2026, 9, 13);

describe("present tense — today", () => {
  it("todayKey is the local calendar, not UTC", () => {
    assert.equal(todayKey(FRI), "2026-09-11");
    assert.equal(localDateKey(new Date("2026-09-11T18:00:00Z")), "2026-09-11");
  });

  it("the pulse is the same at 9am and 11pm on one day", () => {
    const a = fashionPulse("z", new Date("2026-09-11T03:30:00Z"));
    const b = fashionPulse("z", new Date("2026-09-11T17:30:00Z"));
    assert.equal(a.dateKey, b.dateKey);
    assert.equal(a.season, b.season);
    assert.deepEqual(a.colors, b.colors);
  });

  it("the look is named in the present: the occasion, never Brand × Brand", () => {
    assert.equal(vibeFrom([], "date"), "Date");
    assert.equal(vibeFrom([], "work"), "Work");
    assert.doesNotMatch(vibeFrom([], "date"), /×/);
  });

  it("the stylist note speaks now — is, not was", () => {
    const pieces: Cloth[] = [
      { id: 1, name: "Shirt", cat: "tops", color: "white", photo: null, brand: "COS" },
      { id: 2, name: "Trousers", cat: "bottoms", color: "navy", photo: null, brand: "Zara" },
      { id: 3, name: "Loafer", cat: "shoes", color: "black", photo: null, brand: "Aldo" },
    ];
    const note = stylistNote(pieces, "Monsoon", "", "Date").join(" ");
    assert.match(note, /is the brief/);
    assert.doesNotMatch(note, /\bwas\b/);
    assert.doesNotMatch(note, /ganesh/i);
    assert.doesNotMatch(note, /×/);
  });

  it("the pulse never names a festival in the present copy", () => {
    for (const month of [0, 2, 5, 8, 9, 10, 11]) {
      const pulse = fashionPulse("mill", noonIST(2026, month + 1, 11));
      assert.equal(pulse.festival, null);
      assert.doesNotMatch(pulse.seasonLabel, /ganesh|navratri|diwali|holi/i);
      assert.doesNotMatch(pulse.prompt, /ganesh|navratri|diwali|holi/i);
    }
  });

  it("the week strip's last cell is today", () => {
    const days = weekStrip([], FRI);
    assert.equal(days.length, 7);
    assert.equal(days[6].iso, "2026-09-11");
    assert.equal(days[0].iso, "2026-09-05");
  });
});

describe("past tense — what you wore", () => {
  it("wearing yesterday keeps the streak; a gap resets it", () => {
    assert.equal(nextStreak("2026-09-10", 4, FRI), 5);
    assert.equal(nextStreak("2026-09-09", 4, FRI), 1);
    assert.equal(nextStreak("", 4, FRI), 1);
  });

  it("wearing again today does not double-count", () => {
    assert.equal(nextStreak("2026-09-11", 5, FRI), 5);
  });

  it("yesterdayKey is the local day before", () => {
    assert.equal(yesterdayKey(FRI), "2026-09-10");
    assert.equal(yesterdayKey(SAT), "2026-09-11");
  });

  it("the week strip remembers a past vibe on the day it was worn", () => {
    const days = weekStrip([{ iso: "2026-09-10", vibe: "Work" }], FRI);
    const thu = days.find((d) => d.iso === "2026-09-10");
    assert.equal(thu?.vibe, "Work");
    const today = days.find((d) => d.iso === "2026-09-11");
    assert.equal(today?.vibe, undefined);
  });
});

describe("future tense — who you become, what you set next", () => {
  it("a skipped day (today → Sunday with no Saturday wear) resets", () => {
    assert.equal(nextStreak("2026-09-11", 5, SUN), 1);
  });

  it("tomorrow's wear after today's wear continues the streak", () => {
    assert.equal(nextStreak("2026-09-11", 5, SAT), 6);
  });

  it("the same person ages into the next band on a future birthday", () => {
    const born = "2002-09-11";
    assert.equal(generationFromBirthDate(born, FRI), "z");
    assert.equal(generationFromBirthDate(born, noonIST(2030, 9, 11)), "zlate");
    assert.equal(generationFromBirthDate(born, noonIST(2032, 9, 11)), "mill");
  });

  it("applyLifetime on a future date rewrites lastSyncDate and the band together", () => {
    const meta = {
      birthDate: "2001-09-11",
      ageBand: "z" as Generation,
      cohort: "house" as const,
      lastSyncDate: "2026-09-11",
    };
    const future = applyLifetime(meta, noonIST(2030, 9, 11));
    assert.equal(future.ageBand, "zlate");
    assert.equal(future.lastSyncDate, "2030-09-11");
  });

  it("the monsoon pulse in September is not the winter pulse in January", () => {
    const now = fashionPulse("x", FRI);
    const winter = fashionPulse("x", noonIST(2027, 1, 15));
    assert.equal(now.season, "monsoon");
    assert.equal(winter.season, "winter");
    assert.notEqual(now.seasonLabel, winter.seasonLabel);
  });
});

describe("practice copy stays in the present", () => {
  it("seven days, none in a holiday or Brand × Brand tense", () => {
    assert.equal(PRACTICE.length, 7);
    const blob = PRACTICE.map((p) => `${p.title} ${p.body} ${p.task}`).join(" ");
    assert.doesNotMatch(blob, /ganesh|× |you were|generation script of/i);
    assert.match(blob, /the day/i);
  });
});
