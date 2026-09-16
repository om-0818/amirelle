import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CIVIL_DAY_MS,
  HOUSE_TZ,
  IST_OFFSET_MIN,
  addDaysIST,
  dateKeyInZone,
  daysInMonth,
  formatCivilIST,
  fromIsoInstant,
  isoWeekFromYmd,
  noonIST,
  offsetMinutes,
  parseIsoDate,
  weekdayIST,
  ymdInZone,
} from "./clock.ts";
import { ageYears, generationFromBirthDate } from "./generations.ts";

describe("house timezone is India", () => {
  it("is Asia/Kolkata, with no DST", () => {
    assert.equal(HOUSE_TZ, "Asia/Kolkata");
    const winter = dateKeyInZone(new Date("2026-01-15T18:30:00Z"));
    const monsoon = dateKeyInZone(new Date("2026-09-11T18:30:00Z"));
    assert.equal(winter, "2026-01-16");
    assert.equal(monsoon, "2026-09-12");
  });

  it("UTC evening is already the next morning in Pune", () => {
    const utcEvening = new Date("2026-09-10T19:00:00Z");
    assert.equal(dateKeyInZone(utcEvening), "2026-09-11");
    assert.equal(dateKeyInZone(utcEvening, "UTC"), "2026-09-10");
    assert.deepEqual(ymdInZone(utcEvening), { y: 2026, m: 9, d: 11 });
  });

  it("noonIST is 06:30 UTC, so the India date cannot drift", () => {
    const n = noonIST(2026, 9, 11);
    assert.equal(n.toISOString(), "2026-09-11T06:30:00.000Z");
    assert.equal(dateKeyInZone(n), "2026-09-11");
  });

  it("addDaysIST crosses the month without using the machine clock", () => {
    const last = noonIST(2026, 9, 30);
    assert.equal(dateKeyInZone(addDaysIST(last, 1)), "2026-10-01");
    assert.equal(dateKeyInZone(addDaysIST(noonIST(2026, 12, 31), 1)), "2027-01-01");
  });
});

describe("parseIsoDate", () => {
  it("accepts a real day and rejects a fake one", () => {
    assert.deepEqual(parseIsoDate("2012-02-29"), { y: 2012, m: 2, d: 29 });
    assert.equal(parseIsoDate("2026-02-29"), null);
    assert.equal(parseIsoDate("2026-13-01"), null);
    assert.equal(parseIsoDate("11/09/2026"), null);
    assert.equal(parseIsoDate(""), null);
  });

  it("knows February in a leap year", () => {
    assert.equal(daysInMonth(2024, 2), 29);
    assert.equal(daysInMonth(2026, 2), 28);
  });
});

describe("leap seconds — POSIX civil days, not TAI", () => {
  it("a civil day is always 86400 Date-seconds", () => {
    assert.equal(CIVIL_DAY_MS, 86_400_000);
    const before = Date.parse("2016-12-31T23:59:59Z");
    const after = Date.parse("2017-01-01T00:00:00Z");
    assert.equal(after - before, 1000);
  });

  it("Date itself rejects 23:59:60; we roll a UTC leap second to the next UTC day", () => {
    assert.equal(Number.isNaN(new Date("2016-12-31T23:59:60Z").getTime()), true);
    const rolled = fromIsoInstant("2016-12-31T23:59:60Z");
    assert.equal(rolled?.toISOString(), "2017-01-01T00:00:00.000Z");
    const june = fromIsoInstant("2015-06-30T23:59:60Z");
    assert.equal(june?.toISOString(), "2015-07-01T00:00:00.000Z");
  });

  it("a leap second is not valid India civil time", () => {
    assert.equal(fromIsoInstant("2016-12-31T23:59:60+05:30"), null);
    assert.equal(fromIsoInstant("2017-01-01T05:29:60+05:30"), null);
  });

  it("lands at 05:30 IST — Pune is already on the next morning", () => {
    const lastUtcSecond = fromIsoInstant("2016-12-31T23:59:59Z");
    const firstNext = fromIsoInstant("2016-12-31T23:59:60Z");
    assert.equal(dateKeyInZone(lastUtcSecond!), "2017-01-01");
    assert.equal(dateKeyInZone(firstNext!), "2017-01-01");
    assert.equal(dateKeyInZone(lastUtcSecond!, "UTC"), "2016-12-31");
    assert.equal(dateKeyInZone(firstNext!, "UTC"), "2017-01-01");
  });

  it("IST midnight is hours before any leap second, so the India date is untouched", () => {
    const istNewYear = new Date("2016-12-31T18:30:00Z");
    assert.equal(dateKeyInZone(istNewYear), "2017-01-01");
    assert.equal(dateKeyInZone(addDaysIST(noonIST(2016, 12, 31), 1)), "2017-01-01");
    assert.equal(dateKeyInZone(addDaysIST(noonIST(2015, 6, 30), 1)), "2015-07-01");
  });

  it("does not move a birthday or a generation across the 2016 leap second", () => {
    const born = "2000-01-01";
    const eve = noonIST(2016, 12, 31);
    const day = noonIST(2017, 1, 1);
    const leap = fromIsoInstant("2016-12-31T23:59:60Z")!;
    assert.equal(ageYears(born, eve), 16);
    assert.equal(ageYears(born, day), 17);
    assert.equal(ageYears(born, leap), 17);
    assert.equal(generationFromBirthDate(born, eve), "teen");
    assert.equal(generationFromBirthDate(born, leap), "teen");
  });
});

