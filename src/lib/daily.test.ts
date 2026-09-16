import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { dailyReturn, honestStreak, missedDayLine, plateDayKey, plateReady, MISS_LINE } from "./daily.ts";

const SHAME = /hurry|limited|don't miss|dont miss|last chance|keep it going|you broke|at risk|expire|only \d+ left/i;

describe("daily return", () => {
  it("the plate rolls at 7:00 IST, not midnight", () => {
    const before = new Date("2026-09-15T01:29:00Z");
    const after = new Date("2026-09-15T01:31:00Z");
    assert.equal(plateReady(before), false);
    assert.equal(plateDayKey(before), "2026-09-14");
    assert.equal(plateReady(after), true);
    assert.equal(plateDayKey(after), "2026-09-15");
    const midnight = new Date("2026-09-14T18:30:00Z");
    assert.equal(plateDayKey(midnight), "2026-09-14");
    assert.equal(dailyReturn({ lastWear: "2026-09-14", wornIsos: ["2026-09-14"], now: before }).kicker, "Today's look lands at 7:00.");
    assert.equal(dailyReturn({ lastWear: "2026-09-15", wornIsos: ["2026-09-15"], now: after }).kicker, null);
  });

  it("a missed day is plain, and the streak does not lie", () => {
    const friday = new Date("2026-09-15T04:30:00Z");
    assert.equal(missedDayLine("2026-09-13", friday), MISS_LINE);
    assert.equal(missedDayLine("2026-09-14", friday), null);
    assert.equal(missedDayLine("2026-09-15", friday), null);
    assert.equal(missedDayLine("", friday), null);
    assert.equal(honestStreak(["2026-09-13", "2026-09-14", "2026-09-15"], "2026-09-15"), 3);
    assert.equal(honestStreak(["2026-09-13", "2026-09-15"], "2026-09-15"), 1);
    assert.equal(honestStreak(["2026-09-13"], "2026-09-15"), 0);
    assert.equal(honestStreak(["2026-09-14"], "2026-09-15"), 1);
    const loop = dailyReturn({
      lastWear: "2026-09-13",
      wornIsos: ["2026-09-13"],
      now: friday,
    });
    assert.equal(loop.miss, MISS_LINE);
    assert.equal(loop.streak, 0);
    assert.doesNotMatch(MISS_LINE, /you |broken|fail|shame|lost/i);
    const daily = readFileSync(new URL("./daily.ts", import.meta.url), "utf8");
    const today = readFileSync(new URL("../components/today.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(daily, SHAME);
    assert.doesNotMatch(today, SHAME);
    assert.match(today, /loop\.miss/);
    assert.match(today, /loop\.streak/);
  });
});
