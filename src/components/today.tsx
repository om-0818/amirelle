import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { LookCredits, LookStack } from "@/components/look-stack";
import { Button } from "@/components/ui/button";
import { currentPractice } from "@/lib/desk-screens";
import { RAIL_FAILED, railStatus } from "@/lib/resilience";
import { formatCivilIST } from "@/lib/clock";
import { colorHex, fashionPulse } from "@/lib/fashion-clock";
import { neglected, weekStrip } from "@/lib/habit";
import { dailyReturn } from "@/lib/daily";
import { validateLook } from "@/lib/outfit";
import { deskIsTyping, deskShortcut, plateForSituation } from "@/lib/today-desk";
import { firstLookRail } from "@/lib/first-run";
import { ageYears, genderLabel } from "@/lib/generations";
import { occasionsFor, todayKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCloset } from "@/store/closet";

export function Today() {
  const allClothes = useCloset((s) => s.clothes);
  const meta = useCloset((s) => s.meta);
  const clothes = firstLookRail(allClothes, meta.ageBand, meta.gender);
  const weather = useCloset((s) => s.weather);
  const city = useCloset((s) => s.city);
  const pinned = useCloset((s) => s.pinned);
  const lastPieces = useCloset((s) => s.lastPieces);
  const lastDesc = useCloset((s) => s.lastDesc);
  const lastVibe = useCloset((s) => s.lastVibe);
  const lastVisual = useCloset((s) => s.lastVisual);
  const lastWhy = useCloset((s) => s.lastWhy);
  const taste = useCloset((s) => s.taste);
  const wearCounts = useCloset((s) => s.wearCounts);
  const setLook = useCloset((s) => s.setLook);
  const wearToday = useCloset((s) => s.wearToday);
  const passLook = useCloset((s) => s.passLook);
  const almostLook = useCloset((s) => s.almostLook);
  const setScreen = useCloset((s) => s.setScreen);
  const setQuery = useCloset((s) => s.setQuery);
  const togglePin = useCloset((s) => s.togglePin);
  const sittingsLeft = useCloset((s) => s.sittingsLeft);
  const occ = useCloset((s) => s.occ);
  const setOcc = useCloset((s) => s.setOcc);
  const plated = useRef(false);

  function compose(exclude: number[] = [], occId = occ) {
    const draft = plateForSituation(
      clothes,
      weather.theme,
      pinned,
      meta.ageBand,
      taste,
      occId,
      [...new Set([...exclude, ...(meta.lastWornIds ?? [])])],
    );
    setLook(draft.pieces, draft.desc, draft.vibe, draft.why);
  }

  function skip() {
    passLook();
    compose(lastPieces.map((p) => p.id));
  }

  function almost() {
    almostLook();
    compose(lastPieces.map((p) => p.id));
  }

  function wear() {
    const line = wearToday();
    if (line) toast(line);
  }

  const worn = meta.lastWear === todayKey();

  useEffect(() => {
    if (plated.current || !clothes.length || lastPieces.length) return;
    plated.current = true;
    compose();
  }, [clothes.length, lastPieces.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const action = deskShortcut(e.key, deskIsTyping(e.target), worn);
      if (!action) return;
      e.preventDefault();
      if (action === "skip") skip();
      if (action === "almost") almost();
      if (action === "hold") wear();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pulse = fashionPulse(meta.ageBand);
  const age = meta.birthDate ? ageYears(meta.birthDate) : null;
  const day = currentPractice(meta.practiceDay);
  const dateLabel = formatCivilIST();
  const week = weekStrip(meta.wornLog ?? []);
  const loop = dailyReturn({
    lastWear: meta.lastWear,
    wornIsos: (meta.wornLog ?? []).map((w) => w.iso),
    now: new Date(),
  });
  const quiet = meta.wears >= 2 ? neglected(clothes, wearCounts, 2) : [];
  const situations = occasionsFor(meta.ageBand);
  const fit = lastPieces.length ? validateLook(lastPieces, occ, meta.ageBand, weather.theme) : null;

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
      <p className="kicker-brand text-accent">{loop.kicker || dateLabel}</p>
      <h2 className="mt-1 font-display text-4xl italic leading-none">
        {lastVibe || "Tonight"}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {city}
        {weather.tempC != null ? ` · ${weather.tempC}°C` : ""} · {weather.label}
        {genderLabel(meta.ageBand, meta.gender) ? ` · ${genderLabel(meta.ageBand, meta.gender)}` : ""}
        {age != null ? ` · ${age}` : ""}
        {loop.streak > 1 ? ` · ${loop.streak} days dressed` : ""}
      </p>
      {loop.miss ? <p className="mt-2 text-sm text-muted">{loop.miss}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Situation">
        {situations.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setOcc(o.id);
              compose([], o.id);
            }}
            className={cn(
              "min-h-11 rounded-full border px-3 text-xs",
              occ === o.id ? "border-fg bg-fg text-bg" : "border-border text-muted",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <ol className="mt-5 flex gap-1" aria-label="This week">
        {week.map((d) => {
          const isToday = d.iso === todayKey();
          return (
            <li key={d.iso} className="flex-1 text-center">
              <p className={cn("text-[10px] uppercase tracking-wide", isToday ? "text-fg" : "text-muted")}>
                {d.label}
              </p>
              <span
                className={cn(
                  "mt-1 inline-block rounded-full",
                  d.vibe ? "size-2.5 bg-accent" : "size-2 border border-border",
                )}
                title={d.vibe || (isToday ? "Today" : "Not logged")}
                aria-current={isToday ? "date" : undefined}
              />
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center gap-3">
        {pulse.colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => {
              setQuery(c);
              setScreen("closet");
            }}
            className="flex min-h-11 items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted"
          >
            <span
              className="size-3 rounded-full border border-border"
              style={{ background: colorHex(c) }}
            />
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <LookStack pieces={lastPieces} visual={lastVisual} />
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Tonight</p>
          <p className="mt-3 text-base leading-relaxed">
            {lastDesc ||
              (railStatus(clothes).ok
                ? `Situation, weather, what you have not worn. Then we set it. Gemini cannot see this rail.`
                : RAIL_FAILED)}
          </p>
          {lastPieces.length > 0 && (
            <div className="mt-5">
              <LookCredits pieces={lastPieces} />
            </div>
          )}
          {lastPieces.length > 0 && lastWhy.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {lastWhy.slice(0, 2).map((w, i) => (
                <li key={i}>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {i === 0 ? "Keep" : "Cut"} ·{" "}
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          )}
          {fit && (
            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">
              {fit.ok ? "This holds for the day" : fit.issues[0]?.detail}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            <Button size="lg" className="font-display text-xl italic" onClick={() => compose()}>
              Set tonight
            </Button>
            {lastPieces.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row">
                {worn ? (
                  <Button variant="secondary" className="flex-1" onClick={() => compose(lastPieces.map((p) => p.id))}>
                    Set tomorrow
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" onClick={wear}>
                    Holds
                  </Button>
                )}
                <Button variant="secondary" className="flex-1" onClick={almost}>
                  Almost
                </Button>
                <Button variant="secondary" className="flex-1" onClick={skip}>
                  Not this
                </Button>
              </div>
            )}
          </div>
          {lastPieces.length > 0 && (
            <p className="mt-2 text-[11px] text-muted">H holds it · A almost · N not this</p>
          )}
          <button
            type="button"
            className="mt-3 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            onClick={() => setScreen("closet")}
          >
            Bring photos of your own clothes
          </button>
          <button
            type="button"
            className="mt-2 block text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            onClick={() => setScreen("style")}
          >
            Ask a stylist
            {meta.plan === "atelier"
              ? " · desk open"
              : sittingsLeft() > 0
                ? ` · ${sittingsLeft()} sitting today`
                : " · sitting used"}
          </button>

          {quiet.length > 0 && (
            <div className="mt-8 border-t border-border pt-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Still quiet</p>
              {quiet.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="mt-2 block text-left text-sm"
                  onClick={() => {
                    togglePin(c.id);
                    toast(`Pinned ${c.brand ?? ""} ${c.name}`);
                  }}
                >
                  {c.brand} — {c.name}
                  <span className="text-muted"> · pin into the next look</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setScreen("practice")}
            className="mt-8 block w-full border-t border-border pt-5 text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Practice · day {day.day} of 7
            </p>
            <p className="mt-1 font-display text-xl italic">{day.title}</p>
            <p className="mt-1 text-sm text-muted">{day.task}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
