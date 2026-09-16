import { createHmac, timingSafeEqual } from "node:crypto";

/** Razorpay-shaped stub. Flag off. Test mode. No keys. No live calls. */
export const CHECKOUT_ENABLED = false as const;
export const CHECKOUT_MODE = "test" as const;
export const CHECKOUT_PROVIDER = "razorpay-stub" as const;

const seen = new Set<string>();

export function resetCheckoutInbox() {
  seen.clear();
}

export function signPayload(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expect = signPayload(body, secret);
  const a = Buffer.from(expect);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createOrder(_input: { userId: string; cycle: "month" | "year"; amountPaise: number }): {
  ok: false;
  reason: "off";
} {
  return { ok: false, reason: "off" };
}

export type WebhookResult =
  | { ok: false; reason: "bad-signature" | "invalid" }
  | { ok: true; duplicate: boolean; eventId: string; event: string };

export function handleWebhook(input: { body: string; signature: string; secret: string }): WebhookResult {
  if (!verifySignature(input.body, input.signature, input.secret)) {
    return { ok: false, reason: "bad-signature" };
  }
  let parsed: { id?: string; event?: string };
  try {
    parsed = JSON.parse(input.body) as { id?: string; event?: string };
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const eventId = parsed.id;
  const event = parsed.event;
  if (!eventId || !event) return { ok: false, reason: "invalid" };
  const duplicate = seen.has(eventId);
  seen.add(eventId);
  return { ok: true, duplicate, eventId, event };
}

/** Flag off: never apply a captured payment to membership. */
export function applyCaptured(_event: WebhookResult): { applied: false } {
  return { applied: false };
}
