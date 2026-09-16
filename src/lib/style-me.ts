import { createServerFn } from "@tanstack/react-start";
import { gateGrillLook } from "./outfit.ts";
import { GRILL_PER_HOUR, HOUR_MS, takeToken } from "./server-surface.ts";
import type { Category, Cloth, Generation } from "./types.ts";

export type LookResult =
  | {
      ok: true;
      ids: number[];
      items: string[];
      vibe: string;
      roast: string;
      keep?: string;
      cut?: string;
      why: string[];
      source: "grill" | "fallback";
    }
  | { ok: false; error: string };

const CATS: Category[] = ["tops", "bottoms", "dresses", "shoes", "accessories", "outerwear"];

function clothesFromWardrobe(wardrobe: string): Cloth[] {
  return wardrobe.split("\n").flatMap((line) => {
    const [idRaw, cat, name, color, brand] = line.split("|").map((s) => s.trim());
    const id = Number(idRaw);
    if (!id || !name || !CATS.includes(cat as Category)) return [];
    return [{ id, cat: cat as Category, name, color: color || "", brand: brand || undefined, photo: null }];
  });
}

function themeFromWeather(weather: string) {
  const w = weather.toLowerCase();
  if (w.includes("rain")) return "rainy";
  if (w.includes("cold") || w.includes("snow")) return "cold";
  return "";
}

export const grillOutfit = createServerFn({ method: "POST" })
  .validator(
    (input: {
      wardrobe: string;
      weather: string;
      city: string;
      mood: string;
      occ: string;
      force: string;
      tone: string;
      calendar: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<LookResult> => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    if (!takeToken("grill", GRILL_PER_HOUR, HOUR_MS)) {
      return { ok: false, error: "The desk is busy. Sit again in a little while." };
    }
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI is not available in this environment." };
    }

    const forceNote = data.force
      ? `\nYou MUST include these pinned ids: ${data.force}`
      : "";

    const voices: Record<string, string> = {
      alpha:
        "You style a 10–13 year old. School or play. Never heels, never evening, never a club. Name the clothes for the day. Do not invent a generation costume.",
      teen:
        "You style a 14–17 year old. School, home, family. No club, no stilettos. Name the clothes for the day they named. Do not invent a generation costume.",
    };
    const voice =
      voices[data.tone] ??
      "You style an adult. Honour who we dress: the rail is already filtered. Do not invent pieces. Do not title Brand × Brand. Name the situation of tonight.";

    const prompt = `${voice} Build ONE wearable outfit, not a random grab bag.

Wardrobe (id | name | brand | category | colour):
${data.wardrobe}
${forceNote}

Context: ${data.weather} in ${data.city}. Mood: ${data.mood}. Occasion: ${data.occ}.
Live calendar: ${data.calendar}

Honour the calendar: season and this week's colour story. Do not name a festival. Do not force a winter coat in Indian summer. Do not put suede in monsoon.

The occasion is law, not a caption:
- Gym / play: training kit only — tee or hoodie, track or shorts, trainers. Never leather, down, sunglasses, a knit polo, or loafers.
- Work: shirt or knit + trousers + a closed shoe. Never track pants or a hoodie as the look.
- Wedding: dress or shirt and trouser, a proper shoe. Never a hoodie, never trainers as the only idea.
- Date / night / party: finished, not kit.
- Home: soft. Not a blazer.
- Travel / shopping / college: a shoe you can walk in.
- Festival: colour; Indian wear welcome; a suit is not the point.

Outfit architecture (strict):
- Dress OR (one top + one bottom). Never both a dress and a top.
- Exactly one pair of shoes.
- At most one accessory. At most one outerwear (only if weather needs it).
- 3 to 5 pieces total.
- Use ONLY ids from the wardrobe.

JSON only:
{"ids":[101,202],"vibe":"the occasion in 1-3 words, never Brand × Brand","keep":"one sentence that holds","cut":"one sentence to change next time","why":["keep","cut"]}`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 280,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(14000),
      });

      if (!res.ok) {
        return { ok: false, error: `Stylist is busy (${res.status}). Try again.` };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      let text = body.choices?.[0]?.message?.content ?? "";
      text = text.replace(/```json|```/gi, "").trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { ok: false, error: "Could not parse the look. Try again." };
      const parsed = JSON.parse(match[0]) as {
        ids?: number[];
        items?: string[];
        vibe?: string;
        roast?: string;
        keep?: string;
        cut?: string;
        description?: string;
        why?: string[];
      };
      const ids = (parsed.ids ?? []).map((n) => Number(n)).filter((n) => n > 0);
      if (!ids.length && !parsed.items?.length) {
        return { ok: false, error: "Empty look. Try again." };
      }
      const rail = clothesFromWardrobe(data.wardrobe);
      const pinned = data.force
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n > 0);
      const gen = data.tone as Generation;
      const gated = gateGrillLook(ids, rail, data.occ, gen, themeFromWeather(data.weather), pinned);
      if (!gated.pieces.length) {
        return { ok: false, error: "Could not plate a look that holds." };
      }
      const keep = gated.source === "grill" ? (parsed.keep ?? "").trim() : gated.look.why[0] ?? "";
      const cut = gated.source === "grill" ? (parsed.cut ?? "").trim() : gated.look.why[1] ?? "";
      const why = [
        ...(gated.source === "grill" ? (parsed.why ?? []).filter(Boolean) : gated.look.why),
      ];
      if (keep && !why.includes(keep)) why.unshift(keep);
      if (cut && why.length < 3) why.push(cut);
      const roast =
        gated.source === "grill"
          ? keep && cut
            ? `${keep} ${cut}`
            : parsed.roast || parsed.description || keep || gated.look.desc
          : gated.look.desc;
      return {
        ok: true,
        ids: gated.pieces.map((p) => p.id),
        items: parsed.items ?? [],
        vibe: gated.source === "grill" ? parsed.vibe ?? gated.look.vibe : gated.look.vibe,
        roast,
        keep,
        cut,
        why: why.slice(0, 3),
        source: gated.source,
      };
    } catch {
      return { ok: false, error: "Could not reach the stylist. Try again." };
    }
  });
