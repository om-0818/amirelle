import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_CLOSET, RAIL_FAILED, closetEmpty, errorMessage, railStatus } from "./resilience.ts";

describe("resilience", () => {
  it("never treats a missing rail as clothes to plate", () => {
    assert.equal(railStatus(undefined).ok, false);
    assert.equal(railStatus(null).ok, false);
    assert.deepEqual(railStatus([]).clothes, []);
    assert.equal(railStatus([]).message, RAIL_FAILED);
    assert.equal(railStatus([{ id: 1 } as never]).ok, true);
  });

  it("tells an empty closet apart from a harsh filter", () => {
    assert.equal(closetEmpty(0, 0), "none");
    assert.equal(closetEmpty(40, 0), "filter");
    assert.equal(closetEmpty(40, 4), "ok");
    assert.match(EMPTY_CLOSET, /photo|filter/i);
  });

  it("error copy is never blank", () => {
    assert.ok(errorMessage(new Error("cut failed")));
    assert.equal(errorMessage(new Error("cut failed")), "cut failed");
    assert.ok(errorMessage(null).length > 8);
    assert.ok(errorMessage(undefined).length > 8);
    assert.doesNotMatch(errorMessage(""), /^\s*$/);
  });
});
