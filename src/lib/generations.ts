import { ageOn, clampYmd, parseIsoDate, ymdInZone, type Ymd } from "./clock.ts";
import { localDateKey, type Gender, type Generation, type Mode } from "./types.ts";

export const GENERATIONS: {
  id: Generation;
  years: string;
  gen: string;
  minAge: number;
  maxAge: number;
}[] = [
  { id: "alpha", years: "10–13", gen: "Gen Alpha", minAge: 10, maxAge: 13 },
  { id: "teen", years: "14–17", gen: "Young Z", minAge: 14, maxAge: 17 },
  { id: "z", years: "18–24", gen: "Gen Z", minAge: 18, maxAge: 24 },
  { id: "zlate", years: "25–29", gen: "Older Z", minAge: 25, maxAge: 29 },
  { id: "mill", years: "30–41", gen: "Millennial", minAge: 30, maxAge: 41 },
  { id: "x", years: "42–54", gen: "Gen X", minAge: 42, maxAge: 54 },
  { id: "prime", years: "55 and over", gen: "Boomer+", minAge: 55, maxAge: 120 },
];

export const MIN_AGE = 10;
export const MAX_AGE = 100;

export function generationById(id: Generation) {
  return GENERATIONS.find((g) => g.id === id) ?? GENERATIONS[2];
}

export function isMinor(id: Generation) {
  return id === "alpha" || id === "teen";
}

export function modeFromGeneration(id: Generation): Mode {
  return isMinor(id) ? "closet" : "house";
}

export function ageYears(birthDate: string, now = new Date()): number {
  const birth = parseIsoDate(birthDate);
  if (!birth) return 0;
  return ageOn(birth, ymdInZone(now));
}

export function generationFromAge(age: number): Generation {
  if (age < 14) return "alpha";
  if (age < 18) return "teen";
  if (age < 25) return "z";
  if (age < 30) return "zlate";
  if (age < 42) return "mill";
  if (age < 55) return "x";
  return "prime";
}

export function generationFromBirthDate(birthDate: string, now = new Date()): Generation {
  return generationFromAge(ageYears(birthDate, now));
}

export function birthDateForGeneration(id: Generation, now = new Date()): string {
  const g = generationById(id);
  const mid = Math.floor((g.minAge + Math.min(g.maxAge, 80)) / 2);
  const on = ymdInZone(now);
  const born = clampYmd(on.y - mid, 7, 1);
  return iso(born);
}

export function dateBounds(now = new Date()) {
  const on = ymdInZone(now);
  const youngest = clampYmd(on.y - MIN_AGE, on.m, on.d);
  const oldest = clampYmd(on.y - MAX_AGE, on.m, on.d);
  return { min: iso(oldest), max: iso(youngest) };
}

function iso({ y, m, d }: Ymd) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function applyLifetime<
  T extends { birthDate: string; ageBand: Generation; cohort: Mode; lastSyncDate: string },
>(meta: T, now = new Date()): T {
  if (!meta.birthDate) return meta;
  const ageBand = generationFromBirthDate(meta.birthDate, now);
  const cohort = modeFromGeneration(ageBand);
  const lastSyncDate = localDateKey(now);
  if (meta.ageBand === ageBand && meta.cohort === cohort && meta.lastSyncDate === lastSyncDate) {
    return meta;
  }
  return { ...meta, ageBand, cohort, lastSyncDate };
}

export const BIRTH_KEY = "amirelle_birth_date";
export const GENDER_KEY = "amirelle_gender";

export function genderOptions(gen: Generation): { id: Gender; label: string }[] {
  if (isMinor(gen)) {
    return [
      { id: "femme", label: "Girl" },
      { id: "masc", label: "Boy" },
      { id: "both", label: "Both" },
    ];
  }
  return [
    { id: "femme", label: "Woman" },
    { id: "masc", label: "Man" },
    { id: "both", label: "Both" },
  ];
}

export function genderLabel(gen: Generation, gender: Gender | "") {
  if (!gender) return "";
  return genderOptions(gen).find((o) => o.id === gender)?.label ?? "";
}
