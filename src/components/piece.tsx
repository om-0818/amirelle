import { Shirt } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PiecePhoto({
  cloth,
  className,
  eager = false,
}: {
  cloth: { name: string; photo: string | null; cat?: string };
  className?: string;
  eager?: boolean;
}) {
  const [dead, setDead] = useState(false);
  if (cloth.photo && !dead) {
    return (
      <img
        src={cloth.photo}
        alt={cloth.name}
        width={360}
        height={480}
        className={cn("h-full w-full object-cover object-center", className)}
        style={{ aspectRatio: "3 / 4" }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        decoding="async"
        onError={() => setDead(true)}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-card text-muted">
      <Shirt className="size-8 opacity-50" strokeWidth={1.25} />
    </div>
  );
}