import { Loader2, RefreshCw, Save, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LookCredits, LookStack } from "@/components/look-stack";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP } from "@/lib/membership";
import { grillOutfit } from "@/lib/style-me";
import { grillWardrobe } from "@/lib/closet-local";
import { creditsText, gateGrillLook, localLook, railForPrompt } from "@/lib/outfit";
import { forYou } from "@/lib/sample-closet";
import { chrome } from "@/lib/copy";
import { fashionPulse } from "@/lib/fashion-clock";
import { CITIES, moodsFor, occasionsFor } from "@/lib/types";
import { useCloset } from "@/store/closet";

export function StyleBoard() {
  const allClothes = useCloset((s) => s.clothes);
  const ageBand = useCloset((s) => s.meta.ageBand);
  const gender = useCloset((s) => s.meta.gender);
  const plan = useCloset((s) => s.meta.plan);
  const labels = chrome();
  const clothes = forYou(allClothes, ageBand, gender);
  const pulse = fashionPulse(ageBand);
  const moodOpts = moodsFor(ageBand);
  const occOpts = occasionsFor(ageBand);
  const weather = useCloset((s) => s.weather);
  const mood = useCloset((s) => s.mood);
  const occ = useCloset((s) => s.occ);
  const city = useCloset((s) => s.city);
  const pinned = useCloset((s) => s.pinned);
  const lastPieces = useCloset((s) => s.lastPieces);
  const lastDesc = useCloset((s) => s.lastDesc);
  const lastVibe = useCloset((s) => s.lastVibe);
  const lastWhy = useCloset((s) => s.lastWhy);
  const lastVisual = useCloset((s) => s.lastVisual);
  const setLook = useCloset((s) => s.setLook);
  const saveLook = useCloset((s) => s.saveLook);
  const setMood = useCloset((s) => s.setMood);
  const setOcc = useCloset((s) => s.setOcc);
  const setCity = useCloset((s) => s.setCity);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(surprise = false) {
    if (!clothes.length) {
      toast("Add clothes first");
      return;
    }
    if (loading) return;

    let nextMood = mood;
    let nextOcc = occ;
    if (surprise) {
      nextMood = moodOpts[Math.floor(Math.random() * moodOpts.length)].id;
      nextOcc = occOpts[Math.floor(Math.random() * occOpts.length)].id;
      setMood(nextMood);
      setOcc(nextOcc);
    }

    const draft = localLook(
      clothes,
      weather.theme,
      pinned,
      ageBand,
      surprise ? lastPieces.map((p) => p.id) : [],
      useCloset.getState().taste,
      nextOcc,
    );
    setLook(draft.pieces, draft.desc, draft.vibe, draft.why);

    if (!useCloset.getState().spendSitting()) {
      toast("Today's sitting is used. This look is from the rail.");
      return;
    }
    setLoading(true);
    setError("");

    const forced = clothes.filter((c) => pinned.includes(c.id));
    const wardrobe = grillWardrobe(
      railForPrompt(clothes, pinned, ageBand, useCloset.getState().taste, 90, nextOcc),
    );

    const result = await grillOutfit({
      data: {
        wardrobe,
        weather:
          weather.label + (weather.tempC != null ? ` ${weather.tempC}C` : ""),
        city,
        mood: nextMood,
        occ: nextOcc,
        force: forced.map((c) => String(c.id)).join(", "),
        tone: ageBand,
        calendar: pulse.prompt,
      },
    });

    let pieces = draft.pieces;
    let roast = draft.desc;
    let vibe = draft.vibe;
    let why = draft.why;

    if (!result.ok) {
      setError(result.error);
    } else {
      const gated = gateGrillLook(result.ids, clothes, nextOcc, ageBand, weather.theme, pinned);
      if (gated.pieces.length && gated.look.fit.ok) {
        pieces = gated.pieces;
        if (gated.source === "grill") {
          roast = result.roast;
          vibe = result.vibe;
          why = result.why;
        } else {
          roast = gated.look.desc;
          vibe = gated.look.vibe;
          why = gated.look.why;
        }
      }
    }

    setLook(pieces, roast, vibe, why);
    setLoading(false);
  }

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
      <h2 className="font-display text-3xl italic">{labels.style}</h2>
      <p className="mt-1 text-sm text-muted">
        {pulse.dateKey} · {pulse.seasonLabel} · {pulse.colorNote}
      </p>

      <div className="mt-3 mb-4 grid gap-2 sm:grid-cols-3">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
          aria-label="City"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c} · {weather.label}
            </option>
          ))}
        </select>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
          aria-label="Mood"
        >
          {moodOpts.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={occ}
          onChange={(e) => setOcc(e.target.value)}
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
          aria-label="Occasion"
        >
          {occOpts.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button
          size="lg"
          className="flex-1 font-display text-lg italic"
          disabled={loading}
          onClick={() => void run(false)}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {labels.styleVerb}
        </Button>
        <Button
          size="lg"
          variant="ink"
          className="flex-1 font-display text-lg italic"
          disabled={loading}
          onClick={() => void run(true)}
        >
          {labels.surprise}
        </Button>
      </div>

      {lastDesc ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <LookStack
              pieces={lastPieces}
              visual={lastVisual}
            />
            {plan !== "atelier" && (
              <button
                type="button"
                className="mt-2 text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                onClick={() => useCloset.getState().setScreen("atelier")}
              >
                Membership opens unlimited sittings · {MEMBERSHIP.month.label}
              </button>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
              {loading ? "Drafting" : lastVibe || "The look"}
            </p>
            <h3 className="mt-1 font-display text-3xl italic leading-tight">
              {lastVibe || "Own it"}
            </h3>
            <p className="mt-3 text-base leading-relaxed">{lastDesc}</p>
            {lastWhy.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm">
                {lastWhy.slice(0, 2).map((w, i) => (
                  <li key={w}>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
                      {i === 0 ? "Keep" : "Cut"} ·{" "}
                    </span>
                    {w}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="mt-3 text-sm text-muted">{error}</p>}

            <div className="mt-6">
              <LookCredits pieces={lastPieces} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  saveLook();
                  toast("Saved to Looks");
                }}
              >
                <Save className="size-4" />
                Save
              </Button>
              <Button variant="secondary" disabled={loading} onClick={() => void run(true)}>
                <RefreshCw className="size-4" />
                Not this
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  const text = creditsText(lastVibe, lastPieces) + (lastDesc ? `\n\n${lastDesc}` : "");
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: lastVibe || "Amirelle", text });
                    } else {
                      await navigator.clipboard.writeText(text);
                      toast("Credits copied");
                    }
                  } catch {
                    try {
                      await navigator.clipboard.writeText(text);
                      toast("Credits copied");
                    } catch {
                      toast("Could not share");
                    }
                  }
                }}
              >
                <Share2 className="size-4" />
                Share credits
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-muted">
          City, mood, occasion — then Look. A complete outfit with credits.
        </p>
      )}
    </div>
  );
}