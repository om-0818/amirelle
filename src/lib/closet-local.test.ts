import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  QUOTA_MSG,
  applyAdd,
  applyRemove,
  asUserPiece,
  grillWardrobe,
  isLocalPhoto,
  quotaMessage,
  tryWriteAdding,
  tryWriteUser,
} from "./closet-local.ts";
import { encodeDown, fitsStore, JPEG_QUALITIES, STORE_PHOTO_MAX } from "./photos.ts";
import { leavesDeviceForGrill } from "./privacy.ts";
import type { Cloth } from "./types.ts";

const JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AL+f/9k=";

const base = (over: Partial<Cloth> = {}): Cloth => ({
  id: 1,
  name: "White kurta",
  cat: "tops",
  color: "white",
  photo: null,
  ...over,
});

describe("closet local photos", () => {
  it("files only data-URL photos, never a remote still", () => {
    const local = JPEG;
    assert.equal(isLocalPhoto(local), true);
    assert.equal(isLocalPhoto("https://images.unsplash.com/photo-x"), false);
    assert.equal(asUserPiece(base({ photo: local })).photo, local);
    assert.equal(asUserPiece(base({ photo: "https://images.unsplash.com/photo-x" })).photo, null);
    assert.equal(asUserPiece(base({ photo: local })).from, "roll");
  });

  it("add, edit, remove keep the same id", () => {
    const a = applyAdd([], base({ id: 7, photo: JPEG }));
    assert.equal(a.length, 1);
    assert.equal(a[0].id, 7);
    const edited = applyAdd(a, base({ id: 7, name: "Ivory kurta", photo: JPEG }));
    assert.equal(edited.length, 1);
    assert.equal(edited[0].name, "Ivory kurta");
    assert.equal(applyRemove(edited, 7).length, 0);
  });

  it("quota failure returns a real message and does not drop the previous closet", () => {
    const existing = applyAdd([], base({ id: 2, photo: JPEG }));
    const next = applyAdd(existing, base({ id: 3, photo: JPEG }));
    const result = tryWriteUser(next, () => false, "Navy oxford");
    assert.equal(result.ok, false);
    assert.equal(result.message, quotaMessage("Navy oxford"));
    assert.match(result.message!, /Navy oxford/);
    assert.equal(quotaMessage(), QUOTA_MSG);
  });

  it("near-full names the photo that did not fit and keeps what already filed", () => {
    const existing = applyAdd([], base({ id: 2, name: "Filed kurta", photo: JPEG }));
    const ok = base({ id: 3, name: "White shirt", photo: JPEG });
    const overflow = base({ id: 4, name: "Wedding sherwani", photo: JPEG });
    const ceiling = JSON.stringify(applyAdd(existing, ok)).length;
    const writes: string[] = [];
    const result = tryWriteAdding(existing, [ok, overflow], (json) => {
      writes.push(json);
      return json.length <= ceiling;
    });
    assert.equal(result.ok, false);
    assert.equal(result.failed, "Wedding sherwani");
    assert.match(result.message!, /Wedding sherwani/);
    assert.doesNotMatch(result.message!, /Filed kurta/);
    assert.equal(result.saved.length, 2);
    assert.equal(result.saved.some((c) => c.name === "White shirt"), true);
    assert.equal(result.saved.some((c) => c.name === "Wedding sherwani"), false);
    assert.equal(writes.length, 2);
  });

  it("encodeDown steps jpeg quality until the photo sits under the store ceiling", () => {
    const fat = `data:image/jpeg;base64,${JPEG.split(",")[1]}${"A".repeat(Math.ceil((STORE_PHOTO_MAX * 4) / 3))}`;
    assert.equal(fitsStore(fat), false);
    const seen: number[] = [];
    const out = encodeDown((_type, q) => {
      seen.push(q);
      return q > 0.4 ? fat : JPEG;
    });
    assert.equal(out, JPEG);
    assert.equal(fitsStore(out), true);
    assert.deepEqual(seen.slice(0, JPEG_QUALITIES.length), [...JPEG_QUALITIES].slice(0, seen.length));
    assert.equal(
      (() => {
        try {
          encodeDown(() => fat);
          return false;
        } catch (e) {
          return e instanceof Error && e.message === "too large";
        }
      })(),
      true,
    );
  });

  it("no photo ever leaves for the grill", () => {
    const piece = asUserPiece(base({ photo: JPEG }));
    const line = grillWardrobe([piece]);
    assert.equal(leavesDeviceForGrill(line), true);
    assert.doesNotMatch(line, /data:image/);
    assert.doesNotMatch(line, /https?:/);
    assert.match(line, /^1\|tops\|White kurta\|white\|$/);
  });
});
