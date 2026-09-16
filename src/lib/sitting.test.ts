import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dateKeyInZone } from "./clock.ts";
import { STORAGE_KEYS } from "./privacy.ts";
import {
  SITTING_STORAGE_KEY,
  sittingsRemaining,
  sittingsUsed,
  takeSitting,
  type SittingState,
} from "./sitting.ts";

const free = (): SittingState => ({ grillDate: "", grillCount: 0, plan: "free" });

/** 14 Sep 2026 23:59 IST = 14 Sep 18:29 UTC. 15 Sep 00:01 IST = 14 Sep 18:31 UTC. */
const IST_2359 = new Date("2026-09-14T18:29:00Z");
const IST_0001 = new Date("2026-09-14T18:31:00Z");

describe("grill sitting — one free a day, India civil midnight", () => {
  it("23:59 IST is still that India day; 00:01 IST is the next", () => {
    assert.equal(dateKeyInZone(IST_2359), "2026-09-14");
    assert.equal(dateKeyInZone(IST_0001), "2026-09-15");
  });

  it("the free sitting spends at 23:59 and is refused until 00:01", () => {
    const a = takeSitting(free(), IST_2359);
    assert.equal(a.ok, true);
    assert.equal(a.next.grillDate, "2026-09-14");
    assert.equal(a.next.grillCount, 1);
    assert.equal(sittingsRemaining(a.next, IST_2359), 0);
    const b = takeSitting(a.next, IST_2359);
    assert.equal(b.ok, false);
    assert.equal(b.next.grillCount, 1);
    const c = takeSitting(a.next, IST_0001);
    assert.equal(c.ok, true);
    assert.equal(c.next.grillDate, "2026-09-15");
    assert.equal(c.next.grillCount, 1);
    assert.equal(sittingsRemaining(c.next, IST_0001), 0);
  });

  it("month boundary: 30 Sep 23:59 IST resets at 1 Oct 00:01 IST", () => {
    const eve = new Date("2026-09-30T18:29:00Z");
    const dawn = new Date("2026-09-30T18:31:00Z");
    assert.equal(dateKeyInZone(eve), "2026-09-30");
    assert.equal(dateKeyInZone(dawn), "2026-10-01");
    const spent = takeSitting(free(), eve).next;
    assert.equal(takeSitting(spent, eve).ok, false);
    assert.equal(takeSitting(spent, dawn).ok, true);
  });

  it("survives reload — JSON round-trip of meta keeps the spend", () => {
    const spent = takeSitting(free(), IST_2359).next;
    const loaded = JSON.parse(JSON.stringify(spent)) as SittingState;
    assert.equal(sittingsUsed(loaded, IST_2359), 1);
    assert.equal(sittingsRemaining(loaded, IST_2359), 0);
    assert.equal(takeSitting(loaded, IST_2359).ok, false);
  });

  it("lives only on STORAGE_KEYS.meta; a decoy key cannot mint a sitting", () => {
    assert.equal(SITTING_STORAGE_KEY, STORAGE_KEYS.meta);
    assert.equal(
      Object.values(STORAGE_KEYS).includes("amirelle_grills_v0" as never),
      false,
    );
    const spent = takeSitting(free(), IST_2359).next;
    const decoyCleared = { ...spent };
    assert.equal(sittingsRemaining(decoyCleared, IST_2359), 0);
  });

  it("atelier is not metered", () => {
    const member: SittingState = { grillDate: "2026-09-14", grillCount: 40, plan: "atelier" };
    assert.equal(takeSitting(member, IST_2359).ok, true);
    assert.equal(sittingsRemaining(member, IST_2359), 99);
  });
});
