import { addDaysIST, dateKeyInZone, HOUSE_TZ, noonIST, parseIsoDate } from "./clock.ts";

/** The morning the plate lands. India civil, not the laptop. */
export const PLATE_HOUR_IST = 7;
export const MISS_LINE = "Yesterday was not logged.";

export function hourIST(date: Date, tz = HOUSE_TZ): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value);
}

/** Civil day the plate belongs to. Before 7:00 IST it is still yesterday's look. */
export function plateDayKey(now: Date): string {
  const key = dateKeyInZone(now);
  if (hourIST(now) >= PLATE_HOUR_IST) return key;
  const ymd = parseIsoDate(key);
  if (!ymd) return key;
  return dateKeyInZone(addDaysIST(noonIST(ymd.y, ymd.m, ymd.d), -1));
}

export function plateReady(now: Date): boolean {
  return hourIST(now) >= PLATE_HOUR_IST;
}

function prevKey(iso: string): string {
  const ymd = parseIsoDate(iso);
  if (!ymd) return "";
  return dateKeyInZone(addDaysIST(noonIST(ymd.y, ymd.m, ymd.d), -1));
}

/** Consecutive logged days, ending today or yesterday. Gaps are zero. No padding. */
export function honestStreak(dates: string[], today: string): number {
  const set = new Set(dates.filter(Boolean));
  let cursor = today;
  if (!set.has(cursor)) {
    cursor = prevKey(today);
    if (!cursor || !set.has(cursor)) return 0;
  }
  let n = 0;
  while (cursor && set.has(cursor)) {
    n += 1;
    cursor = prevKey(cursor);
  }
  return n;
}

export function missedDayLine(lastWear: string, now: Date): string | null {
  if (!lastWear) return null;
  const today = dateKeyInZone(now);
  const yest = prevKey(today);
  if (lastWear === today || lastWear === yest) return null;
  return MISS_LINE;
}

export function dailyReturn(input: {
  lastWear: string;
  wornIsos: string[];
  now: Date;
}): {
  plateDay: string;
  ready: boolean;
  miss: string | null;
  streak: number;
  kicker: string | null;
} {
  const ready = plateReady(input.now);
  return {
    plateDay: plateDayKey(input.now),
    ready,
    miss: missedDayLine(input.lastWear, input.now),
    streak: honestStreak(input.wornIsos, dateKeyInZone(input.now)),
    kicker: ready ? null : "Today's look lands at 7:00.",
  };
}
