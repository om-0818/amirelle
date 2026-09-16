import { Button } from "@/components/ui/button";
import { currentPractice } from "@/lib/desk-screens";
import { PRACTICE } from "@/lib/practice";
import { cn } from "@/lib/utils";
import { useCloset } from "@/store/closet";

export function PracticeView() {
  const meta = useCloset((s) => s.meta);
  const patchMeta = useCloset((s) => s.patchMeta);
  const setScreen = useCloset((s) => s.setScreen);
  const current = currentPractice(meta.practiceDay);
  const done = meta.practiceDay >= 7 && current.day === 7;

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16">
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent">
        7-day practice
      </p>
      <h2 className="mt-1 font-display text-3xl italic">Become the person</h2>
      <p className="mt-2 text-sm text-muted">
        One task a day. The look follows the day, not a lecture.
      </p>

      <ol className="mt-8 space-y-2">
        {PRACTICE.map((d) => (
          <li key={d.day}>
            <button
              type="button"
              onClick={() => patchMeta({ practiceDay: d.day })}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left",
                d.day === current.day
                  ? "border-accent bg-card"
                  : "border-border text-muted",
              )}
            >
              <span className="text-[11px] uppercase tracking-wide">Day {d.day}</span>
              <p className="font-display text-xl italic text-fg">{d.title}</p>
            </button>
          </li>
        ))}
      </ol>

      <article className="mt-8 border-t border-border pt-6">
        <h3 className="font-display text-3xl italic">{current.title}</h3>
        <p className="mt-3 leading-relaxed">{current.body}</p>
        <p className="mt-4 text-sm text-accent">{current.task}</p>
        <div className="mt-6 flex gap-2">
          {done ? (
            <Button disabled>Practice complete</Button>
          ) : (
            <Button
              onClick={() =>
                patchMeta({ practiceDay: Math.min(7, Math.max(1, meta.practiceDay) + 1) })
              }
            >
              Mark done
            </Button>
          )}
          <Button variant="secondary" onClick={() => setScreen("today")}>
            Wear today's look
          </Button>
        </div>
      </article>
    </div>
  );
}
