import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it, beforeEach } from "node:test";
import {
  CHECKOUT_ENABLED,
  CHECKOUT_MODE,
  applyCaptured,
  createOrder,
  handleWebhook,
  resetCheckoutInbox,
  signPayload,
  verifySignature,
} from "./checkout.ts";

const SECRET = "test_webhook_secret_not_a_live_key";
const body = JSON.stringify({ id: "evt_test_1", event: "payment.captured" });

describe("checkout stub", () => {
  beforeEach(() => resetCheckoutInbox());

  it("stays off, test-mode, and never opens an order", () => {
    assert.equal(CHECKOUT_ENABLED, false);
    assert.equal(CHECKOUT_MODE, "test");
    assert.deepEqual(createOrder({ userId: "u", cycle: "month", amountPaise: 99900 }), {
      ok: false,
      reason: "off",
    });
    const src = readFileSync(new URL("./checkout.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /rzp_live|RAZORPAY_KEY|fetch\(/);
    assert.doesNotMatch(src, /api\.razorpay\.com/);
    const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      dependencies: Record<string, string>;
    };
    assert.equal("razorpay" in pkg.dependencies, false);
  });

  it("verifies signatures and is idempotent", () => {
    const sig = signPayload(body, SECRET);
    assert.equal(verifySignature(body, sig, SECRET), true);
    assert.equal(verifySignature(body, "deadbeef", SECRET), false);
    assert.equal(handleWebhook({ body, signature: "nope", secret: SECRET }).ok, false);
    const first = handleWebhook({ body, signature: sig, secret: SECRET });
    const second = handleWebhook({ body, signature: sig, secret: SECRET });
    assert.equal(first.ok, true);
    if (first.ok) {
      assert.equal(first.duplicate, false);
      assert.equal(first.event, "payment.captured");
    }
    assert.equal(second.ok, true);
    if (second.ok) assert.equal(second.duplicate, true);
    assert.deepEqual(applyCaptured(first), { applied: false });
  });
});
