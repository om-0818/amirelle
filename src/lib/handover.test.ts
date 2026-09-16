import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("handover-2", () => {
  it("lists review items, known-broken, and five next files", () => {
    const doc = readFileSync(new URL("../../docs/HANDOVER-2.md", import.meta.url), "utf8");
    assert.match(doc, /2000-plate/);
    assert.match(doc, /REQUIRES-HUMAN-REVIEW/);
    assert.match(doc, /DPDP/);
    assert.match(doc, /Cancellation/);
    assert.match(doc, /Checkout/);
    assert.match(doc, /src\/lib\/sitting\.ts/);
    assert.match(doc, /src\/lib\/catalog\.ts/);
    assert.match(doc, /src\/lib\/composite\.ts/);
    assert.match(doc, /src\/routes\/login\.tsx/);
    assert.match(doc, /public\/sitemap\.xml/);
    assert.match(doc, /CHECKOUT_ENABLED/);
    assert.match(doc, /gen\.gen/);
  });
});
