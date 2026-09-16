import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { COMPOSITE_CATS, anchorFor, compositePlan } from "./composite.ts";
import type { Cloth } from "./types.ts";

const C = (over: Partial<Cloth> & Pick<Cloth, "id" | "cat" | "name">): Cloth => ({
  color: "black",
  photo: "https://images.unsplash.com/photo-x?w=800&h=1066",
  brand: "COS",
  from: "house",
  ...over,
});

describe("atelier composite", () => {
  it("layers tops, bottoms, shoes in z-order from real stills", () => {
    assert.deepEqual(COMPOSITE_CATS, ["tops", "bottoms", "shoes"]);
    const plan = compositePlan([
      C({ id: 1, cat: "tops", name: "Poplin shirt", cut: "poplin shirt" }),
      C({ id: 2, cat: "bottoms", name: "Trousers", cut: "trouser" }),
      C({ id: 3, cat: "shoes", name: "Loafer", cut: "loafer" }),
    ]);
    assert.equal(plan.kind, "composite");
    if (plan.kind !== "composite") return;
    assert.deepEqual(
      plan.layers.map((l) => l.cat),
      ["shoes", "bottoms", "tops"],
    );
    assert.equal(plan.layers[0].anchor.z < plan.layers[1].anchor.z, true);
    assert.equal(plan.layers[1].anchor.z < plan.layers[2].anchor.z, true);
    assert.equal(
      plan.layers.every((l) => l.src.startsWith("https://images.unsplash.com/")),
      true,
    );
  });

  it("falls back to collage and logs the cut when anchor data is missing", () => {
    const plan = compositePlan([
      C({ id: 1, cat: "tops", name: "Tee", cut: "cotton tee" }),
      C({ id: 2, cat: "bottoms", name: "Track", cut: "track trousers" }),
      C({ id: 3, cat: "outerwear", name: "Blazer", cut: "blazer" }),
      C({ id: 4, cat: "shoes", name: "Trainer", cut: "trainer" }),
    ]);
    assert.equal(plan.kind, "collage");
    if (plan.kind !== "collage") return;
    assert.equal(plan.skipped.includes("blazer"), true);
    assert.equal(anchorFor("blazer", "outerwear"), null);
    assert.equal(anchorFor("silk camisole", "tops"), null);
    const src = readFileSync(new URL("./composite.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /imagine_|generate|openai|xai/i);
    const stack = readFileSync(new URL("../components/look-stack.tsx", import.meta.url), "utf8");
    assert.match(stack, /compositePlan/);
    assert.match(stack, /plan\.kind === "composite"/);
  });
});
