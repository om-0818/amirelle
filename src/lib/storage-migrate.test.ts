import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STORAGE_KEYS } from "./privacy.ts";
import { SCHEMA_VERSION, migrateLocal, readSchemaVersion } from "./storage-migrate.ts";
import { appendWear, countsFromLedger, daysFromLedger, parseLedger, tasteFromLedger } from "./ledger.ts";
import type { Cloth } from "./types.ts";

/** Unstamped bag as shipped before this runner — the current shape. */
const V1_FIXTURE: Record<string, string> = {
  [STORAGE_KEYS.user]: JSON.stringify([
    {
      id: 9001,
      name: "Navy oxford",
      cat: "tops",
      color: "navy",
      photo: "data:image/png;base64,iVBORw0KGgo=",
      brand: "COS",
      from: "roll",
    },
  ]),
  [STORAGE_KEYS.hidden]: JSON.stringify([12, 44]),
  [STORAGE_KEYS.history]: JSON.stringify([{ id: "look-1", occ: "work", pieces: [9001] }]),
  [STORAGE_KEYS.meta]: JSON.stringify({
    onboarded: true,
    birthDate: "1996-04-02",
    gender: "femme",
    wears: 3,
    grillCount: 1,
    lastWear: "2026-09-15",
    lastWornIds: [9001],
  }),
  [STORAGE_KEYS.taste]: JSON.stringify({ brands: { COS: 2 }, colors: { navy: 1 }, cats: { tops: 1 } }),
  [STORAGE_KEYS.wears]: JSON.stringify({ "9001": 3 }),
  [STORAGE_KEYS.pins]: JSON.stringify([9001]),
  [STORAGE_KEYS.birth]: "1996-04-02",
  [STORAGE_KEYS.gender]: "femme",
  [STORAGE_KEYS.light]: "dark",
};

function bagIO(bag: Record<string, string>) {
  return {
    get: (key: string) => bag[key] ?? "",
    set: (key: string, value: string) => {
      bag[key] = value;
      return true;
    },
  };
}

describe("storage schema", () => {
  it("loads a v1 fixture and comes out intact, with a ledger", () => {
    const bag = { ...V1_FIXTURE };
    assert.equal(readSchemaVersion(bagIO(bag).get), 0);
    const io = bagIO(bag);
    const { from, to } = migrateLocal(io);
    assert.equal(from, 0);
    assert.equal(to, SCHEMA_VERSION);
    assert.equal(JSON.parse(bag[STORAGE_KEYS.schema]).version, SCHEMA_VERSION);

    const user = JSON.parse(bag[STORAGE_KEYS.user]) as { id: number; photo: string; name: string }[];
    assert.equal(user.length, 1);
    assert.equal(user[0].id, 9001);
    assert.equal(user[0].name, "Navy oxford");
    assert.equal(user[0].photo.startsWith("data:image/png"), true);
    assert.deepEqual(JSON.parse(bag[STORAGE_KEYS.hidden]), [12, 44]);
    assert.deepEqual(JSON.parse(bag[STORAGE_KEYS.wears]), { "9001": 3 });
    assert.deepEqual(JSON.parse(bag[STORAGE_KEYS.pins]), [9001]);
    assert.equal(JSON.parse(bag[STORAGE_KEYS.taste]).brands.COS, 2);
    assert.equal(JSON.parse(bag[STORAGE_KEYS.meta]).birthDate, "1996-04-02");
    assert.equal(bag[STORAGE_KEYS.birth], "1996-04-02");
    assert.equal(bag[STORAGE_KEYS.gender], "femme");
    assert.equal(bag[STORAGE_KEYS.history].includes("look-1"), true);

    const snapshot = bag[STORAGE_KEYS.ledger];
    const ledger = parseLedger(snapshot);
    assert.equal(countsFromLedger(ledger)[9001], 3);
    assert.equal(ledger.every((r) => r.outcome === "worn" && r.item === 9001), true);

    const again = migrateLocal(io);
    assert.equal(again.from, SCHEMA_VERSION);
    assert.equal(again.to, SCHEMA_VERSION);
    assert.equal(bag[STORAGE_KEYS.ledger], snapshot);
    assert.equal(user[0].photo, JSON.parse(bag[STORAGE_KEYS.user])[0].photo);
  });

  it("empty store stamps current version and does not invent a closet", () => {
    const bag: Record<string, string> = {};
    const { from, to } = migrateLocal(bagIO(bag));
    assert.equal(from, SCHEMA_VERSION);
    assert.equal(to, SCHEMA_VERSION);
    assert.equal(JSON.parse(bag[STORAGE_KEYS.schema]).version, SCHEMA_VERSION);
    assert.equal(bag[STORAGE_KEYS.user], undefined);
  });
});

describe("wear ledger", () => {
  it("is append-only across reload and feeds CPW, week strip, and taste", () => {
    const bag = { ...V1_FIXTURE };
    migrateLocal(bagIO(bag));
    const first = parseLedger(bag[STORAGE_KEYS.ledger]);
    const next = appendWear(first, { item: 9001, date: "2026-09-16", occ: "work", outcome: "worn" });
    assert.equal(next.length, first.length + 1);
    assert.deepEqual(next.slice(0, first.length), first);
    bag[STORAGE_KEYS.ledger] = JSON.stringify(next);
    const reloaded = parseLedger(bag[STORAGE_KEYS.ledger]);
    assert.deepEqual(reloaded, next);
    assert.equal(countsFromLedger(reloaded)[9001], 4);
    const days = daysFromLedger(reloaded);
    assert.equal(days.some((d) => d.iso === "2026-09-16" && d.vibe === "Work"), true);
    const cloth: Cloth = {
      id: 9001,
      name: "Navy oxford",
      cat: "tops",
      color: "navy",
      photo: null,
      brand: "COS",
    };
    const taste = tasteFromLedger(reloaded, (id) => (id === 9001 ? cloth : undefined));
    assert.equal(taste.brands.COS, 8);
    const junk = parseLedger('[{"item":"x"},{"item":9001,"date":"nope","occ":"gym","outcome":"worn"}]');
    assert.equal(junk.length, 0);
  });
});
