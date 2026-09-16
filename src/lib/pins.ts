import { STORAGE_KEYS } from "./privacy.ts";
import { store } from "./storage.ts";
import type { Cloth } from "./types.ts";

export const PINS_KEY = STORAGE_KEYS.pins;

export type PinState = {
  clothes: Cloth[];
  pinned: number[];
  hidden: number[];
};

/** Hold the exact rail item. Same id. No clone. Second call is a no-op. */
export function pinFromCredits(state: PinState, item: Cloth): PinState {
  const hidden = state.hidden.filter((id) => id !== item.id);
  const pinned = state.pinned.includes(item.id) ? state.pinned : [...state.pinned, item.id];
  const has = state.clothes.some((c) => c.id === item.id);
  const clothes = has ? state.clothes : [...state.clothes, item];
  return { clothes, pinned, hidden };
}

export function loadPins(): number[] {
  try {
    const raw = store.get(PINS_KEY, "[]");
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export function savePins(ids: number[]) {
  store.set(PINS_KEY, JSON.stringify([...new Set(ids)]));
}
