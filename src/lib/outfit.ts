import { fashionPulse, pieceScore } from "./fashion-clock.ts";
import { EMPTY_TASTE, catSoured, tasteScore, type Taste } from "./habit.ts";
import { OCCASIONS, occasionsFor, type Category, type Cloth, type Generation, type House } from "./types.ts";
import { SAMPLE_CLOSET, forCohort } from "./catalog.ts";
import { GENERATIONS } from "./generations.ts";
import { provenanceLine } from "./provenance.ts";

const WARM = ["camel", "tan", "brown", "beige", "cream", "yellow", "red", "pink", "nude", "gold", "ivory", "sand", "khaki", "orange", "emerald"];
const COOL = ["navy", "blue", "grey", "gray", "olive", "charcoal", "silver", "emerald"];
const NEUTRAL = ["black", "white", "grey", "gray", "cream", "ivory", "beige", "taupe", "charcoal"];

function colorFamily(color: string): "warm" | "cool" | "neutral" {
  const c = color.toLowerCase();
  if (NEUTRAL.some((n) => c.includes(n))) return "neutral";
  if (WARM.some((n) => c.includes(n))) return "warm";
  if (COOL.some((n) => c.includes(n))) return "cool";
  return "neutral";
}

const RANK: Record<Category, number> = {
  accessories: 0,
  outerwear: 1,
  dresses: 2,
  tops: 2,
  bottoms: 3,
  shoes: 4,
};

export function orderedPieces(pieces: Cloth[]) {
  return [...pieces].sort((a, b) => RANK[a.cat] - RANK[b.cat]);
}

export function lookCredits(pieces: Cloth[]) {
  return orderedPieces(pieces).map((p) => ({
    brand: p.brand ?? p.cat,
    name: p.name,
    cat: p.cat,
    color: p.color,
    price: p.price,
    cloth: p,
    source: provenanceLine(p),
  }));
}

export function creditsText(vibe: string, pieces: Cloth[]) {
  const lines = lookCredits(pieces)
    .filter((c) => c.source)
    .map((c) => `${c.brand} — ${c.name} · ${c.source}`);
  return [vibe, "", ...lines].filter(Boolean).join("\n");
}

function harmony(a: Cloth, b: Cloth) {
  const fa = colorFamily(a.color);
  const fb = colorFamily(b.color);
  if (fa === "neutral" || fb === "neutral") return 2;
  if (fa === fb) return 3;
  return 0;
}

function clothBlob(c: Cloth) {
  return `${c.name} ${c.brand ?? ""} ${c.house ?? ""}`.toLowerCase();
}

type Kit = {
  brief: string;
  want: RegExp;
  veto: RegExp;
  house?: House;
  dress: boolean;
  outer: "weather" | "sport" | "never" | "tailored";
  acc: "ok" | "sport" | "never" | "bag";
};

const KIT_TRAIN =
  /hoodie|sweatshirt|cotton tee|oversized tee|ribbed tank|henley|track trousers|drawstring|bermuda|trainer|runner sneaker|court sneaker|hiking sneaker|fleece|windbreaker|\bcap\b|belt bag/;

const KIT_WORK =
  /poplin|oxford|merino|cashmere|blouse|turtleneck|cardigan|\bshirt\b|crew|trouser|chino|loafer|derby|oxford shoe|brogue|monk|chelsea|ankle boot|blazer|wool/;

const WORK_VETO =
  /hoodie|sweatshirt|track|ribbed tank|bermuda|\bshorts\b|trainer|sneaker|runner|hiking|\bcap\b|sunglass|\btee\b|slide|sandal|espadrille|drawstring|fleece|windbreaker/;

const KIT_WEDDING =
  /dress|poplin|oxford|trouser|loafer|heel|sherwani|kurta|kameez|nehru|blazer|silk|satin|pump|derby|brogue/;

const WEDDING_VETO =
  /hoodie|sweatshirt|track|\btee\b|trainer|sneaker|runner|\bcap\b|bermuda|\bshorts\b|fleece|windbreaker|drawstring|ribbed tank/;

