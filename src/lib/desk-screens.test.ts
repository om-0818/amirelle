import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentPractice, journalEssays, looksSafe, piecesForLook } from "./desk-screens.ts";
import type { Cloth, HistoryEntry } from "./types.ts";

describe("practice", () => {
  it("never returns a blank day", () => {
    assert.equal(currentPractice(1).day, 1);
    assert.equal(currentPractice(0).day, 1);
    assert.equal(currentPractice(Number.NaN).day, 1);
    assert.equal(currentPractice(7).day, 7);
    assert.equal(currentPractice(99).day, 7);
    assert.ok(currentPractice(1).title);
    assert.ok(currentPractice(7).task);
  });
});

describe("looks", () => {
  it("empty and missing history do not crash", () => {
    assert.deepEqual(looksSafe([]), []);
    assert.deepEqual(looksSafe(undefined), []);
    assert.deepEqual(looksSafe(null), []);
    const entry = {
      date: "Tue",
      pieces: [],
      desc: "",
      mood: "calm",
      occ: "casual",
    } as HistoryEntry;
    assert.deepEqual(piecesForLook(entry, []), []);
  });

  it("rehydrates the rail item by name, not a new id", () => {
    const shirt: Cloth = {
      id: 101,
      name: "Poplin shirt",
      cat: "tops",
      color: "white",
      photo: null,
      brand: "COS",
    };
    const entry = {
      date: "Tue",
      pieces: [{ name: "Poplin shirt", cat: "tops" as const, photo: null, brand: "COS" }],
      desc: "Work",
      mood: "calm",
      occ: "work",
    };
    const pieces = piecesForLook(entry, [shirt]);
    assert.equal(pieces.length, 1);
    assert.equal(pieces[0].id, 101);
  });
});

describe("journal", () => {
  it("has essays, and an empty list is still iterable", () => {
    const essays = journalEssays();
    assert.ok(essays.length > 0);
    assert.doesNotThrow(() => [...[]].map((x) => x));
    for (const e of essays) {
      assert.ok(e.title);
      assert.ok(e.body);
    }
  });
});
