/** Commercial offer. One membership. Not a SaaS ladder. Preview unlocks; no card. */

import { inr, type Plan } from "./types.ts";

export const MONTH_INR = 999;
export const YEAR_INR = 8990;
export const SITTINGS_FREE = 1;
export const LOOKBOOK_FREE = 8;
export const LOOKBOOK_MEMBER = 80;
export const ROLL_FREE = 20;
export const ROLL_MEMBER = 80;

const PAYMENT_SDK = /stripe|razorpay|paypal|cashfree|payu|square|braintree|paddle/i;

export function rupee(n: number) {
  return inr(n);
}

export function previewUnlock(_cycle: "month" | "year"): { plan: Plan; billed: false; card: false } {
  return { plan: "atelier", billed: false, card: false };
}

/** Today, closet, Holds/Almost/Not this never wait on a card. */
export function corePlateBlocked(_plan: Plan): false {
  return false;
}

export type GateKind = "depth" | "never";

export type GateSurface = {
  id: string;
  surface: string;
  free: string;
  member: string;
  gates: GateKind;
};

/** Depth only. Never correctness. */
export const GATES: GateSurface[] = [
  {
    id: "today",
    surface: "Today plate",
    free: "A complete, occasion-legal look from the rail. Holds, Almost, Not this.",
    member: "The same plate. Membership does not make a look more legal.",
    gates: "never",
  },
  {
    id: "grill",
    surface: "Stylist sitting",
    free: `${SITTINGS_FREE} sitting a day, India civil midnight`,
    member: "Unlimited sittings",
    gates: "depth",
  },
  {
    id: "looks",
    surface: "Looks kept",
    free: `${LOOKBOOK_FREE} looks`,
    member: `${LOOKBOOK_MEMBER} looks`,
    gates: "depth",
  },
  {
    id: "roll",
    surface: "Your photos",
    free: `${ROLL_FREE} photos from the roll, on this device`,
    member: `${ROLL_MEMBER} photos from the roll, on this device`,
    gates: "depth",
  },
  {
    id: "atelier",
    surface: "Membership desk",
    free: "Invitation. Preview unlock. No card.",
    member: "The desk is open",
    gates: "depth",
  },
];

export function namesPaymentSdk(name: string) {
  return PAYMENT_SDK.test(name);
}

export const MEMBERSHIP = {
  eyebrow: "Membership",
  headline: "Gemini will talk. The desk will plate tonight.",
  dek: "Chatbots invent clothes you do not own. Google will scan a library you did not offer. Amirelle uses the rail — the house, or a photo you brought — and keeps those pictures on this device.",
  month: {
    id: "month" as const,
    price: MONTH_INR,
    label: rupee(MONTH_INR),
    cadence: "a month",
    cta: "Request the month",
  },
  year: {
    id: "year" as const,
    price: YEAR_INR,
    label: rupee(YEAR_INR),
    cadence: "a year",
    note: "Two months given.",
    cta: "Request the year",
  },
  memberHas: [
    {
      kicker: "The desk",
      line: "Unlimited sittings. Keep, cut, not this. The look has to exist on your rail.",
    },
    {
      kicker: "The photograph",
      line: "Each look, worn — a lookbook frame, not a grid of products.",
    },
    {
      kicker: "Cost a wear",
      line: "Every logged wear drops the rupee. Quiet pieces surface. That is the metric, not a streak for show.",
    },
    {
      kicker: "Your photos",
      line: `${ROLL_MEMBER} pieces from the camera roll, filed on the rail. Never a library scan.`,
    },
  ],
  complimentaryHas: [
    "The rail — Zara to Ralph, cut for who we dress",
    "Set tonight. Holds, almost, or not this.",
    `${SITTINGS_FREE} stylist sitting a day`,
    `${ROLL_FREE} photos from your roll`,
    "Cost a wear on every logged piece",
    `${LOOKBOOK_FREE} looks kept`,
  ],
  compare: "Less than a Zara knit. Less than one look Gemini invented.",
  gst: "Inclusive of GST. Draft — not a tax invoice.",
  preview:
    "No card is taken in this preview. Requesting membership unlocks the desk here so you can wear it before we bill.",
};
