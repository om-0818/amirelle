import { Button } from "@/components/ui/button";
import { journalEssays } from "@/lib/desk-screens";
import { useCloset } from "@/store/closet";

export function JournalView() {
  const setScreen = useCloset((s) => s.setScreen);
  const essays = journalEssays();

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-16">
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Journal</p>
      <h2 className="mt-1 font-display text-3xl italic">How to dress as a person</h2>
      <p className="mt-2 text-sm text-muted">
        Short essays. No shopping links. The product is the practice.
      </p>
      {essays.length === 0 ? (
        <div className="mt-10 border border-dashed border-border py-16 text-center">
          <p className="font-display text-xl italic">Nothing on the desk yet</p>
          <Button className="mt-6" onClick={() => setScreen("practice")}>
            Start the practice
          </Button>
        </div>
      ) : (
        <div className="mt-10 space-y-14">
          {essays.map((e) => (
            <article key={e.slug}>
              <h3 className="font-display text-3xl italic">{e.title}</h3>
              <p className="mt-1 text-sm text-accent">{e.dek}</p>
              {e.body.split("\n\n").map((p) => (
                <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-pretty">
                  {p}
                </p>
              ))}
            </article>
          ))}
        </div>
      )}
      <div className="mt-12">
        <Button variant="secondary" onClick={() => setScreen("practice")}>
          Open the 7-day practice
        </Button>
      </div>
    </div>
  );
}
