import { STORAGE_KEYS } from "./privacy.ts";
import { ledgerFromV1 } from "./ledger.ts";

/** Stamped local schema. Unstamped current keys are version 0. */
export const SCHEMA_VERSION = 2;

export type StorageIO = {
  get: (key: string) => string;
  set: (key: string, value: string) => boolean | void;
};

const LIVE_KEYS = (Object.keys(STORAGE_KEYS) as (keyof typeof STORAGE_KEYS)[]).filter((k) => k !== "schema");

function parseVersion(raw: string): number | null {
  if (!raw) return null;
  try {
    const n = JSON.parse(raw) as { version?: unknown } | number;
    if (typeof n === "number" && Number.isFinite(n)) return n;
    if (n && typeof n === "object" && typeof n.version === "number") return n.version;
  } catch {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function readSchemaVersion(get: StorageIO["get"]): number {
  const stamped = parseVersion(get(STORAGE_KEYS.schema));
  if (stamped != null) return stamped;
  const hasLive = LIVE_KEYS.some((name) => Boolean(get(STORAGE_KEYS[name])));
  return hasLive ? 0 : SCHEMA_VERSION;
}

/** v0 (today's keys, no stamp) → v1. Copy nothing. Do not rewrite the closet. */
function migrateV0toV1(_io: StorageIO) {
  /* stamp only. */
}

/** v1 counts + wornLog → append-only ledger. Keep the closet and the old counts. */
function migrateV1toV2(io: StorageIO) {
  if (io.get(STORAGE_KEYS.ledger)) return;
  let counts: Record<string, number> = {};
  try {
    const raw = io.get(STORAGE_KEYS.wears);
    if (raw) counts = JSON.parse(raw) as Record<string, number>;
  } catch {
    counts = {};
  }
  let meta: { wornLog?: { iso: string; vibe?: string }[]; lastWear?: string; lastWornIds?: number[] } = {};
  try {
    const raw = io.get(STORAGE_KEYS.meta);
    if (raw) meta = JSON.parse(raw) as typeof meta;
  } catch {
    meta = {};
  }
  const rows = ledgerFromV1({
    counts,
    wornLog: Array.isArray(meta.wornLog) ? meta.wornLog : [],
    lastWear: typeof meta.lastWear === "string" ? meta.lastWear : "",
    lastWornIds: Array.isArray(meta.lastWornIds) ? meta.lastWornIds : [],
  });
  io.set(STORAGE_KEYS.ledger, JSON.stringify(rows));
}

const STEPS: Record<number, (io: StorageIO) => void> = {
  0: migrateV0toV1,
  1: migrateV1toV2,
};

export function migrateLocal(io: StorageIO): { from: number; to: number } {
  let version = readSchemaVersion(io.get);
  const from = version;
  while (version < SCHEMA_VERSION) {
    const step = STEPS[version];
    if (!step) break;
    step(io);
    version += 1;
    io.set(STORAGE_KEYS.schema, JSON.stringify({ version }));
  }
  if (!io.get(STORAGE_KEYS.schema)) {
    io.set(STORAGE_KEYS.schema, JSON.stringify({ version: SCHEMA_VERSION }));
  }
  return { from, to: version };
}