/** Heels, club, going-out. Minors never wear these, on any day. */
const ADULT_ONLY = /heel|pump|stiletto|kitten|slip dress|halter|bodycon|\bclub\b/;

export function occAllowed(gen: Generation, occ: string) {
  return occasionsFor(gen).some((o) => o.id === occ);
}

/** Gym/play: street, denim, leather, polo, sunnies, heels, blazer stay on the rail. */
const GYM_VETO =
  /polo|blazer|leather|denim|\bjean|\bjeans\b|sunglass|heel|pump|stiletto|loafer|derby|brogue|monk|chino|poplin|oxford|silk|cashmere|merino|blouse|trench|overcoat|peacoat|down jacket|quilted|sandal|dress|cuff|earring|necklace|scarf|tote|column trousers|pleated trousers|tailored trousers|wool trousers|satin|slip|kitten|mule|slingback|shirt dress/;

export const OCCASION_KIT: Record<string, Kit> = {
  gym: {
    brief: "Training kit — tee or hoodie, track or shorts, trainers. Leave the leather on the rail.",
    want: KIT_TRAIN,
    veto: GYM_VETO,
    house: "sport",
    dress: false,
    outer: "sport",
    acc: "sport",
  },
  play: {
    brief: "Move in it. Tee, shorts or track, trainers. Not a party.",
    want: KIT_TRAIN,
    veto: GYM_VETO,
    house: "sport",
    dress: false,
    outer: "sport",
    acc: "sport",
  },
  work: {
    brief: "A shirt or knit, trousers, a closed shoe. The room can see you coming.",
    want: KIT_WORK,
    veto: WORK_VETO,
    dress: false,
    outer: "tailored",
    acc: "ok",
  },
  wedding: {
    brief: "Dress or a shirt and trouser, a proper shoe. Not trainers. Not a hoodie.",
    want: KIT_WEDDING,
    veto: WEDDING_VETO,
    house: "indian",
    dress: true,
    outer: "tailored",
    acc: "ok",
  },
  date: {
    brief: "Finished, not kit. A real top, a real shoe.",
    want: /shirt|knit|polo|dress|trouser|jean|loafer|heel|leather jacket|silk|blouse/,
    veto: /track trousers|hoodie|sweatshirt|ribbed tank|\bcap\b|bermuda|trainer/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
  night: {
    brief: "Evening, not the gym. Darker, closed, a shoe that can walk into a room.",
    want: /shirt|silk|leather jacket|dress|trouser|heel|loafer|boot/,
    veto: /track trousers|hoodie|sweatshirt|ribbed tank|\bcap\b|bermuda|cotton tee/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
  party: {
    brief: "A party, not a workout. Colour is allowed. Track pants are not.",
    want: /shirt|dress|silk|polo|jean|heel|loafer|boot|leather jacket/,
    veto: /track trousers|hoodie|sweatshirt|ribbed tank|\bcap\b/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
  brunch: {
    brief: "Daylight and a table. Polo or linen, a loafer or a clean sneaker — not kit.",
    want: /polo|linen|shirt|dress|chino|loafer|court sneaker|jean/,
    veto: /track trousers|hoodie|ribbed tank|down jacket|\bcap\b/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
  college: {
    brief: "Jeans, a tee or hoodie, sneakers. Not a suit. Not a lehenga.",
    want: /tee|hoodie|sweatshirt|jean|sneaker|trainer|oversize|henley/,
    veto: /suit jacket|sherwani|heel|pump|silk dress|column trousers/,
    dress: false,
    outer: "weather",
    acc: "bag",
  },
  school: {
    brief: "School clothes. Modest, complete, sneakers. No heels. No evening.",
    want: /tee|hoodie|shirt|jean|chino|sneaker|trainer|sweatshirt/,
    veto: /heel|pump|slip dress|leather jacket|sunglass|sherwani/,
    dress: false,
    outer: "weather",
    acc: "bag",
  },
  family: {
    brief: "Finished enough for the room. Not clubwear. Not gym kit.",
    want: /shirt|knit|polo|jean|chino|trouser|loafer|sneaker|dress/,
    veto: /track trousers|ribbed tank|bermuda|sunglass|heel/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
  home: {
    brief: "Soft and on purpose. Knit, drawstring, a slide. Leave the blazer.",
    want: /hoodie|sweatshirt|drawstring|tee|knit|slide|slip-on|henley/,
    veto: /heel|blazer|suit|sunglass|trench|loafer|derby/,
    dress: false,
    outer: "never",
    acc: "never",
  },
  shopping: {
    brief: "You will walk. Sneakers, jeans or chinos, a bag that holds something.",
    want: /tee|shirt|jean|chino|sneaker|trainer|tote|crossbody|hoodie/,
    veto: /heel|pump|track trousers|sherwani|column trousers/,
    dress: true,
    outer: "weather",
    acc: "bag",
  },
  travel: {
    brief: "Layers and a shoe that survives the airport. Hoodie allowed. Heels are not.",
    want: /hoodie|tee|chino|jean|sneaker|trainer|tote|oversize|sweatshirt/,
    veto: /heel|pump|sherwani|silk dress|column trousers/,
    dress: false,
    outer: "weather",
    acc: "bag",
  },
  festival: {
    brief: "Colour and a shoe you can stand in. Indian wear is welcome. A suit is not the point.",
    want: /kurta|kameez|dress|linen|sandal|espadrille|cotton|skirt|scarf/,
    veto: /suit jacket|track trousers|hoodie|trainer/,
    house: "indian",
    dress: true,
    outer: "never",
    acc: "ok",
  },
  casual: {
    brief: "Easy and finished. Not a costume, not training kit.",
    want: /tee|jean|chino|sneaker|hoodie|shirt|loafer|polo|knit/,
    veto: /sherwani|track trousers|ribbed tank|pump|suit jacket/,
    dress: true,
    outer: "weather",
    acc: "ok",
  },
};

function kitFor(occ: string): Kit {
  return OCCASION_KIT[occ] ?? OCCASION_KIT.casual;
}

const INDEX_CATS: Category[] = ["tops", "bottoms", "dresses", "shoes", "accessories", "outerwear"];
const HOUSE_CAT = new Map<string, Cloth[]>();
const HOUSE_WANT = new Map<string, Cloth[]>();

function catKey(gen: Generation, cat: Category) {
  return `${gen}|${cat}`;
}
function wantKey(gen: Generation, cat: Category, occ: string) {
  return `${gen}|${cat}|${occ}`;
}

function ensureHouseIndex() {
  if (HOUSE_WANT.size) return;
  for (const gen of GENERATIONS.map((g) => g.id)) {
    const rail = forCohort(SAMPLE_CLOSET, gen);
    for (const c of rail) {
      const k = catKey(gen, c.cat);
      const list = HOUSE_CAT.get(k);
      if (list) list.push(c);
      else HOUSE_CAT.set(k, [c]);
    }
    for (const occ of Object.keys(OCCASION_KIT)) {
      const kit = OCCASION_KIT[occ];
      for (const cat of INDEX_CATS) {
        const src = HOUSE_CAT.get(catKey(gen, cat)) ?? [];
        HOUSE_WANT.set(
          wantKey(gen, cat, occ),
          src.filter((c) => {
            const b = clothBlob(c);
            if (kit.veto.test(b)) return false;
            return kit.want.test(b) || (kit.house && c.house === kit.house);
          }),
        );
      }
    }
  }
}

/** Want-positive ids for a gen/cat/occ, intersected with the live rail. */
export function indexedWant(gen: Generation, cat: Category, occ: string, allowed: Set<number>): Cloth[] {
  ensureHouseIndex();
  return (HOUSE_WANT.get(wantKey(gen, cat, occ)) ?? []).filter((c) => allowed.has(c.id));
}

export function scanWant(clothes: Cloth[], cat: Category, occ: string): Cloth[] {
  return clothes.filter((c) => c.cat === cat && occasionScore(c, occ) > 0);
}

/** Kit the body can actually wear. Negative = veto. */
export function occasionScore(c: Cloth, occ: string): number {
  const kit = kitFor(occ);
  const b = clothBlob(c);
  if (kit.veto.test(b)) return -80;
  let n = 0;
  if (kit.want.test(b)) n += 35;
  if (kit.house && c.house === kit.house) n += 18;
  if (n === 0) return kit.want === KIT_TRAIN ? -15 : 0;
  return n;
}

function outerAllowed(c: Cloth, kit: Kit, occ: string) {
  const b = clothBlob(c);
  if (kit.outer === "never") return false;
  if (kit.outer === "sport") return /fleece|windbreaker|hoodie/.test(b);
  if (kit.outer === "tailored") return /blazer|trench|raincoat|overcoat|unstructured|wool/.test(b);
  return occasionScore(c, occ) >= 0;
}

function accAllowed(c: Cloth, kit: Kit) {
  const b = clothBlob(c);
  if (kit.acc === "never") return false;
  if (kit.acc === "sport") return /\bcap\b|belt bag/.test(b);
  if (kit.acc === "bag") return /tote|crossbody|shoulder bag|belt bag/.test(b);
  return true;
}

const FESTIVAL_NAME =
  /diwali|holi|ganesh|ganesha|eid|navratri|dussehra|onam|pongal|christmas|akshaya|rakhi|karva/i;

export function keepCut(pieces: Cloth[], occ: string, pool: Cloth[] = []) {
  const plated = new Set(pieces.map((p) => p.id));
  const star = [...pieces].sort((a, b) => occasionScore(b, occ) - occasionScore(a, occ))[0];
  const keep = star ? `${star.brand ?? "This"} ${star.name} is why it holds.` : kitFor(occ).brief;
  const spoil = [...pool]
    .filter((c) => !plated.has(c.id) && occasionScore(c, occ) < 0)
    .sort((a, b) => occasionScore(a, occ) - occasionScore(b, occ))[0];
  const cut = spoil
    ? `${spoil.brand ?? "That"} ${spoil.name} would break it.`
    : kitFor(occ).brief;
  const clean = (s: string) =>
    s.replace(/×/g, " ").replace(FESTIVAL_NAME, "").replace(/\s{2,}/g, " ").trim();
  return {
    keep: clean(keep),
    cut: clean(cut),
    keepId: star?.id ?? null,
    cutId: spoil?.id ?? null,
  };
}

export function stylistNote(
  pieces: Cloth[],
  seasonLabel: string,
  avoid: string,
  occLabel: string,
  occ = "",
) {
  const ordered = orderedPieces(pieces);
  const shoe = ordered.find((p) => p.cat === "shoes");
  const brands = [...new Set(ordered.map((p) => p.brand).filter(Boolean))] as string[];
  const kit = kitFor(occ);
  const parts: string[] = [];
  parts.push(`${occLabel} is the brief.`);
  parts.push(kit.brief);
  if (shoe) {
    parts.push(`${shoe.brand ?? "The shoe"} ${shoe.name.toLowerCase()} closes it.`);
  } else if (brands[0]) {
    parts.push(`${brands.slice(0, 3).join(", ")} share the body.`);
  }
  if (avoid && occ !== "gym" && occ !== "play") parts.push(avoid);
  return parts.slice(0, 3);
}

export function vibeFrom(_pieces: Cloth[], occ: string) {
  return OCCASIONS.find((o) => o.id === occ)?.label ?? "Today";
}

export type FitIssue = {
  code: "body" | "shoes" | "veto" | "kit" | "layer" | "dup" | "weather" | "age";
  detail: string;
};

export type FitReport = {
  ok: boolean;
  issues: FitIssue[];
};

function wetTheme(gen: Generation, theme: string) {
  if (theme === "rainy" || theme === "cold") return true;
  const season = fashionPulse(gen).season;
  return season === "monsoon" || season === "winter";
}

function pieceLegal(c: Cloth, occ: string, gen: Generation, wet: boolean) {
  if (occasionScore(c, occ) < 0) return false;
  if ((gen === "alpha" || gen === "teen") && ADULT_ONLY.test(clothBlob(c))) return false;
  if (wet && /suede/.test(clothBlob(c))) return false;
  return true;
}

/** Drop extras and vetoes so a look can be worn. */
export function stripLook(
  pieces: Cloth[],
  occ: string,
  pinned: number[] = [],
  gen: Generation = "z",
  theme = "",
): Cloth[] {
  const kit = kitFor(occ);
  const pin = new Set(pinned);
  const wet = wetTheme(gen, theme);
  const best = new Map<Category, Cloth>();
  const ranked = [...pieces].sort((a, b) => {
    const pa = pin.has(a.id) ? 1000 : 0;
    const pb = pin.has(b.id) ? 1000 : 0;
    return pb + occasionScore(b, occ) - (pa + occasionScore(a, occ));
  });
  for (const p of ranked) {
    if (!pieceLegal(p, occ, gen, wet)) continue;
    if (p.cat === "outerwear" && !outerAllowed(p, kit, occ)) continue;
    if (p.cat === "accessories" && !accAllowed(p, kit)) continue;
    if (p.cat === "dresses" && !kit.dress) continue;
    if (!best.has(p.cat)) best.set(p.cat, p);
  }
  let out = [...best.values()];
  if (best.has("dresses")) {
    out = out.filter((p) => p.cat !== "tops" && p.cat !== "bottoms");
  }
  return orderedPieces(out);
}

export function validateLook(
  pieces: Cloth[],
  occ: string,
  gen: Generation = "z",
  theme = "",
): FitReport {
  const issues: FitIssue[] = [];
  if (!occAllowed(gen, occ)) {
    issues.push({ code: "age", detail: "This day is not for this age" });
  }
  const kit = kitFor(occ);
  const n = (cat: Category) => pieces.filter((p) => p.cat === cat).length;
  const dresses = n("dresses");
  const tops = n("tops");
  const bottoms = n("bottoms");
  const shoes = n("shoes");
  const outer = n("outerwear");
  const acc = n("accessories");

  if (dresses && tops) issues.push({ code: "body", detail: "Dress and a top on the same body" });
  if (dresses && bottoms) issues.push({ code: "body", detail: "A dress does not take a separate bottom" });
  if (!dresses && !(tops && bottoms)) {
    issues.push({ code: "body", detail: "Need a dress, or a top and a bottom" });
  }
  if (shoes !== 1) issues.push({ code: "shoes", detail: shoes === 0 ? "No shoes" : "More than one shoe" });
  if (tops > 1) issues.push({ code: "dup", detail: "Two tops" });
  if (bottoms > 1) issues.push({ code: "dup", detail: "Two bottoms" });
  if (outer > 1) issues.push({ code: "layer", detail: "More than one outer layer" });
  if (acc > 1) issues.push({ code: "layer", detail: "More than one accessory" });
  if (!kit.dress && dresses) issues.push({ code: "body", detail: "A dress is wrong for this day" });
  if (kit.outer === "never" && outer) issues.push({ code: "layer", detail: "No coat for this day" });
  if (kit.acc === "never" && acc) issues.push({ code: "layer", detail: "No extra for this day" });

  for (const p of pieces) {
    if (occasionScore(p, occ) < 0) issues.push({ code: "veto", detail: `${p.brand ?? ""} ${p.name}`.trim() });
  }
  if (pieces.length && !pieces.some((p) => occasionScore(p, occ) > 0)) {
    issues.push({ code: "kit", detail: "Nothing on the look is kit for this day" });
  }

  if (gen === "alpha" || gen === "teen") {
    for (const p of pieces) {
      if (ADULT_ONLY.test(clothBlob(p))) {
        issues.push({ code: "age", detail: p.name });
      }
    }
  }

  const pulse = fashionPulse(gen);
  if (theme === "rainy" || theme === "cold" || pulse.season === "monsoon" || pulse.season === "winter") {
    for (const p of pieces) {
      if (/suede/.test(clothBlob(p))) issues.push({ code: "weather", detail: p.name });
    }
  }

  return { ok: issues.length === 0, issues };
}

/** Pieces that may plate. Empty if the gate fails. */
export function gatedLook(
  pieces: Cloth[],
  occ: string,
  gen: Generation = "z",
  theme = "",
  pinned: number[] = [],
): Cloth[] {
  const cleaned = stripLook(pieces, occ, pinned, gen, theme);
  return validateLook(cleaned, occ, gen, theme).ok ? cleaned : [];
}

/** Grill ids must pass the same gate as Today. Else the nearest localLook. */
export function gateGrillLook(
  ids: number[],
  clothes: Cloth[],
  occ: string,
  gen: Generation = "z",
  theme = "",
  pinned: number[] = [],
): { pieces: Cloth[]; source: "grill" | "fallback"; look: LookDraft } {
  const byId = new Map(clothes.map((c) => [c.id, c]));
  const matched = ids.map((id) => byId.get(id)).filter((c): c is Cloth => Boolean(c));
  for (const id of pinned) {
    const f = byId.get(id);
    if (f && !matched.find((c) => c.id === f.id)) matched.unshift(f);
  }
  const cleaned = gatedLook(matched, occ, gen, theme, pinned);
  if (cleaned.length) {
    const fit = validateLook(cleaned, occ, gen, theme);
    const { keep, cut } = keepCut(cleaned, occ, clothes);
    return {
      pieces: cleaned,
      source: "grill",
      look: {
        pieces: cleaned,
        desc: `${vibeFrom(cleaned, occ)} is the brief. ${kitFor(occ).brief}`,
        why: [keep, cut],
        vibe: vibeFrom(cleaned, occ),
        fit,
      },
    };
  }
  const look = localLook(clothes, theme, pinned, gen, [], EMPTY_TASTE, occ);
  return { pieces: look.pieces, source: "fallback", look };
}

/** Dev invariant. Never plate a failing look in development. */
export function assertRenderableLook(
  pieces: Cloth[],
  occ: string,
  gen: Generation = "z",
  theme = "",
  dev = false,
): FitReport {
  const fit = validateLook(pieces, occ, gen, theme);
  if (pieces.length > 0 && !fit.ok && dev) {
    throw new Error(`Look rendered with fit.ok !== true: ${fit.issues.map((i) => i.detail).join("; ")}`);
  }
  return fit;
}

export type LookDraft = {
  pieces: Cloth[];
  desc: string;
  why: string[];
  vibe: string;
  fit: FitReport;
};

function draftLook(
  clothes: Cloth[],
  theme: string,
  pinned: number[],
  gen: Generation,
  exclude: number[],
  taste: Taste,
  occ: string,
): Cloth[] {
  const pulse = fashionPulse(gen);
  const kit = kitFor(occ);
  const wetDay = wetTheme(gen, theme);
  const excluded = new Set(exclude);
  const pin = new Set(pinned);
  const allowed = new Set(clothes.map((c) => c.id));
  const useHouse = clothes.length >= 200;
  if (useHouse) ensureHouseIndex();
  const rank = (c: Cloth) => pieceScore(c, pulse) + tasteScore(c, taste) + occasionScore(c, occ) * 3;
  const inPool = (c: Cloth) => pin.has(c.id) || !excluded.has(c.id);
  const by = (cat: Category) => {
    const src = useHouse ? (HOUSE_CAT.get(catKey(gen, cat)) ?? []) : clothes.filter((c) => c.cat === cat);
    return src.filter((c) => allowed.has(c.id) && inPool(c));
  };
  const strict = occ === "gym" || occ === "play" || occ === "work" || occ === "wedding";

  const pieces: Cloth[] = clothes.filter((c) => {
    if (!pinned.includes(c.id)) return false;
    if (!pieceLegal(c, occ, gen, wetDay)) return false;
    if (c.cat === "outerwear" && !outerAllowed(c, kit, occ)) return false;
    if (c.cat === "accessories" && !accAllowed(c, kit)) return false;
    if (c.cat === "dresses" && !kit.dress) return false;
    return true;
  });
  const has = (cat: Category) => pieces.some((p) => p.cat === cat);

  const take = (cat: Category, against?: Cloth) => {
    const want = useHouse
      ? (HOUSE_WANT.get(wantKey(gen, cat, occ)) ?? []).filter((c) => allowed.has(c.id) && inPool(c))
      : by(cat).filter((c) => occasionScore(c, occ) > 0);
    let arr = want.filter((c) => !pieces.find((p) => p.id === c.id) && pieceLegal(c, occ, gen, wetDay));
    if (!arr.length) {
      arr = by(cat).filter((c) => !pieces.find((p) => p.id === c.id) && pieceLegal(c, occ, gen, wetDay));
    }
    if (cat === "outerwear") arr = arr.filter((c) => outerAllowed(c, kit, occ));
    if (cat === "accessories") arr = arr.filter((c) => accAllowed(c, kit));
    const yes = arr.filter((c) => occasionScore(c, occ) > 0);
    const ok = arr.filter((c) => occasionScore(c, occ) >= 0);
    if (yes.length) arr = yes;
    else if (ok.length) arr = ok;
    else if (!strict) arr = arr.filter((c) => occasionScore(c, occ) > -40);
    else return;
    if (!arr.length) return;
    const scored = [...arr].sort((a, b) => {
      const ha = against ? harmony(against, a) : 0;
      const hb = against ? harmony(against, b) : 0;
      return hb + rank(b) - (ha + rank(a));
    });
    const top = scored.slice(0, Math.min(2, scored.length));
    pieces.push(top[Math.floor(Math.random() * top.length)]);
  };

  if (kit.dress && !has("dresses") && !has("tops") && (occ === "wedding" || occ === "date" || occ === "party") && !catSoured(taste, "dresses")) {
    take("dresses");
  }
  if (!has("dresses") && !has("tops")) take("tops");
  const lead = pieces[0];
  if (!has("dresses") && !has("bottoms")) take("bottoms", lead);
  if (!has("shoes")) take("shoes", lead);

  const wet =
    kit.outer !== "never" &&
    (theme === "rainy" || theme === "cold" || pulse.season === "monsoon" || pulse.season === "winter");
  if (wet && !has("outerwear") && !catSoured(taste, "outerwear")) take("outerwear", lead);
  if (kit.acc !== "never" && !has("accessories") && !catSoured(taste, "accessories")) take("accessories", lead);

  return stripLook(pieces, occ, pinned, gen, theme);
}

export function localLook(
  clothes: Cloth[],
  theme: string,
  pinned: number[],
  gen: Generation = "z",
  exclude: number[] = [],
  taste: Taste = EMPTY_TASTE,
  occ = "casual",
): LookDraft {
  if (!occAllowed(gen, occ)) {
    return {
      pieces: [],
      desc: "This day is not for this age.",
      why: ["This day is not for this age."],
      vibe: vibeFrom([], occ),
      fit: { ok: false, issues: [{ code: "age", detail: "This day is not for this age" }] },
    };
  }
  let skip = [...exclude];
  let pieces = draftLook(clothes, theme, pinned, gen, skip, taste, occ);
  let fit = validateLook(pieces, occ, gen, theme);

  for (let i = 0; i < 8 && !fit.ok; i++) {
    skip = [...skip, ...pieces.map((p) => p.id)];
    pieces = draftLook(clothes, theme, pinned, gen, skip, taste, occ);
    fit = validateLook(pieces, occ, gen, theme);
  }

  if (!fit.ok) pieces = [];

  const occLabel = vibeFrom(pieces, occ);
  const kit = kitFor(occ);
  const { keep, cut } = keepCut(pieces, occ, clothes);
  const why = fit.ok ? [keep, cut] : [keep, fit.issues[0]?.detail ?? cut];
  return {
    pieces,
    desc: `${occLabel} is the brief. ${kit.brief}`,
    why,
    vibe: occLabel,
    fit,
  };
}

export function railForPrompt(
  clothes: Cloth[],
  pinned: number[],
  gen: Generation,
  taste: Taste = EMPTY_TASTE,
  n = 90,
  occ = "casual",
) {
  const pulse = fashionPulse(gen);
  const rank = (c: Cloth) => pieceScore(c, pulse) + tasteScore(c, taste) + occasionScore(c, occ) * 3;
  const pinSet = new Set(pinned);
  const pinnedC = clothes.filter((c) => pinSet.has(c.id));
  const rest = clothes.filter((c) => !pinSet.has(c.id)).sort((a, b) => rank(b) - rank(a));
  return [...pinnedC, ...rest.slice(0, Math.max(0, n - pinnedC.length))];
}
