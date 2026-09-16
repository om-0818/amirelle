import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PERF_BUDGET_MS,
  budgetFailures,
  percentile,
  profilePlateCycle,
} from "./perf-budget.ts";

describe("plate performance budget", () => {
  it("p50/p95 of a full plate stay inside PERF_BUDGET_MS", () => {
    const profile = profilePlateCycle(2);
    for (const xs of Object.values(profile)) {
      assert.equal(xs.length >= 14, true);
      for (const n of xs) assert.equal(Number.isFinite(n) && n >= 0, true);
    }
    const fail = budgetFailures(profile);
    assert.deepEqual(fail, [], fail.join("; "));
    assert.equal(PERF_BUDGET_MS.localLook.max >= PERF_BUDGET_MS.localLook.p95, true);
    assert.equal(percentile([1, 2, 3, 4, 5], 50) <= percentile([1, 2, 3, 4, 5], 95), true);
  });
});
