import type { Cloth } from "./types.ts";

export type Provenance = "closet" | "rail";

export function provenanceOf(c: Pick<Cloth, "from">): Provenance | null {
  if (c.from === "roll") return "closet";
  if (c.from === "house") return "rail";
  return null;
}

/** Visible anti-hallucination line. Empty string means do not render. */
export function provenanceLine(c: Pick<Cloth, "from">): string {
  const p = provenanceOf(c);
  if (p === "closet") return "In your closet";
  if (p === "rail") return "On the rail";
  return "";
}

export function plateHasProvenance(pieces: Pick<Cloth, "from">[]): boolean {
  return pieces.length > 0 && pieces.every((c) => provenanceOf(c) != null);
}
