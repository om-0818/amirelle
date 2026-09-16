import { LookCredits, LookStack } from "@/components/look-stack";
import { Button } from "@/components/ui/button";
import { looksSafe, piecesForLook } from "@/lib/desk-screens";
import { creditsText, validateLook } from "@/lib/outfit";
import { useCloset } from "@/store/closet";
import { useState } from "react";
import { toast } from "sonner";

export function Looks() {
  const history = looksSafe(useCloset((s) => s.history));
  const clothes = useCloset((s) => s.clothes);
  const removeLook = useCloset((s) => s.removeLook);
  const setScreen = useCloset((s) => s.setScreen);
  const ageBand = useCloset((s) => s.meta.ageBand);
  const weather = useCloset((s) => s.weather);
  const [pending, setPending] = useState<number | null>(null);

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20">
      <h2 className="font-display text-3xl italic">Looks</h2>
      <p className="mb-6 text-sm text-muted">Worn and saved. Credits stay with the look.</p>

      {history.length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center">
          <p className="font-display text-xl italic">Nothing worn yet</p>
          <p className="mt-1 text-sm text-muted">Wear today's look. It lands here.</p>
          <Button className="mt-6" onClick={() => setScreen("today")}>
            Go to today
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {history.map((entry, i) => {
            const pieces = piecesForLook(entry, clothes);
            const fit = pieces.length
              ? validateLook(pieces, entry.occ || "casual", ageBand, weather.theme)
              : { ok: false, issues: [] };
            return (
              <article
                key={`${entry.date}-${i}`}
                className="grid gap-6 border-t border-border pt-8 sm:grid-cols-[220px_1fr]"
              >
                {fit.ok ? (
                  <LookStack
                    pieces={pieces}
                    visual={entry.visual}
                    occ={entry.occ}
                    gen={ageBand}
                    theme={weather.theme}
                  />
                ) : (
                  <p className="text-sm text-muted">This look no longer holds.</p>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {entry.date} · {entry.mood} · {entry.occ}
                  </p>
                  <h3 className="mt-1 font-display text-2xl italic">
                    {entry.vibe || "Saved look"}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed">{entry.desc}</p>
                  {fit.ok ? (
                    <div className="mt-4">
                      <LookCredits pieces={pieces} />
                    </div>
                  ) : null}
                  <div className="mt-4 flex gap-4 text-xs text-muted">
                    <button
                      type="button"
                      onClick={async () => {
                        const text = creditsText(entry.vibe || "Look", pieces);
                        try {
                          await navigator.clipboard.writeText(text);
                          toast("Credits copied.");
                        } catch {
                          toast("Could not copy. Select the look instead.");
                        }
                      }}
                    >
                      Copy credits
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (pending === i) {
                          removeLook(i);
                          setPending(null);
                        } else {
                          setPending(i);
                        }
                      }}
                    >
                      {pending === i ? "Confirm remove" : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
