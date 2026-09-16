import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Choice, ChoiceLabel } from "@/components/ui/choice";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input, Label } from "@/components/ui/input";
import { AppErrorComponent } from "@/lib/error-component";
import {
  BIRTH_KEY,
  GENDER_KEY,
  GENERATIONS,
  MIN_AGE,
  ageYears,
  birthDateForGeneration,
  dateBounds,
  genderOptions,
  generationFromBirthDate,
  generationById,
} from "@/lib/generations";
import { fashionPulse } from "@/lib/fashion-clock";
import type { Gender, Generation } from "@/lib/types";

export const Route = createFileRoute("/login")({
  component: Login,
  errorComponent: AppErrorComponent,
});

function rememberBirth(iso: string) {
  try {
    sessionStorage.setItem(BIRTH_KEY, iso);
    localStorage.setItem(BIRTH_KEY, iso);
  } catch {
    /* ignore */
  }
}

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const bounds = dateBounds();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState(birthDateForGeneration("z"));
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const age = ageYears(birthDate);
  const genId: Generation = generationFromBirthDate(birthDate);
  const gen = generationById(genId);
  const pulse = useMemo(() => fashionPulse(genId), [genId]);
  const ageOk = age >= MIN_AGE && age <= 100;

  if (!isPending && user) {
    void navigate({ to: "/" });
  }

  function rememberGender(next: Gender) {
    setGender(next);
    try {
      sessionStorage.setItem(GENDER_KEY, next);
      localStorage.setItem(GENDER_KEY, next);
    } catch {
      /* ignore */
    }
  }

  function pick(id: Generation) {
    setBirthDate(birthDateForGeneration(id));
    setGender("");
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "up" && !ageOk) {
      setError("Membership starts at 10. Enter a real birth date.");
      return;
    }
    if (mode === "up" && !gender) {
      setError("Tell us who we dress — girl or boy, woman or man.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") rememberBirth(birthDate);
      if (mode === "up" && gender) rememberGender(gender);
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name: name || "Member" });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setBusy(false);
    }
  }

  async function onSocial(providerId: string) {
    if (mode === "up") {
      if (!ageOk) {
        setError("Pick a generation or birth date first — the rail follows you as you age.");
        return;
      }
      if (!gender) {
        setError("Tell us who we dress first.");
        return;
      }
      rememberBirth(birthDate);
      rememberGender(gender);
    }
    await signIn(providerId, { callbackURL: "/" });
  }

  return (
    <main className="relative grid min-h-dvh bg-bg text-fg lg:grid-cols-2">
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle />
      </div>
      <section className="flex flex-col justify-end border-b border-border px-6 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
        <p className="kicker-brand text-accent">Members</p>
        <h1 className="mt-4 font-display text-6xl italic leading-none lg:text-7xl">Amirelle</h1>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
          Gemini will talk. Google will scan. Amirelle plates tonight from the rail — who we
          dress, {ageOk ? `${age} today` : "your age"}, {gen.gen}. {pulse.seasonLabel}.
        </p>
      </section>
      <section className="px-5 py-10 lg:grid lg:place-items-center lg:py-16">
        <div className="w-full max-w-lg">
          <h2 className="font-display text-3xl italic">
            {mode === "up" ? "Your generation" : "Enter"}
          </h2>
          {mode === "up" && (
            <>
              <p className="mt-2 text-sm text-muted">
                Used at sign-in. Recalculated every day from your birth date and the live fashion calendar.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {GENERATIONS.map((a) => (
                  <Choice key={a.id} on={genId === a.id} onClick={() => pick(a.id)}>
                    <span className="flex items-baseline justify-between gap-2">
                      <ChoiceLabel>{a.years}</ChoiceLabel>
                      <span className="kicker">{a.gen}</span>
                    </span>
                  </Choice>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="birth">Birth date — the rail follows your age</Label>
                <Input
                  id="birth"
                  type="date"
                  required
                  min={bounds.min}
                  max={bounds.max}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted">
                  {ageOk
                    ? `${age} today · ${gen.gen} · week ${pulse.week} ${pulse.colorNote}`
                    : `Membership starts at ${MIN_AGE}.`}
                </p>
              </div>
              <p className="mt-5 kicker text-muted">Who we dress</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {genderOptions(genId)
                  .filter((o) => o.id !== "both")
                  .map((o) => (
                    <Choice key={o.id} on={gender === o.id} onClick={() => rememberGender(o.id)}>
                      <ChoiceLabel>{o.label}</ChoiceLabel>
                    </Choice>
                  ))}
              </div>
              <Choice
                size="row"
                ink
                on={gender === "both"}
                className="mt-2"
                onClick={() => rememberGender("both")}
              >
                Both rails
              </Choice>
            </>
          )}

          {authEnabled ? (
            <>
              <div className="mt-6 flex flex-col gap-2">
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    variant="secondary"
                    className="h-12 w-full"
                    onClick={() => void onSocial(p.providerId)}
                  >
                    Continue with {p.label}
                  </Button>
                ))}
              </div>
              <p className="my-5 text-center kicker text-muted">
                or email
              </p>
              <form onSubmit={(e) => void onEmail(e)} className="space-y-3">
                {mode === "up" && (
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "up" ? "new-password" : "current-password"}
                  />
                </div>
                {error && <p className="text-sm text-accent">{error}</p>}
                <Button type="submit" className="h-12 w-full" disabled={busy}>
                  {busy ? "Please wait" : mode === "up" ? "Create account" : "Enter"}
                </Button>
              </form>
              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-muted"
                onClick={() => setMode(mode === "up" ? "in" : "up")}
              >
                {mode === "up" ? "Already have an account? Sign in" : "New here? Create account"}
              </button>
            </>
          ) : (
            <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </section>
    </main>
  );
}
