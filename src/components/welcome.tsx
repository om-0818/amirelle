import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Choice, ChoiceLabel } from "@/components/ui/choice";
import { fashionPulse } from "@/lib/fashion-clock";
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
import { identitiesFor } from "@/lib/practice";
import { saveProfile } from "@/lib/profile";
import { type Gender, type Generation } from "@/lib/types";
import { useCloset } from "@/store/closet";

function storedBirth() {
  try {
    return sessionStorage.getItem(BIRTH_KEY) || localStorage.getItem(BIRTH_KEY) || "";
  } catch {
    return "";
  }
}

function storedGender(): Gender | "" {
  try {
    return (sessionStorage.getItem(GENDER_KEY) || localStorage.getItem(GENDER_KEY) || "") as Gender | "";
  } catch {
    return "";
  }
}

export function Welcome() {
  const city = useCloset((s) => s.city);
  const setMood = useCloset((s) => s.setMood);
  const setOcc = useCloset((s) => s.setOcc);
  const finishOnboarding = useCloset((s) => s.finishOnboarding);
  const metaGender = useCloset((s) => s.meta.gender);
  const existing = useCloset((s) => s.meta.birthDate) || storedBirth();
  const [birthDate, setBirthDate] = useState(existing || birthDateForGeneration("z"));
  const band = generationFromBirthDate(birthDate);
  const g = generationById(band);
  const pulse = useMemo(() => fashionPulse(band), [band]);
  const identities = identitiesFor(band);
  const options = genderOptions(band);
  const [identity, setIdentity] = useState(identities[0].id);
  const [gender, setGender] = useState<Gender | "">(metaGender || storedGender());
  const [step, setStep] = useState(existing ? 1 : 0);
  const bounds = dateBounds();
  const age = ageYears(birthDate);
  const ageOk = age >= MIN_AGE;

  function pick(id: Generation) {
    setBirthDate(birthDateForGeneration(id));
    setIdentity(identitiesFor(id)[0].id);
    setGender("");
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

  async function enter() {
    if (!ageOk || !gender) return;
    try {
      sessionStorage.setItem(BIRTH_KEY, birthDate);
      localStorage.setItem(BIRTH_KEY, birthDate);
      sessionStorage.setItem(GENDER_KEY, gender);
      localStorage.setItem(GENDER_KEY, gender);
    } catch {
      /* ignore */
    }
    setOcc(pulse.occHint);
    setMood("confident");
    finishOnboarding(identity, band, birthDate, gender);
    void saveProfile({
      data: { birthDate, identity, city, onboarded: true, gender },
    }).catch(() => {
      /* preview may 401 if session still settling */
    });
  }

  const stepLabel = step === 0 ? "How old today" : "Who we dress";

  return (
    <section className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-12">
      <p className="kicker-brand font-medium text-accent">{stepLabel}</p>
      <h1 className="mt-2 font-display text-5xl italic leading-none sm:text-6xl">
        Ami<span className="text-accent">relle</span>
      </h1>
      <p className="mt-3 text-sm text-muted">
        {age} today · {pulse.seasonLabel}. Chatbots invent clothes. This look has to exist on
        your rail.
      </p>

      {step === 0 && (
        <>
          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            {GENERATIONS.map((a) => (
              <Choice key={a.id} on={band === a.id} onClick={() => pick(a.id)}>
                <ChoiceLabel>{a.years}</ChoiceLabel>
              </Choice>
            ))}
          </div>
          <label className="mt-5 block kicker text-muted" htmlFor="birth2">
            Birth date
          </label>
          <input
            id="birth2"
            type="date"
            min={bounds.min}
            max={bounds.max}
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setIdentity(identitiesFor(generationFromBirthDate(e.target.value))[0].id);
              setGender("");
            }}
            className="mt-1 h-11 w-full rounded-lg border border-border bg-card px-3 text-sm"
          />
          <Button
            size="lg"
            className="mt-8 font-display text-lg italic"
            disabled={!ageOk}
            onClick={() => setStep(1)}
          >
            Continue · {g.years}
          </Button>
        </>
      )}

      {step === 1 && (
        <>
          <p className="mt-6 text-sm text-muted">
            The rail is cut for a {options[0].label.toLowerCase()} or a {options[1].label.toLowerCase()}.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {options
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
            className="mt-3"
            onClick={() => rememberGender("both")}
          >
            Both rails
          </Choice>
          <div className="mt-8 flex gap-2">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1 font-display text-lg italic"
              disabled={!gender}
              onClick={() => void enter()}
            >
              Enter
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
