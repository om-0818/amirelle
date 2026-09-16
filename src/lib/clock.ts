/** The house keeps India time. Not the laptop. Not UTC. */
export const HOUSE_TZ = "Asia/Kolkata";

/**
 * One civil day on the POSIX / JavaScript clock.
 * Leap seconds exist in UTC (23:59:60). They do not exist on `Date`.
 * The 2016 leap second is a 1 ms gap, not a 1001 ms one. We never count TAI.
 */
export const CIVIL_DAY_MS = 86_400_000;

export type Ymd = { y: number; m: number; d: number };

export function ymdInZone(date: Date, tz = HOUSE_TZ): Ymd {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const n = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { y: n("year"), m: n("month"), d: n("day") };
}

export function dateKeyInZone(date = new Date(), tz = HOUSE_TZ): string {
  const { y, m, d } = ymdInZone(date, tz);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** IST never moves. +05:30 all year. */
export const IST_OFFSET_MIN = 330;

export function offsetMinutes(date: Date, tz = HOUSE_TZ): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const n = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return (asUtc - date.getTime()) / 60_000;
}

/** Noon in India. Month is 1-based. IST is UTC+5:30 with no DST and no local leap second. */
export function noonIST(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 6, 30, 0));
}

export function addDaysIST(date: Date, days: number): Date {
  const { y, m, d } = ymdInZone(date);
  return new Date(noonIST(y, m, d).getTime() + days * CIVIL_DAY_MS);
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function clampYmd(y: number, m: number, d: number): Ymd {
  if (m < 1) return { y: y - 1, m: 12, d: Math.min(d, 31) };
  if (m > 12) return { y: y + 1, m: 1, d: Math.min(d, 31) };
  return { y, m, d: Math.min(d, daysInMonth(y, m)) };
}

export function parseIsoDate(iso: string): Ymd | null {
  const hit = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!hit) return null;
  const y = Number(hit[1]);
  const m = Number(hit[2]);
  const d = Number(hit[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const utc = new Date(Date.UTC(y, m - 1, d));
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m - 1 || utc.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/**
 * Parse an instant. `Date` rejects `23:59:60`.
 * A UTC leap second is the first instant of the next UTC day — that is IERS, and POSIX.
 * `23:59:60` in any other offset is not a real leap second; it is invalid.
 */
export function fromIsoInstant(iso: string): Date | null {
  const trimmed = iso.trim();
  const leap = /^(\d{4})-(\d{2})-(\d{2})T23:59:60(?:\.\d+)?Z$/i.exec(trimmed);
  if (leap) {
    const y = Number(leap[1]);
    const m = Number(leap[2]);
    const d = Number(leap[3]);
    return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0));
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ageOn(birth: Ymd, on: Ymd): number {
  let age = on.y - birth.y;
  const had = on.m > birth.m || (on.m === birth.m && on.d >= birth.d);
  if (!had) age -= 1;
  return age;
}

export function isoWeekFromYmd({ y, m, d }: Ymd): number {
  const t = new Date(Date.UTC(y, m - 1, d));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / CIVIL_DAY_MS + 1) / 7);
}

const WEEKDAY_SUN0: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** 0 Sunday … 6 Saturday, India civil. Not the laptop's weekday. */
export function weekdayIST(date: Date, tz = HOUSE_TZ): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" }).formatToParts(date);
  const w = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  return WEEKDAY_SUN0[w] ?? 0;
}

export function formatCivilIST(
  date?: Date,
  options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" },
): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone: HOUSE_TZ, ...options }).format(date ?? new Date());
}
