import { Menu, X } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Today } from "@/components/today";
import { Welcome } from "@/components/welcome";
import { ThemeToggle } from "@/components/theme-toggle";
import { Landing } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { chrome } from "@/lib/copy";
import { MEMBERSHIP } from "@/lib/membership";
import { BIRTH_KEY, GENDER_KEY, generationById, generationFromBirthDate } from "@/lib/generations";
import { getProfile } from "@/lib/profile";
import type { Gender } from "@/lib/types";
import { fetchWeather } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { hydrateCloset, useCloset, type Screen } from "@/store/closet";

const ClosetView = lazy(() => import("@/components/closet-view").then((m) => ({ default: m.ClosetView })));
const StyleBoard = lazy(() => import("@/components/style-board").then((m) => ({ default: m.StyleBoard })));
const Looks = lazy(() => import("@/components/looks").then((m) => ({ default: m.Looks })));
const PracticeView = lazy(() => import("@/components/practice-view").then((m) => ({ default: m.PracticeView })));
const JournalView = lazy(() => import("@/components/journal-view").then((m) => ({ default: m.JournalView })));
const AtelierView = lazy(() => import("@/components/atelier-view").then((m) => ({ default: m.AtelierView })));
const PrivacyView = lazy(() => import("@/components/privacy-view").then((m) => ({ default: m.PrivacyView })));

function ScreenFallback() {
  return <div className="mx-auto min-h-[70vh] max-w-6xl px-4 py-16 text-muted">Opening…</div>;
}

export function Shell() {
  const { user } = useCurrentUserState();
  const screen = useCloset((s) => s.screen);
  const setScreen = useCloset((s) => s.setScreen);
  const weatherTheme = useCloset((s) => s.weather.theme);
  const city = useCloset((s) => s.city);
  const setWeather = useCloset((s) => s.setWeather);
  const ageBand = useCloset((s) => s.meta.ageBand);
  const plan = useCloset((s) => s.meta.plan);
  const streak = useCloset((s) => s.meta.streak);
  const labels = chrome();
  const gen = generationById(ageBand);
  const [more, setMore] = useState(false);

  const syncLifetime = useCloset((s) => s.syncLifetime);
  const patchMeta = useCloset((s) => s.patchMeta);
  const setCity = useCloset((s) => s.setCity);

  useEffect(() => {
    hydrateCloset();
  }, []);

  useEffect(() => {
    if (!user) return;
    let live = true;
    getProfile()
      .then((p) => {
        if (!live) return;
        const stored =
          p?.birthDate ||
          (() => {
            try {
              return sessionStorage.getItem(BIRTH_KEY) || localStorage.getItem(BIRTH_KEY) || "";
            } catch {
              return "";
            }
          })();
        if (!stored) return;
        patchMeta({
          birthDate: stored,
          identity: p?.identity || useCloset.getState().meta.identity,
          onboarded: p?.onboarded || useCloset.getState().meta.onboarded,
          gender:
            (p?.gender as Gender) ||
            useCloset.getState().meta.gender ||
            ((() => {
              try {
                return (sessionStorage.getItem(GENDER_KEY) || localStorage.getItem(GENDER_KEY) || "") as Gender | "";
              } catch {
                return "";
              }
            })()),
        });
        if (p?.city) setCity(p.city);
        const changed = useCloset.getState().syncLifetime();
        if (changed) {
          toast(`The rail follows you now · ${generationById(generationFromBirthDate(stored)).years}`);
        }
        if (
          (p?.onboarded || useCloset.getState().meta.onboarded) &&
          useCloset.getState().meta.gender &&
          useCloset.getState().screen === "welcome"
        ) {
          useCloset.getState().setScreen("today");
        }
      })
      .catch(() => {
        try {
          const stored = sessionStorage.getItem(BIRTH_KEY) || localStorage.getItem(BIRTH_KEY);
          if (stored && !useCloset.getState().meta.birthDate) {
            patchMeta({ birthDate: stored, onboarded: true });
            useCloset.getState().syncLifetime();
          }
          if (useCloset.getState().meta.onboarded && useCloset.getState().screen === "welcome") {
            useCloset.getState().setScreen("today");
          }
        } catch {
          /* ignore */
        }
      });
    return () => {
      live = false;
    };
  }, [user, patchMeta, setCity]);

  useEffect(() => {
    const tick = () => {
      const changed = syncLifetime();
      if (changed) toast("Birthday noted. The rail updated.");
    };
    tick();
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(tick, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, [syncLifetime]);

  useEffect(() => {
    let live = true;
    fetchWeather({ data: { city } }).then((w) => {
      if (live) setWeather(w);
    });
    return () => {
      live = false;
    };
  }, [city, setWeather]);

  useEffect(() => {
    document.documentElement.dataset.weather = weatherTheme || "";
  }, [weatherTheme]);

  if (!user) return <Landing />;
  if (screen === "welcome" || !useCloset.getState().meta.gender) return <Welcome />;

  const tabs: { id: Screen; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "closet", label: labels.closet },
    { id: "style", label: labels.style },
    { id: "looks", label: "Looks" },
  ];

  return (
    <div className="relative z-10 min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap">
          <button type="button" className="min-h-11 text-left" onClick={() => setScreen("today")}>
            <span className="font-display text-2xl italic tracking-tight">
              Ami<span className="text-accent">relle</span>
            </span>
            <span className="mt-0.5 block text-xs uppercase tracking-[0.18em] text-muted">
              {gen.years} · {gen.gen}
              {plan === "atelier" ? " · Member" : ""}
              {streak > 1 ? ` · ${streak}d` : ""}
            </span>
          </button>
          <nav className="order-3 w-full min-w-0 overflow-x-auto sm:order-none sm:flex-1" aria-label="Primary">
            <div className="flex justify-center rounded-full border border-border bg-card p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => useCloset.getState().setScreen(t.id)}
                  className={cn(
                    "tap shrink-0 rounded-full px-3 text-sm font-medium sm:px-4",
                    screen === t.id ? "bg-fg text-bg" : "text-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="More" onClick={() => setMore((v) => !v)}>
              {more ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
            <UserButton />
          </div>
        </div>
        {more && (
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 border-t border-border px-4 py-3 text-sm">
            <button type="button" className="tap px-2 text-muted hover:text-fg" onClick={() => { setScreen("practice"); setMore(false); }}>
              Practice
            </button>
            <button type="button" className="tap px-2 text-muted hover:text-fg" onClick={() => { setScreen("journal"); setMore(false); }}>
              Essays
            </button>
            <button type="button" className="tap px-2 text-muted hover:text-fg" onClick={() => { setScreen("atelier"); setMore(false); }}>
              {plan === "atelier" ? "Membership · Member" : `Membership · ${MEMBERSHIP.month.label}`}
            </button>
            <button type="button" className="tap px-2 text-muted hover:text-fg" onClick={() => { setScreen("privacy"); setMore(false); }}>
              Privacy
            </button>
          </div>
        )}
      </header>
      <main id="main" className="pt-6">
        {screen === "today" && <Today />}
        <Suspense fallback={<ScreenFallback />}>
          {screen === "closet" && <ClosetView />}
          {screen === "style" && <StyleBoard />}
          {screen === "looks" && <Looks />}
          {screen === "practice" && <PracticeView />}
          {screen === "journal" && <JournalView />}
          {screen === "atelier" && <AtelierView />}
          {screen === "privacy" && <PrivacyView />}
        </Suspense>
      </main>
    </div>
  );
}
