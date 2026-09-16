import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP, previewUnlock } from "@/lib/membership";
import { cn } from "@/lib/utils";
import { useCloset } from "@/store/closet";

export function AtelierView() {
  const plan = useCloset((s) => s.meta.plan);
  const setPlan = useCloset((s) => s.setPlan);
  const [cycle, setCycle] = useState<"month" | "year">("year");
  const offer = cycle === "year" ? MEMBERSHIP.year : MEMBERSHIP.month;
  const isMember = plan === "atelier";

  function request() {
    const next = previewUnlock(cycle);
    setPlan(next.plan);
    toast(
      cycle === "year"
        ? "Member · the year. The desk is open. No card taken."
        : "Member · the month. The desk is open. No card taken.",
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{MEMBERSHIP.eyebrow}</p>
      <h2 className="mt-2 max-w-xl font-display text-3xl italic leading-tight sm:text-4xl">
        {MEMBERSHIP.headline}
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{MEMBERSHIP.dek}</p>

      <div className="mt-10 border border-border bg-card p-6 sm:p-10">
        {isMember ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent">You are a member</p>
        ) : (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">The invitation</p>
        )}

        <div className="mt-4 flex gap-1 rounded-full border border-border p-1 w-fit">
          <button
            type="button"
            onClick={() => setCycle("month")}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              cycle === "month" ? "bg-fg text-bg" : "text-muted",
            )}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setCycle("year")}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              cycle === "year" ? "bg-fg text-bg" : "text-muted",
            )}
          >
            Year
          </button>
        </div>

        <p className="mt-6 font-display text-6xl italic leading-none sm:text-7xl">{offer.label}</p>
        <p className="mt-2 text-sm text-muted">
          {offer.cadence}
          {"note" in offer && offer.note ? ` · ${offer.note}` : ""}
        </p>
        <p className="mt-2 text-sm text-muted">{MEMBERSHIP.gst}</p>
        <p className="mt-3 text-sm">{MEMBERSHIP.compare}</p>

        <ul className="mt-8 space-y-5">
          {MEMBERSHIP.memberHas.map((p) => (
            <li key={p.kicker}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-accent">{p.kicker}</p>
              <p className="mt-1 text-sm leading-relaxed">{p.line}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          {isMember ? (
            <>
              <Button size="lg" className="flex-1 font-display text-lg italic" disabled>
                Desk is open
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  setPlan("free");
                  toast("Back on complimentary.");
                }}
              >
                Leave membership
              </Button>
            </>
          ) : (
            <Button size="lg" className="flex-1 font-display text-lg italic" onClick={request}>
              {offer.cta}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Complimentary</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          {MEMBERSHIP.complimentaryHas.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <p className="mt-8 max-w-lg text-xs leading-relaxed text-muted">{MEMBERSHIP.preview}</p>
    </div>
  );
}
