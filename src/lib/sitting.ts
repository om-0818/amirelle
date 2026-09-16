import { dateKeyInZone } from "./clock.ts";
import { SITTINGS_FREE } from "./membership.ts";
import { STORAGE_KEYS } from "./privacy.ts";
import type { Plan } from "./types.ts";

/** Sittings live only in meta. Clearing any other key does not mint a new sitting. */
export const SITTING_STORAGE_KEY = STORAGE_KEYS.meta;

export type SittingState = {
  grillDate: string;
  grillCount: number;
  plan: Plan;
};

export function sittingsUsed(state: SittingState, now = new Date()): number {
  if (state.plan === "atelier") return 0;
  const today = dateKeyInZone(now);
  return state.grillDate === today ? state.grillCount : 0;
}

export function sittingsRemaining(state: SittingState, now = new Date()): number {
  if (state.plan === "atelier") return 99;
  return Math.max(0, SITTINGS_FREE - sittingsUsed(state, now));
}

export function takeSitting(
  state: SittingState,
  now = new Date(),
): { ok: boolean; next: SittingState } {
  if (state.plan === "atelier") return { ok: true, next: state };
  const today = dateKeyInZone(now);
  const count = state.grillDate === today ? state.grillCount : 0;
  if (count >= SITTINGS_FREE) return { ok: false, next: state };
  return { ok: true, next: { ...state, grillDate: today, grillCount: count + 1 } };
}
