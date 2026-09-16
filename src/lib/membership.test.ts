import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  GATES,
  MEMBERSHIP,
  MONTH_INR,
  YEAR_INR,
  corePlateBlocked,
  namesPaymentSdk,
  previewUnlock,
  rupee,
} from "./membership.ts";
import { plateForSituation } from "./today-desk.ts";
import { EMPTY_TASTE } from "./habit.ts";
import type { Cloth } from "./types.ts";

const piece = (over: Partial<Cloth>): Cloth => ({
  id: 1,
  name: "Shirt",
  cat: "tops",
  color: "white",
  photo: null,
  brand: "COS",
  cut: "poplin shirt",
  ...over,
});

const WORK_RAIL: Cloth[] = [
  piece({ id: 1, name: "Poplin shirt", cat: "tops", cut: "poplin shirt" }),
  piece({ id: 2, name: "Trousers", cat: "bottoms", color: "navy", cut: "tailored trousers" }),
  piece({ id: 3, name: "Oxford", cat: "shoes", color: "black", cut: "oxford" }),
];

describe("membership", () => {
  it("prints ₹999 and ₹8,990 with Indian grouping", () => {
    assert.equal(MONTH_INR, 999);
    assert.equal(YEAR_INR, 8990);
    assert.equal(rupee(999), "₹999");
    assert.equal(rupee(8990), "₹8,990");
    assert.equal(MEMBERSHIP.month.label, "₹999");
    assert.equal(MEMBERSHIP.year.label, "₹8,990");
    assert.match(MEMBERSHIP.year.label, /8,990/);
    assert.match(MEMBERSHIP.gst, /GST/i);
    assert.match(MEMBERSHIP.gst, /inclusive of GST/i);
    assert.match(MEMBERSHIP.gst, /not a tax invoice/i);
    const desk = readFileSync(new URL("../components/atelier-view.tsx", import.meta.url), "utf8");
    assert.match(desk, /MEMBERSHIP\.gst/);
    const review = readFileSync(new URL("../../docs/REVIEW-REQUIRED.md", import.meta.url), "utf8");
    assert.match(review, /Cancellation — REQUIRES-HUMAN-REVIEW/);
    assert.match(review, /Refund — REQUIRES-HUMAN-REVIEW/);
    assert.match(review, /Auto-renewal — REQUIRES-HUMAN-REVIEW/);
    assert.match(review, /Draft only/);
  });

  it("preview unlocks with no card and no payment SDK", () => {
    const month = previewUnlock("month");
    const year = previewUnlock("year");
    assert.equal(month.plan, "atelier");
    assert.equal(month.billed, false);
    assert.equal(month.card, false);
    assert.equal(year.card, false);
    const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    for (const name of [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]) {
      assert.equal(namesPaymentSdk(name), false, name);
    }
    assert.equal(namesPaymentSdk("stripe"), true);
    assert.equal(namesPaymentSdk("razorpay"), true);
  });

  it("does not paywall a core plate on complimentary", () => {
    assert.equal(corePlateBlocked("free"), false);
    assert.equal(corePlateBlocked("atelier"), false);
    const look = plateForSituation(WORK_RAIL, "", [], "mill", EMPTY_TASTE, "work");
    assert.equal(look.fit.ok, true);
    assert.ok(look.pieces.length > 0);
    assert.equal(GATES.filter((g) => g.gates === "never").every((g) => g.id === "today"), true);
    assert.equal(GATES.some((g) => g.id === "grill" && g.gates === "depth"), true);
    const board = readFileSync(new URL("../components/style-board.tsx", import.meta.url), "utf8");
    const lookAt = board.indexOf("localLook");
    const sitAt = board.indexOf("spendSitting");
    assert.ok(lookAt >= 0 && sitAt > lookAt, "Style plates before it meters the sitting");
    assert.match(board, /This look is from the rail/);
    const sitBlock = board.slice(sitAt, sitAt + 280);
    assert.doesNotMatch(sitBlock, /setScreen/);
    const map = readFileSync(new URL("../../docs/PAYWALL-MAP.md", import.meta.url), "utf8");
    assert.match(map, /never correctness/i);
    assert.match(map, /Today plate/);
  });
});
