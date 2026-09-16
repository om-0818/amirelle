export type Category =
  | "tops"
  | "bottoms"
  | "dresses"
  | "shoes"
  | "accessories"
  | "outerwear";

export type House = "high" | "premium" | "indian" | "sport";

export type Generation = "alpha" | "teen" | "z" | "zlate" | "mill" | "x" | "prime";

export type AgeBand = Generation;

export type Mode = "closet" | "house" | "atelier";

export type Wearer = "femme" | "masc" | "uni";

export type Gender = "femme" | "masc" | "both";

export type Cloth = {
  id: number;
  name: string;
  cat: Category;
  color: string;
  photo: string | null;
  brand?: string;
  price?: number;
  house?: House;
  gens?: Generation[];
  wearer?: Wearer;
  from?: "house" | "roll";
  cut?: string;
};

export type HistoryEntry = {
  date: string;
  pieces: { name: string; cat: Category; photo: string | null; brand?: string }[];
  desc: string;
  vibe?: string;
  why?: string[];
  visual?: string | null;
  mood: string;
  occ: string;
};

export type WeatherTheme = {
  label: string;
  icon: "sun" | "cloud" | "rain" | "snow" | "wind" | "hot";
  sub: string;
  theme: "" | "rainy" | "cold" | "night";
  tempC?: number;
};

export type Plan = "free" | "atelier";

export type Meta = {
  onboarded: boolean;
  identity: string;
  ageBand: AgeBand;
  cohort: Mode;
  birthDate: string;
  lastSyncDate: string;
  plan: Plan;
  streak: number;
  lastWear: string;
  lastWornIds: number[];
  wears: number;
  grillDate: string;
  grillCount: number;
  practiceDay: number;
  wornLog: { iso: string; vibe: string }[];
  gender: Gender | "";
};

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "dresses", label: "Dresses" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "outerwear", label: "Outerwear" },
];

export const HOUSES: { id: House | "all"; label: string }[] = [
  { id: "all", label: "All lines" },
  { id: "high", label: "High street" },
  { id: "premium", label: "Premium" },
  { id: "indian", label: "Indian" },
  { id: "sport", label: "Sport" },
];

export const MOODS = [
  { id: "confident", label: "Confident" },
  { id: "chill", label: "Chill" },
  { id: "happy", label: "Happy" },
  { id: "bold", label: "Bold" },
  { id: "soft", label: "Soft" },
  { id: "romantic", label: "Romantic" },
  { id: "mysterious", label: "Mysterious" },
  { id: "energetic", label: "Energetic" },
  { id: "lazy", label: "Lazy" },
  { id: "elegant", label: "Elegant" },
  { id: "playful", label: "Playful" },
  { id: "dreamy", label: "Dreamy" },
] as const;

export const OCCASIONS = [
  { id: "school", label: "School" },
  { id: "college", label: "College" },
  { id: "casual", label: "Casual" },
  { id: "play", label: "Play" },
  { id: "family", label: "Family" },
  { id: "party", label: "Party" },
  { id: "date", label: "Date" },
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "gym", label: "Gym" },
  { id: "shopping", label: "Shopping" },
  { id: "wedding", label: "Wedding" },
  { id: "brunch", label: "Brunch" },
  { id: "night", label: "Night out" },
  { id: "travel", label: "Travel" },
  { id: "festival", label: "Festival" },
] as const;

const ALPHA_OCC = ["school", "casual", "play", "family", "home", "gym", "travel"];
const TEEN_OCC = ["school", "casual", "family", "home", "brunch", "gym", "travel", "festival"];
const Z_OCC = OCCASIONS.map((o) => o.id).filter((id) => id !== "play" && id !== "school");
const ADULT_OCC = OCCASIONS.map((o) => o.id).filter((id) => id !== "play" && id !== "school");

export function occasionsFor(gen: Generation) {
  const ids =
    gen === "alpha" ? ALPHA_OCC : gen === "teen" ? TEEN_OCC : gen === "z" || gen === "zlate" ? Z_OCC : ADULT_OCC;
  return OCCASIONS.filter((o) => ids.includes(o.id));
}

export function moodsFor(gen: Generation) {
  if (gen === "alpha") {
    return MOODS.filter((m) => ["happy", "chill", "energetic", "playful", "soft", "confident"].includes(m.id));
  }
  if (gen === "teen") {
    return MOODS.filter((m) =>
      ["confident", "chill", "happy", "energetic", "playful", "soft", "bold"].includes(m.id),
    );
  }
  return [...MOODS];
}

export const CITIES = [
  "Pune",
  "Mumbai",
  "Bangalore",
  "Delhi",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Jaipur",
  "Ahmedabad",
  "Surat",
];

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

import { addDaysIST, dateKeyInZone } from "./clock.ts";

export function localDateKey(d = new Date()) {
  return dateKeyInZone(d);
}

export function todayKey(now = new Date()) {
  return dateKeyInZone(now);
}

export function yesterdayKey(now = new Date()) {
  return dateKeyInZone(addDaysIST(now, -1));
}
