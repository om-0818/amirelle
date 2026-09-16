import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inspectDataUrl, inspectFile, MAX_PHOTO_BYTES } from "./photos.ts";
import { asUserPiece, isLocalPhoto } from "./closet-local.ts";
import type { Cloth } from "./types.ts";

const JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/AL+f/9k=";
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function piece(photo: string | null): Cloth {
  return { id: 1, name: "Kurta", cat: "tops", color: "white", photo };
}

describe("photo allowlist", () => {
  it("accepts jpeg and png that actually decode", () => {
    assert.equal(inspectDataUrl(JPEG).ok, true);
    assert.equal(inspectDataUrl(PNG).ok, true);
    assert.equal(isLocalPhoto(JPEG), true);
    assert.equal(asUserPiece(piece(JPEG)).photo, JPEG);
  });

  it("rejects malformed, svg, gif, html, and junk data URLs", () => {
    const bad = [
      "",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "data:image/svg+xml;base64,PHN2Zy8+",
      "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
      "data:image/jpeg;base64,$$$$",
      "data:image/jpeg;base64,not-valid!!!",
      "data:image/png;base64,AAAA",
      "data:image/webp;base64,AAAA",
      "data:image/jpeg;base64,",
      "https://images.unsplash.com/photo-x",
    ];
    for (const u of bad) {
      assert.equal(inspectDataUrl(u).ok, false, u);
      assert.equal(isLocalPhoto(u), false, u);
      assert.equal(asUserPiece(piece(u)).photo, null, u);
    }
  });

  it("caps bytes and the file MIME", () => {
    const huge = `data:image/jpeg;base64,${"A".repeat(MAX_PHOTO_BYTES * 2)}`;
    assert.equal(inspectDataUrl(huge).ok, false);
    assert.equal(inspectFile({ type: "image/svg+xml", size: 100 }).ok, false);
    assert.equal(inspectFile({ type: "image/gif", size: 100 }).ok, false);
    assert.equal(inspectFile({ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 }).ok, false);
    assert.equal(inspectFile({ type: "image/jpg", size: 80 }).ok, true);
    assert.equal(inspectFile({ type: "image/webp", size: 80 }).ok, true);
  });
});
