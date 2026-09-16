import { isoWeekFromYmd, ymdInZone } from "./clock.ts";
import { localDateKey, type Cloth, type Generation } from "./types.ts";
import { generationById } from "./generations.ts";

export type Season = "winter" | "summer" | "monsoon" | "festive";

export type FashionPulse = {
  dateKey: string;
  year: number;
  month: number;
  week: number;
  season: Season;
  seasonLabel: string;
  festival: string | null;
  colors: string[];
  colorNote: string;
  silhouette: string;
  avoid: string;
  occHint: string;
  prompt: string;
};

const WEEK_STORIES = [
  { colors: ["navy", "cream", "camel"], note: "quiet neutrals" },
  { colors: ["black", "white", "gold"], note: "graphic contrast" },
  { colors: ["olive", "beige", "brown"], note: "earth" },
  { colors: ["navy", "white", "blue"], note: "navy and white" },
  { colors: ["black", "grey", "charcoal"], note: "monochrome" },
  { colors: ["emerald", "ivory", "gold"], note: "jewel" },
  { colors: ["pink", "cream", "tan"], note: "soft warm" },
  { colors: ["white", "beige", "sand"], note: "linen light" },
];

function seasonOf(month: number): { id: Season; label: string } {
  if (month === 10 || month === 11) return { id: "festive", label: "Cooler evenings" };
  if (month === 12 || month === 1 || month === 2) return { id: "winter", label: "North Indian winter" };
  if (month === 3 || month === 4 || month === 5) return { id: "summer", label: "Indian summer" };
  return { id: "monsoon", label: "Monsoon" };
}

const SEASON_NOTE: Record<Season, string> = {
  winter: "Closed shoes and a layer if it's actually cold. That's the weather, not a lookbook.",
  summer: "Light cloth if it's hot. Heavy wool as the whole look will feel wrong in 38°C.",
  monsoon: "Closed shoes. Suede and pale leather stain in sheet rain — skip them if it's wet.",
  festive: "A layer for the evening if you want one. Nothing is required.",
};

const SEASON_AVOID: Record<Season, string> = {
  winter: "Open sandals as the only shoe if it's actually cold.",
  summer: "A wool coat as the whole look in 38°C.",
  monsoon: "Suede and pale leather in sheet rain.",
  festive: "Nothing is banned.",
};

const SEASON_OCC: Record<Season, string> = {
  winter: "casual",
  summer: "casual",
  monsoon: "casual",
  festive: "family",
};

export const COLOR_HEX: Record<string, string> = {
  navy: "#1c2e4a",
  cream: "#f3ead9",
  camel: "#c4a574",
  black: "#161412",
  white: "#f4efe7",
  gold: "#c9a227",
  olive: "#5c6248",
  beige: "#d9cbb8",
  brown: "#6b3f2a",
  blue: "#3d5a80",
  grey: "#7a756e",
  gray: "#7a756e",
  charcoal: "#3a3835",
  emerald: "#1f6b4a",
  ivory: "#f3ead9",
  pink: "#d4a0a8",
  tan: "#c4a882",
  sand: "#d8cbb5",
  burgundy: "#6e2436",
  khaki: "#9a8f6a",
};

export function colorHex(color: string) {
  return COLOR_HEX[color.toLowerCase()] ?? color;
}

export function fashionPulse(gen: Generation, now = new Date()): FashionPulse {
  const on = ymdInZone(now);
  const season = seasonOf(on.m);
  const week = isoWeekFromYmd(on);
  const story = WEEK_STORIES[week % WEEK_STORIES.length];
  const festival = null;
  const g = generationById(gen);
  const silhouette = SEASON_NOTE[season.id];
  const avoid = SEASON_AVOID[season.id];
  const occHint = SEASON_OCC[season.id];
  const dateKey = localDateKey(now);

  return {
    dateKey,
    year: on.y,
    month: on.m,
    week,
    season: season.id,
    seasonLabel: season.label,
    festival,
    colors: story.colors,
    colorNote: story.note,
    silhouette,
    avoid,
    occHint,
    prompt: `${dateKey}. Member is ${g.years}. India, ${season.label}. Week ${week} colours in the air: ${story.colors.join(", ")} (${story.note}). Weather note: ${silhouette} Dress the day they named. Do not invent a generation costume.`,
  };
}

export function pieceScore(c: Cloth, pulse: FashionPulse): number {
  let n = 0;
  const color = (c.color ?? "").toLowerCase();
  if (pulse.colors.some((x) => color.includes(x))) n += 3;
  if (pulse.season === "festive" && c.house === "indian") n += 4;
  if (pulse.season === "winter" && (c.cat === "outerwear" || color.includes("camel") || color.includes("navy"))) n += 2;
  if (pulse.season === "summer" && (color.includes("white") || color.includes("beige") || color.includes("yellow") || color.includes("sand"))) n += 2;
  if (pulse.season === "monsoon" && (c.cat === "outerwear" || color.includes("black") || color.includes("navy") || color.includes("olive"))) n += 2;
  if (pulse.season === "monsoon" && (c.name.toLowerCase().includes("suede") || c.name.toLowerCase().includes("sandal"))) n -= 4;
  return n;
}

export function sortBySeason(clothes: Cloth[], pulse: FashionPulse) {
  return [...clothes].sort((a, b) => pieceScore(b, pulse) - pieceScore(a, pulse));
}
