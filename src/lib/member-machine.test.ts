import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it, beforeEach } from "node:test";
import { noonIST } from "./clock.ts";
import {
  TRANSITIONS,
  canMove,
  checkEntitlement,
  depthFromEntitlement,
  move,
  previewOnServer,
  resetMemberLedger,
  tickRecord,
} from "./member-machine.ts";
import { corePlateBlocked } from "./membership.ts";
import { plateForSituation } from "./today-desk.ts";
import { EMPTY_TASTE } from "./habit.ts";
import type { Cloth } from "./types.ts";

const NOW = noonIST(2026, 9, 16);
const YEST = "2026-09-15";
const TODAY = "2026-09-16";

describe("membership machine", () => {
  beforeEach(() => resetMemberLedger());

  it("allows every published transition and refuses the rest", () => {
    const states = Object.keys(TRANSITIONS) as (keyof typeof TRANSITIONS)[];
    for (const from of states) {
      for (const to of states) {
        assert.equal(canMove(from, to), TRANSITIONS[from].includes(to), `${from}→${to}`);
      }
    }
    move("u", "preview", NOW, TODAY, "month");
    move("u", "trial", NOW, TODAY, "month");
    move("u", "active", NOW, TODAY, "month");
    move("u", "lapsed", NOW, YEST, "month");
    move("u", "cancelled", NOW);
    move("u", "preview", NOW, TODAY, "month");
    assert.throws(() => move("u", "active", NOW));
    const src = readFileSync(new URL("./member-machine.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /stripe|razorpay|paypal|cashfree/i);
  });

  it("lapses mid-session from the server record, not local plan", () => {
    move("u", "preview", NOW, YEST, "month");
    move("u", "trial", NOW, YEST, "month");
    move("u", "active", NOW, YEST, "month");
    const local = { plan: "atelier" as const };
    const ent = checkEntitlement("u", NOW);
    assert.equal(ent.status, "lapsed");
    assert.equal(ent.entitled, false);
    assert.equal(depthFromEntitlement(ent), false);
    assert.equal(local.plan, "atelier");
    assert.equal(corePlateBlocked("free"), false);
    const look = plateForSituation(
      [
        { id: 1, name: "Shirt", cat: "tops", color: "white", photo: null, brand: "COS", cut: "poplin shirt" } as Cloth,
        { id: 2, name: "Trousers", cat: "bottoms", color: "navy", photo: null, brand: "Zara", cut: "trouser" } as Cloth,
        { id: 3, name: "Oxford", cat: "shoes", color: "black", photo: null, brand: "Aldo", cut: "oxford shoe" } as Cloth,
      ],
      "",
      [],
      "mill",
      EMPTY_TASTE,
      "work",
    );
    assert.equal(look.fit.ok, true);
    const ticked = tickRecord({ userId: "x", status: "trial", until: YEST, cycle: "month" }, NOW);
    assert.equal(ticked.status, "lapsed");
    const preview = previewOnServer("v", "year", NOW);
    assert.equal(preview.status, "preview");
    assert.equal(preview.entitled, true);
    assert.equal(checkEntitlement("nobody", NOW).status, "complimentary");
  });
});
