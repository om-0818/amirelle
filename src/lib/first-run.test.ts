import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { FIRST_RUN_ASKS, FIRST_RUN_BUDGET_MS, firstLookRail, firstPlate, timeFirstPlate } from "./first-run.ts";

describe("first run", () => {
  it("asks only birth date and gender, then plates under 60s including an empty closet", () => {
    assert.deepEqual([...FIRST_RUN_ASKS], ["birth", "gender"]);
    const welcome = readFileSync(new URL("../components/welcome.tsx", import.meta.url), "utf8");
    assert.doesNotMatch(welcome, /step === 2/);
    assert.doesNotMatch(welcome, /How you like to dress/);
    assert.doesNotMatch(welcome, /CITIES\.map/);
    assert.match(welcome, /How old today/);
    assert.match(welcome, /Who we dress/);
    assert.match(welcome, /void enter\(\)/);

    const empty = firstLookRail([], "z", "femme");
    assert.ok(empty.length > 0);
    const look = firstPlate([], "z", "femme", "work");
    assert.equal(look.fit.ok, true);
    assert.ok(look.pieces.length > 0);

    const timed = timeFirstPlate([], "z", "femme");
    assert.equal(timed.ok, true);
    assert.ok(timed.ms < FIRST_RUN_BUDGET_MS, `first plate ${timed.ms}ms`);
    process.stdout.write(`FIRST_RUN_MS=${timed.ms.toFixed(1)}\n`);
  });
});