describe("DST — India does not spring forward or fall back", () => {
  it("Kolkata is +05:30 in January and in July", () => {
    assert.equal(IST_OFFSET_MIN, 330);
    assert.equal(offsetMinutes(new Date("2026-01-15T12:00:00Z")), 330);
    assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z")), 330);
    assert.equal(offsetMinutes(noonIST(2026, 3, 8)), 330);
    assert.equal(offsetMinutes(noonIST(2026, 11, 1)), 330);
  });

  it("New York and London do move; the house does not follow them", () => {
    const nySpring = new Date("2026-03-08T07:00:00Z");
    const nyWinter = new Date("2026-03-08T06:59:59Z");
    assert.equal(offsetMinutes(nyWinter, "America/New_York"), -300);
    assert.equal(offsetMinutes(nySpring, "America/New_York"), -240);
    assert.equal(offsetMinutes(nyWinter), 330);
    assert.equal(offsetMinutes(nySpring), 330);

    const ukSpring = new Date("2026-03-29T01:00:00Z");
    const ukWinter = new Date("2026-03-29T00:59:59Z");
    assert.equal(offsetMinutes(ukWinter, "Europe/London"), 0);
    assert.equal(offsetMinutes(ukSpring, "Europe/London"), 60);
    assert.equal(offsetMinutes(ukWinter), 330);
    assert.equal(offsetMinutes(ukSpring), 330);
  });

  it("the missing 02:00 in New York does not skip an India date", () => {
    const before = new Date("2026-03-08T06:59:59Z");
    const after = new Date("2026-03-08T07:00:00Z");
    assert.equal(dateKeyInZone(before), "2026-03-08");
    assert.equal(dateKeyInZone(after), "2026-03-08");
    assert.equal(dateKeyInZone(before, "America/New_York"), "2026-03-08");
    assert.equal(dateKeyInZone(after, "America/New_York"), "2026-03-08");
  });

  it("the repeated 01:00 in New York does not duplicate an India date", () => {
    const first = new Date("2026-11-01T05:30:00Z");
    const second = new Date("2026-11-01T06:30:00Z");
    assert.equal(dateKeyInZone(first), "2026-11-01");
    assert.equal(dateKeyInZone(second), "2026-11-01");
    assert.equal(offsetMinutes(first, "America/New_York"), -240);
    assert.equal(offsetMinutes(second, "America/New_York"), -300);
  });

  it("addDaysIST across US and UK DST weekends is still 24 POSIX hours", () => {
    const friNy = noonIST(2026, 3, 6);
    const monNy = addDaysIST(friNy, 3);
    assert.equal(dateKeyInZone(monNy), "2026-03-09");
    assert.equal(monNy.getTime() - friNy.getTime(), 3 * CIVIL_DAY_MS);

    const friUk = noonIST(2026, 3, 27);
    assert.equal(dateKeyInZone(addDaysIST(friUk, 2)), "2026-03-29");
    assert.equal(addDaysIST(friUk, 2).getTime() - friUk.getTime(), 2 * CIVIL_DAY_MS);

    const satFall = noonIST(2026, 10, 24);
    assert.equal(dateKeyInZone(addDaysIST(satFall, 2)), "2026-10-26");
    assert.equal(addDaysIST(satFall, 2).getTime() - satFall.getTime(), 2 * CIVIL_DAY_MS);
  });

  it("a birthday on a US spring-forward Sunday is the India Sunday, not the skipped hour", () => {
    const born = "2008-03-08";
    assert.equal(ageYears(born, new Date("2026-03-07T18:29:59Z")), 17);
    assert.equal(ageYears(born, new Date("2026-03-07T18:30:00Z")), 18);
    assert.equal(ageYears(born, new Date("2026-03-08T07:00:00Z")), 18);
    assert.equal(generationFromBirthDate(born, noonIST(2026, 3, 8)), "z");
  });
});

describe("IST weekday, day rollover, week strip", () => {
  it("offset is +05:30 in January and in July — no DST", () => {
    assert.equal(IST_OFFSET_MIN, 330);
    assert.equal(offsetMinutes(new Date("2026-01-15T12:00:00Z")), 330);
    assert.equal(offsetMinutes(new Date("2026-07-15T12:00:00Z")), 330);
  });

  it("23:59 IST Friday rolls to Saturday at 00:01", () => {
    const friEve = new Date("2026-09-11T18:29:00Z");
    const satDawn = new Date("2026-09-11T18:31:00Z");
    assert.equal(dateKeyInZone(friEve), "2026-09-11");
    assert.equal(dateKeyInZone(satDawn), "2026-09-12");
    assert.equal(weekdayIST(friEve), 5);
    assert.equal(weekdayIST(satDawn), 6);
    assert.match(formatCivilIST(friEve, { weekday: "long" }), /Friday/i);
    assert.match(formatCivilIST(satDawn, { weekday: "long" }), /Saturday/i);
  });

  it("ISO week follows the India civil date, not UTC evening", () => {
    const thu = noonIST(2026, 12, 31);
    const fri = noonIST(2027, 1, 1);
    const mon = noonIST(2027, 1, 4);
    assert.equal(isoWeekFromYmd(ymdInZone(thu)), isoWeekFromYmd(ymdInZone(fri)));
    assert.equal(isoWeekFromYmd(ymdInZone(mon)), 1);
    const utcEve = new Date("2026-09-11T18:29:00Z");
    const utcNext = new Date("2026-09-11T18:31:00Z");
    assert.equal(isoWeekFromYmd(ymdInZone(utcEve)), isoWeekFromYmd(ymdInZone(noonIST(2026, 9, 11))));
    assert.equal(isoWeekFromYmd(ymdInZone(utcNext)), isoWeekFromYmd(ymdInZone(noonIST(2026, 9, 12))));
  });
});
