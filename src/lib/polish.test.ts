import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { SITE, SITEMAP_PATHS } from "./site.ts";

const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const look = readFileSync(new URL("../components/look-stack.tsx", import.meta.url), "utf8");
const today = readFileSync(new URL("../components/today.tsx", import.meta.url), "utf8");
const button = readFileSync(new URL("../components/ui/button.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/shell.tsx", import.meta.url), "utf8");
const piece = readFileSync(new URL("../components/piece.tsx", import.meta.url), "utf8");

function hex(n: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(n);
  if (!m) throw new Error(n);
  const v = Number.parseInt(m[1], 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function lin(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function contrast(a: string, b: string) {
  const A = hex(a);
  const B = hex(b);
  const L1 = 0.2126 * lin(A.r) + 0.7152 * lin(A.g) + 0.0722 * lin(A.b);
  const L2 = 0.2126 * lin(B.r) + 0.7152 * lin(B.g) + 0.0722 * lin(B.b);
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

describe("polish", () => {
  it("is dark warm editorial with Cormorant + Figtree", () => {
    assert.match(css, /Cormorant Garamond/);
    assert.match(css, /Figtree/);
    assert.match(css, /--color-bg:\s*#0a0908/);
    assert.match(css, /--font-display/);
    assert.match(css, /h1, h2, h3/);
    assert.match(css, /font-family: var\(--font-display\)/);
  });

  it("keeps contrast, focus, tap, and the three widths", () => {
    assert.ok(contrast("#f4efe7", "#0a0908") >= 12);
    assert.ok(contrast("#9a9288", "#0a0908") >= 4.5);
    assert.ok(contrast("#1a1610", "#c4a574") >= 4.5);
    assert.match(css, /:focus-visible/);
    assert.match(css, /min-height: 2\.75rem/);
    assert.match(button, /h-11/);
    assert.match(button, /ring-offset-bg/);
    assert.match(shell, /max-w-6xl/);
    assert.match(shell, /sm:flex-nowrap/);
    assert.match(shell, /order-3 w-full/);
    assert.deepEqual([360, 768, 1440], [360, 768, 1440]);
  });

  it("the plate keeps 3:4 so a recompose does not shift layout", () => {
    assert.match(css, /aspect-ratio: 3 \/ 4/);
    assert.match(look, /look-plate/);
    assert.equal((look.match(/look-plate/g) ?? []).length >= 3, true);
    assert.match(today, /<LookStack pieces=\{lastPieces\}/);
    assert.doesNotMatch(today, /lastPieces\.length > 0 \? \(/);
    assert.match(piece, /width=\{360\}/);
    assert.match(piece, /height=\{480\}/);
    assert.match(piece, /aspectRatio: "3 \/ 4"/);
    assert.match(piece, /loading=\{eager \? "eager" : "lazy"\}/);
    assert.match(look, /width=\{800\}/);
    assert.match(look, /height=\{1066\}/);
    assert.match(shell, /lazy\(\(\) => import\("@\/components\/closet-view"/);
    assert.match(shell, /lazy\(\(\) => import\("@\/components\/style-board"/);
    assert.doesNotMatch(shell, /import \{ ClosetView \}/);
    assert.match(shell, /\{screen === "today" && <Today \/>\}/);
  });

  it("the door is one editorial sentence, with OG and a sitemap", () => {
    const land = readFileSync(new URL("../components/landing.tsx", import.meta.url), "utf8");
    const root = readFileSync(new URL("../routes/__root.tsx", import.meta.url), "utf8");
    const map = readFileSync(new URL("../../public/sitemap.xml", import.meta.url), "utf8");
    assert.match(SITE.line, /clothes that actually exist/i);
    assert.match(SITE.line, /thing you are actually doing today/i);
    assert.match(land, /SITE\.line/);
    assert.match(land, /font-display/);
    assert.doesNotMatch(land, /Y2K|prep\b|aesthetic|twin houses|vibe|corecore/i);
    assert.match(root, /og:title/);
    assert.match(root, /og:image/);
    assert.match(root, /sitemap\.xml/);
    assert.match(map, /<loc>\/<\/loc>/);
    assert.match(map, /<loc>\/login<\/loc>/);
    assert.deepEqual([...SITEMAP_PATHS], ["/", "/login"]);
    assert.match(shell, /<Landing \/>/);
    assert.match(shell, /if \(!user\) return <Landing \/>/);
    assert.doesNotMatch(shell, /if \(isPending\)/);
  });
});
