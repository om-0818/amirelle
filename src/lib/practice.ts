import type { Generation } from "./types";
import { isMinor } from "./generations.ts";

const MINOR = [
  { id: "school", label: "I dress for school", line: "Whatever the day asks." },
  { id: "sport", label: "I like to move", line: "Comfort that still looks finished." },
  { id: "colour", label: "I like colour", line: "Bright is allowed." },
];

const ANY = [
  { id: "day", label: "I dress for the day", line: "The day decides. Not a costume." },
  { id: "colour", label: "I like colour", line: "Bright is allowed." },
  { id: "quiet", label: "I like it quiet", line: "Also allowed." },
  { id: "sharp", label: "I like a sharp edge", line: "Also allowed." },
  { id: "mix", label: "I mix", line: "Indian, sport, tailoring — same rail." },
];

export function identitiesFor(gen: Generation) {
  return isMinor(gen) ? MINOR : ANY;
}

export const PRACTICE = [
  {
    day: 1,
    title: "Name the day",
    body: "The look follows the day — school, work, a wedding, nothing. Not a generation script.",
    task: "Say what the day actually is before you dress.",
  },
  {
    day: 2,
    title: "Finish the silhouette",
    body: "Top or dress, bottom, shoes. A fourth piece only if it earns it.",
    task: "Wear a complete silhouette.",
  },
  {
    day: 3,
    title: "Colour, on purpose",
    body: "Clash or don't. Just don't leave it accidental.",
    task: "Name the colours you are wearing.",
  },
  {
    day: 4,
    title: "Shoes close it",
    body: "Most looks fail at the ankle.",
    task: "Choose shoes with the rest, not after.",
  },
  {
    day: 5,
    title: "One extra",
    body: "A bag or a watch or nothing. Your call.",
    task: "Cap extras at one.",
  },
  {
    day: 6,
    title: "The room, if there is one",
    body: "Some days have a dress code. Some don't.",
    task: "Name the room — or name that there isn't one.",
  },
  {
    day: 7,
    title: "Walk in",
    body: "You already own the clothes.",
    task: "Wear today's look without checking the mirror twice.",
  },
] as const;

export const ESSAYS = [
  {
    slug: "votes",
    title: "Every outfit is a vote",
    dek: "The look is proof. Not a costume of your age.",
    body: `You do not become “someone with taste” by buying a better jacket. You become that person by finishing the silhouette — or by leaving it unfinished on purpose. Age is a size and a legal line. It is not a moodboard.`,
  },
  {
    slug: "age",
    title: "Age filters fit. It does not write the look.",
    dek: "A 34-year-old may wear Dunks. A 22-year-old may wear a blazer.",
    body: `Amirelle keeps modest pieces off a 12-year-old's rail. That is safety, not style.

Past 18, the catalog is one rail. Season and weather still move. Generation slogans — quiet luxury, modern uniform, heritage — do not. Wear what you wear.`,
  },
  {
    slug: "india",
    title: "India is on the rail, not a costume change",
    dek: "Zara and a kurta can share a week. Nobody has to pick a house.",
    body: `Imported closet apps assume navy, white, and one blazer. A Pune closet that can afford Zara often also owns Fabindia. Both sit on the same rail. Festive weeks raise Indian cloth. They do not require it.`,
  },
] as const;
