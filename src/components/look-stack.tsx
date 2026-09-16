import { PiecePhoto } from "@/components/piece";
import { costPerWear, formatCpw } from "@/lib/habit";
import { lookCredits, orderedPieces, assertRenderableLook } from "@/lib/outfit";
import { plateHasProvenance } from "@/lib/provenance";
import { compositePlan } from "@/lib/composite";
import { inr, type Cloth, type Generation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCloset } from "@/store/closet";

export function LookStack({
  pieces,
  visual,
  visualLoading,
  occ,
  gen,
  theme,
}: {
  pieces: Cloth[];
  visual?: string | null;
  visualLoading?: boolean;
  occ?: string;
  gen?: Generation;
  theme?: string;
}) {
  const storeOcc = useCloset((s) => s.occ);
  const ageBand = useCloset((s) => s.meta.ageBand);
  const weatherTheme = useCloset((s) => s.weather.theme);
  if (pieces.length > 0) {
    const fit = assertRenderableLook(
      pieces,
      occ ?? storeOcc,
      gen ?? ageBand,
      theme ?? weatherTheme,
      import.meta.env.DEV,
    );
    if (!fit.ok) {
      return <div className="look-plate bg-card" aria-hidden />;
    }
  }
  if (pieces.length > 0 && !plateHasProvenance(pieces)) {
    return <div className="look-plate bg-card" aria-hidden />;
  }

  const outer = pieces.find((p) => p.cat === "outerwear");
  const body = orderedPieces(pieces).filter((p) => p.cat !== "accessories" && p.cat !== "outerwear");
  const acc = pieces.find((p) => p.cat === "accessories");
  const hero = body[0];
  const rest = body.slice(1);

  if (!pieces.length) {
    return <div className="look-plate bg-card" aria-hidden />;
  }

  if (visual) {
    return (
      <div className="look-plate relative overflow-hidden bg-card">
        <img
          src={visual}
          alt="Worn look"
          width={800}
          height={1066}
          className="h-full w-full object-cover"
          style={{ aspectRatio: "3 / 4" }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    );
  }

  const plan = compositePlan(pieces);
  if (plan.kind === "composite") {
    return (
      <div className="look-plate relative overflow-hidden bg-card">
        <div className="absolute inset-[8%] rounded-[42%_42%_38%_38%/28%_28%_48%_48%] bg-fg/10" aria-hidden />
        {plan.layers.map((layer) => (
          <img
            key={layer.id}
            src={layer.src}
            alt=""
            width={360}
            height={480}
            className="absolute object-contain"
            style={{
              zIndex: layer.anchor.z,
              top: layer.anchor.top,
              left: layer.anchor.left,
              width: layer.anchor.width,
              height: layer.anchor.height,
              aspectRatio: "3 / 4",
            }}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="look-plate relative overflow-hidden bg-card">
      <div className="absolute inset-0 grid grid-rows-[1.15fr_0.85fr] gap-1 p-2">
        <div className="relative min-h-0 overflow-hidden bg-bg/40">
          {hero ? <PiecePhoto cloth={hero} className="object-cover" eager /> : null}
        </div>
        <div className={cn("grid min-h-0 gap-1", rest.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {rest.map((p) => (
            <div key={p.id} className="relative min-h-0 overflow-hidden bg-bg/40">
              <PiecePhoto cloth={p} className="object-cover" />
            </div>
          ))}
        </div>
        {acc && (
          <div className="absolute right-3 top-3 size-16 overflow-hidden bg-bg shadow-sm sm:size-20">
            <PiecePhoto cloth={acc} className="object-cover" />
          </div>
        )}
        {outer && (
          <div className="absolute left-3 top-3 size-16 overflow-hidden bg-bg shadow-sm sm:size-20">
            <PiecePhoto cloth={outer} className="object-cover" />
          </div>
        )}
      </div>
      {visualLoading && (
        <p className="absolute inset-x-0 bottom-0 bg-bg/80 py-2 text-center text-xs uppercase tracking-[0.14em] text-muted">
          Rendering worn look
        </p>
      )}
    </div>
  );
}

export function LookCredits({ pieces }: { pieces: Cloth[] }) {
  const rows = lookCredits(pieces);
  const total = rows.reduce((s, r) => s + (r.price ?? 0), 0);
  const pinned = useCloset((s) => s.pinned);
  const togglePin = useCloset((s) => s.togglePin);
  const pinFromCredits = useCloset((s) => s.pinFromCredits);
  const wearCounts = useCloset((s) => s.wearCounts);
  return (
    <ul className="divide-y divide-border border-y border-border">
      {rows.map((c) => {
        const wears = wearCounts[c.cloth.id] ?? 0;
        const cpw = costPerWear(c.price, wears);
        const held = pinned.includes(c.cloth.id);
        if (!c.source) return null;
        return (
          <li key={c.cloth.id}>
            <button
              type="button"
              onClick={() => (held ? togglePin(c.cloth.id) : pinFromCredits(c.cloth))}
              className="flex min-h-11 w-full items-center gap-3 py-2.5 text-left"
              aria-pressed={held}
            >
              <div className="size-12 shrink-0 overflow-hidden bg-card">
                <PiecePhoto cloth={c.cloth} className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted">
                  {c.brand}
                  {held ? " · in the next look" : ""}
                </p>
                <p className="truncate text-sm">{c.name}</p>
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted">{c.source}</p>
              </div>
              <div className="text-right text-sm tabular-nums text-muted">
                {c.price ? <p>{inr(c.price)}</p> : null}
                {cpw != null ? <p className="text-[11px]">{formatCpw(cpw)} a wear</p> : null}
              </div>
            </button>
          </li>
        );
      })}
      {total > 0 && (
        <li className="flex justify-between py-2.5 text-sm">
          <span className="text-muted">Look</span>
          <span className="tabular-nums">{inr(total)}</span>
        </li>
      )}
    </ul>
  );
}