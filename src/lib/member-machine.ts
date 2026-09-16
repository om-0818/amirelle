import { dateKeyInZone } from "./clock.ts";

/** Preview / trial / active / lapsed / cancelled. Complimentary is no row. */
export type MemberStatus = "preview" | "trial" | "active" | "lapsed" | "cancelled";
export type MemberCycle = "month" | "year" | null;

export type MemberRecord = {
  userId: string;
  status: MemberStatus;
  until: string | null;
  cycle: MemberCycle;
};

export type Entitlement = {
  status: MemberStatus | "complimentary";
  entitled: boolean;
  until: string | null;
};

export const TRANSITIONS: Record<MemberStatus, readonly MemberStatus[]> = {
  preview: ["trial", "cancelled"],
  trial: ["active", "lapsed", "cancelled"],
  active: ["lapsed", "cancelled"],
  lapsed: ["active", "cancelled", "preview"],
  cancelled: ["preview"],
};

const ledger = new Map<string, MemberRecord>();

export function resetMemberLedger() {
  ledger.clear();
}

export function entitledStatus(status: MemberStatus | "complimentary"): boolean {
  return status === "preview" || status === "trial" || status === "active";
}

export function canMove(from: MemberStatus, to: MemberStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

function put(row: MemberRecord): MemberRecord {
  ledger.set(row.userId, row);
  return row;
}

function due(row: MemberRecord, today: string): boolean {
  return Boolean(row.until && row.until < today);
}

/** Server tick: an active/trial/preview past `until` lapses, even mid-session. */
export function tickRecord(row: MemberRecord, now: Date): MemberRecord {
  const today = dateKeyInZone(now);
  if (!due(row, today)) return row;
  if (row.status === "cancelled" || row.status === "lapsed") return row;
  if (!canMove(row.status, "lapsed")) return row;
  return put({ ...row, status: "lapsed" });
}

export function move(userId: string, to: MemberStatus, now: Date, until: string | null = null, cycle: MemberCycle = null): MemberRecord {
  const cur = ledger.get(userId);
  if (!cur) {
    if (to !== "preview") throw new Error("No membership to move");
    return put({ userId, status: "preview", until, cycle });
  }
  const next = tickRecord(cur, now);
  if (next.status === to) return next;
  if (!canMove(next.status, to)) throw new Error(`${next.status} cannot move to ${to}`);
  return put({ ...next, status: to, until: until ?? next.until, cycle: cycle ?? next.cycle });
}

/** The only entitlement check. Local plan is not consulted. */
export function checkEntitlement(userId: string, now: Date): Entitlement {
  const raw = ledger.get(userId);
  if (!raw) return { status: "complimentary", entitled: false, until: null };
  const row = tickRecord(raw, now);
  return { status: row.status, entitled: entitledStatus(row.status), until: row.until };
}

export function depthFromEntitlement(server: Entitlement): boolean {
  return server.entitled;
}

export function previewOnServer(userId: string, cycle: "month" | "year", now: Date): Entitlement {
  const until = dateKeyInZone(now);
  const cur = ledger.get(userId);
  if (!cur) move(userId, "preview", now, until, cycle);
  else if (cur.status === "cancelled" || cur.status === "lapsed") move(userId, "preview", now, until, cycle);
  else if (cur.status === "preview") put({ ...cur, until, cycle });
  return checkEntitlement(userId, now);
}
