import type { Cloth } from "./types.ts";
import { inspectDataUrl } from "./photos.ts";

export const QUOTA_MSG =
  "This browser ran out of room. The photo was not filed. Remove a few of your photos and try again.";

export function quotaMessage(photoName?: string) {
  const name = photoName?.trim();
  if (!name) return QUOTA_MSG;
  return `This browser ran out of room. “${name}” was not filed. Remove a few of your photos and try again.`;
}

export function isLocalPhoto(url: string | null | undefined): boolean {
  return inspectDataUrl(url).ok;
}

export function asUserPiece(c: Cloth): Cloth {
  const photo = isLocalPhoto(c.photo) ? c.photo : null;
  return { ...c, photo, from: "roll" };
}

export function applyAdd(user: Cloth[], item: Cloth): Cloth[] {
  const piece = asUserPiece(item);
  const i = user.findIndex((x) => x.id === piece.id);
  if (i < 0) return [...user, piece];
  const next = user.slice();
  next[i] = piece;
  return next;
}

export function applyRemove(user: Cloth[], id: number): Cloth[] {
  return user.filter((x) => x.id !== id);
}

export function tryWriteUser(
  next: Cloth[],
  write: (json: string) => boolean,
  failedName?: string,
): { ok: boolean; message?: string } {
  if (!write(JSON.stringify(next))) return { ok: false, message: quotaMessage(failedName) };
  return { ok: true };
}

/** Write one piece at a time so a full disk names the photo that did not fit. */
export function tryWriteAdding(
  existing: Cloth[],
  items: Cloth[],
  write: (json: string) => boolean,
): { ok: boolean; saved: Cloth[]; message?: string; failed?: string } {
  let current = existing;
  for (const item of items) {
    const next = applyAdd(current, item);
    if (!write(JSON.stringify(next))) {
      return { ok: false, saved: current, failed: item.name, message: quotaMessage(item.name) };
    }
    current = next;
  }
  return { ok: true, saved: current };
}

export function wardrobeLine(c: Cloth): string {
  return `${c.id}|${c.cat}|${c.name}|${c.color}|${c.brand ?? ""}`;
}

export function grillWardrobe(clothes: Cloth[]): string {
  return clothes.map(wardrobeLine).join("\n");
}
