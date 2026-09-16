import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertRenderableLook, gateGrillLook, gatedLook, keepCut, localLook, occAllowed, occasionScore, OCCASION_KIT, orderedPieces, stripLook, validateLook } from "./outfit.ts";
import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { EMPTY_TASTE } from "./habit.ts";
import { fashionPulse } from "./fashion-clock.ts";
import { GENERATIONS } from "./generations.ts";
import type { Cloth } from "./types.ts";
import { OCCASIONS, occasionsFor } from "./types.ts";

function C(over: Partial<Cloth> & Pick<Cloth, "id" | "cat" | "name">): Cloth {
  return {
    color: "black",
    photo: null,
    brand: "Zara",
    gens: ["z", "zlate", "mill"],
    ...over,
  };
}

const RAIL: Cloth[] = [
  C({ id: 1, cat: "tops", name: "Poplin shirt", brand: "COS", color: "white" }),
  C({ id: 2, cat: "tops", name: "Knit polo", brand: "Zara", color: "emerald" }),
  C({ id: 3, cat: "bottoms", name: "Trousers", brand: "Zara", color: "black" }),
  C({ id: 4, cat: "bottoms", name: "Jeans", brand: "Levi's", color: "blue" }),
  C({ id: 5, cat: "dresses", name: "Slip", brand: "COS", color: "black" }),
  C({ id: 6, cat: "shoes", name: "Loafer", brand: "Aldo", color: "black" }),
  C({ id: 7, cat: "shoes", name: "Runner sneakers", brand: "Nike", house: "sport", color: "white" }),
  C({ id: 8, cat: "outerwear", name: "Down jacket", brand: "Zara", color: "emerald" }),
  C({ id: 9, cat: "accessories", name: "Aviator sunglasses", brand: "Zara", color: "black" }),
  C({ id: 10, cat: "tops", name: "Cotton tee", brand: "Nike", house: "sport", color: "black" }),
  C({ id: 11, cat: "bottoms", name: "Track trousers", brand: "Adidas", house: "sport", color: "black" }),
  C({ id: 12, cat: "outerwear", name: "Leather jacket", brand: "Zara", color: "brown" }),
  C({ id: 13, cat: "accessories", name: "Cuff", brand: "Zara", color: "emerald" }),
];

describe("orderedPieces", () => {
  it("reads the body top to shoe", () => {
    const ordered = orderedPieces([RAIL[6], RAIL[0], RAIL[2]]);
    assert.deepEqual(
      ordered.map((p) => p.cat),
      ["tops", "bottoms", "shoes"],
    );
  });
});

describe("localLook", () => {
  it("never titles a look as Brand × Brand", () => {
    const look = localLook(RAIL, "", [], "z", [], EMPTY_TASTE, "work");
    assert.doesNotMatch(look.vibe, /×/);
    assert.equal(look.vibe, "Work");
  });

  it("builds a wearable body: top+bottom or a dress, plus shoes", () => {
    const look = localLook(RAIL, "", [], "z", [], EMPTY_TASTE, "casual");
    const cats = new Set(look.pieces.map((p) => p.cat));
    assert.equal(cats.has("shoes"), true);
    const dress = cats.has("dresses");
    const split = cats.has("tops") && cats.has("bottoms");
    assert.equal(dress || split, true);
    assert.equal(dress && cats.has("tops"), false);
  });

  it("honours pins", () => {
    const look = localLook(RAIL, "", [7], "z", [], EMPTY_TASTE, "gym");
    assert.equal(look.pieces.some((p) => p.id === 7), true);
  });

  it("skips excluded ids so Not this actually changes the rail", () => {
    const next = localLook(RAIL, "", [], "z", [1, 2], EMPTY_TASTE, "casual");
    assert.equal(
      next.pieces.some((p) => p.id === 1 || p.id === 2),
      false,
    );
  });

  it("pulls more than two houses when the rail has them", () => {
    const look = localLook(RAIL, "rainy", [], "z", [], EMPTY_TASTE, "casual");
    const brands = new Set(look.pieces.map((p) => p.brand));
    assert.equal(brands.size >= 2, true);
  });

  it("gym is training kit, never a polo and a leather jacket", () => {
    for (let i = 0; i < 15; i++) {
      const look = localLook(RAIL, "rainy", [], "z", [], EMPTY_TASTE, "gym");
      const blob = look.pieces.map((p) => p.name).join(" ").toLowerCase();
      assert.equal(/polo|down jacket|leather|sunglass|cuff|loafer/.test(blob), false, blob);
      assert.equal(
        look.pieces.some((p) => p.cat === "shoes" && /runner/i.test(p.name)),
        true,
      );
      assert.match(look.desc, /Training kit/);
    }
  });
});

describe("occasionScore", () => {
  it("vetoes street clothes for the gym", () => {
    const polo = RAIL.find((c) => /polo/i.test(c.name))!;
    const down = RAIL.find((c) => /down/i.test(c.name))!;
    const sun = RAIL.find((c) => /sunglass/i.test(c.name))!;
    const tee = RAIL.find((c) => /tee/i.test(c.name))!;
    const runner = RAIL.find((c) => /runner/i.test(c.name))!;
    assert.ok(occasionScore(polo, "gym") < 0);
    assert.ok(occasionScore(down, "gym") < 0);
    assert.ok(occasionScore(sun, "gym") < 0);
    assert.ok(occasionScore(tee, "gym") > 0);
    assert.ok(occasionScore(runner, "gym") > 0);
  });
});

describe("every situation on the live rail", () => {
  const taste = EMPTY_TASTE;

  for (const gender of ["masc", "femme"] as const) {
    const rail = forYou(SAMPLE_CLOSET, "z", gender);
    for (const occ of occasionsFor("z")) {
      it(`${gender} · ${occ.label} plates a complete body and no veto`, () => {
        const look = localLook(rail, "rainy", [], "z", [], taste, occ.id);
        const cats = new Set(look.pieces.map((p) => p.cat));
        assert.equal(look.vibe, occ.label);
        assert.ok(cats.has("shoes"), `${gender} ${occ.id} missing shoes`);
        const body = cats.has("dresses") || (cats.has("tops") && cats.has("bottoms"));
        assert.ok(body, `${gender} ${occ.id} incomplete`);
        for (const p of look.pieces) {
          assert.ok(occasionScore(p, occ.id) >= 0, `${gender} ${occ.id} vetoed ${p.name}`);
        }
        assert.equal(look.fit.ok, true, `${gender} ${occ.id}: ${look.fit.issues.map((i) => i.detail).join("; ")}`);
        assert.equal(look.fit.ok, look.pieces.length > 0);
      });
    }
  }
});

describe("fit validation", () => {
  const tee = RAIL.find((c) => /cotton tee/i.test(c.name))!;
  const track = RAIL.find((c) => /track/i.test(c.name))!;
  const runner = RAIL.find((c) => /runner/i.test(c.name))!;
  const polo = RAIL.find((c) => /polo/i.test(c.name))!;
  const leather = RAIL.find((c) => /leather/i.test(c.name))!;
  const sun = RAIL.find((c) => /sunglass/i.test(c.name))!;

  it("rejects the gym look we shipped by mistake", () => {
    const fit = validateLook([leather, polo, sun, runner], "gym");
    assert.equal(fit.ok, false);
    assert.ok(fit.issues.some((i) => i.code === "veto"));
  });

  it("accepts training kit", () => {
    assert.equal(validateLook([tee, track, runner], "gym").ok, true);
  });

  it("rejects a dress worn with a shirt", () => {
    const fit = validateLook([RAIL[5], RAIL[0], RAIL[6]], "date");
    assert.equal(fit.ok, false);
    assert.ok(fit.issues.some((i) => i.code === "body"));
  });

  it("stripLook recovers gym kit from a mixed rail", () => {
    const cleaned = stripLook(RAIL, "gym");
    assert.equal(validateLook(cleaned, "gym").ok, true);
    assert.equal(cleaned.some((p) => /polo|leather|sunglass/i.test(p.name)), false);
  });

  it("work refuses a hoodie", () => {
    const hoodie = C({ id: 40, cat: "tops", name: "Hoodie", brand: "Nike", house: "sport" });
    const fit = validateLook([hoodie, RAIL[2], RAIL[6]], "work");
    assert.equal(fit.ok, false);
  });

  it("keep names a piece; cut names what not to add", () => {
    const plate = [
      RAIL.find((c) => /cotton tee/i.test(c.name))!,
      RAIL.find((c) => /track/i.test(c.name))!,
      RAIL.find((c) => /runner/i.test(c.name))!,
    ];
    const { keep, cut, keepId, cutId } = keepCut(plate, "gym", RAIL);
    const held = plate.find((p) => p.id === keepId);
    const spoil = RAIL.find((p) => p.id === cutId);
    assert.ok(held, "keepId must be on the plate");
    assert.match(keep, new RegExp(held!.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.ok(spoil, "cutId must be in the rejected pool");
    assert.equal(plate.some((p) => p.id === cutId), false);
    assert.ok(occasionScore(spoil!, "gym") < 0);
    assert.match(cut, new RegExp(spoil!.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    assert.doesNotMatch(keep, /×/);
    assert.doesNotMatch(cut, /×/);
    assert.doesNotMatch(`${keep} ${cut}`, /diwali|holi|ganesh|eid|navratri|christmas/i);
  });

  it("localLook keep/cut ids sit on the plate or the rejected rail", () => {
    const rail = forYou(SAMPLE_CLOSET, "z", "masc");
    const look = localLook(rail, "", [], "z", [], EMPTY_TASTE, "work");
    const { keep, cut, keepId, cutId } = keepCut(look.pieces, "work", rail);
    assert.ok(look.pieces.some((p) => p.id === keepId));
    assert.match(look.why[0] ?? "", /holds/i);
    assert.doesNotMatch(`${keep} ${cut} ${look.why.join(" ")}`, /×/);
    assert.doesNotMatch(`${keep} ${cut}`, /diwali|holi|ganesh|eid/i);
    if (cutId != null) {
      assert.ok(rail.some((p) => p.id === cutId));
      assert.equal(look.pieces.some((p) => p.id === cutId), false);
    }
  });

  it("never returns pieces unless fit.ok", () => {
    const street = RAIL.filter((c) => !/tee|track|runner|hoodie/i.test(c.name));
    const look = localLook(street, "", [], "z", [], EMPTY_TASTE, "gym");
    assert.equal(look.fit.ok, false);
    assert.equal(look.pieces.length, 0);
  });

  it("a pinned leather jacket does not punch the gym gate", () => {
    const look = localLook(RAIL, "rainy", [leather.id], "z", [], EMPTY_TASTE, "gym");
    assert.equal(look.pieces.some((p) => p.id === leather.id), false);
    if (look.pieces.length) assert.equal(look.fit.ok, true);
  });

  it("gatedLook drops the shirt off a dress and never plates a failing body", () => {
    const slip = RAIL.find((c) => /slip/i.test(c.name))!;
    const shirt = RAIL.find((c) => /poplin/i.test(c.name))!;
    const loafer = RAIL.find((c) => /loafer/i.test(c.name))!;
    const out = gatedLook([slip, shirt, loafer], "date");
    assert.equal(out.some((p) => p.cat === "tops"), false);
    assert.equal(validateLook(out, "date").ok, true);
    assert.deepEqual(gatedLook([shirt, loafer], "date"), []);
  });

  it("suede fails the gate in the wet, even when theme is empty", () => {
    const suede = C({ id: 50, cat: "shoes", name: "Suede loafer", brand: "Aldo" });
    const fitRain = validateLook([tee, RAIL[3], suede], "casual", "z", "rainy");
    assert.ok(fitRain.issues.some((i) => i.code === "weather"));
    const pulse = fashionPulse("z");
    if (pulse.season === "monsoon" || pulse.season === "winter") {
      const fitAir = validateLook([tee, RAIL[3], suede], "casual", "z", "");
      assert.ok(fitAir.issues.some((i) => i.code === "weather"));
    }
  });

  it("dev invariant throws when an illegal look would render", () => {
    assert.throws(
      () => assertRenderableLook([leather, polo, sun, runner], "gym", "z", "", true),
      /fit\.ok !== true/,
    );
    assert.equal(assertRenderableLook([leather, polo, sun, runner], "gym", "z", "", false).ok, false);
    assert.equal(assertRenderableLook([tee, track, runner], "gym", "z", "", true).ok, true);
  });

  it("grill leather polo gym falls back to a look Today would accept", () => {
    const r = gateGrillLook([leather.id, polo.id, sun.id], RAIL, "gym", "z", "");
    assert.equal(r.source, "fallback");
    assert.equal(r.look.fit.ok, true);
    assert.ok(r.pieces.length > 0);
    assert.equal(validateLook(r.pieces, "gym", "z", "").ok, true);
    assert.equal(r.pieces.some((p) => p.id === leather.id), false);
  });

  it("grill training kit passes the same gate as Today", () => {
    const r = gateGrillLook([tee.id, track.id, runner.id], RAIL, "gym", "z", "");
    assert.equal(r.source, "grill");
    assert.equal(r.look.fit.ok, true);
    assert.equal(validateLook(r.pieces, "gym", "z", "").ok, true);
    assert.ok(r.pieces.some((p) => p.id === tee.id));
    assert.ok(r.pieces.some((p) => p.id === runner.id));
  });
});

describe("composition property", () => {
  it("2000 random plates keep a wearable body", () => {
    const gens = GENERATIONS.map((g) => g.id);
    const genders = ["femme", "masc"] as const;
    const themes = ["", "rainy", "cold"] as const;
    const N = 2000;
    let plated = 0;
    for (let i = 0; i < N; i++) {
      const gen = gens[i % gens.length];
      const occs = occasionsFor(gen);
      const occ = occs[(i * 17) % occs.length];
      const gender = genders[i % 2];
      const theme = themes[i % 3];
      const rail = forYou(SAMPLE_CLOSET, gen, gender);
      const pin = i % 7 === 0 && rail.length ? [rail[(i * 13) % rail.length].id] : [];
      const look = localLook(rail, theme, pin, gen, [], EMPTY_TASTE, occ.id);
      const names = look.pieces.map((p) => p.name).join(" / ");
      const label = `${i} ${gender} ${gen} ${occ.id} ${theme || "air"} ${names}`;
      assert.ok(look.pieces.length > 0, `empty plate ${label}`);
      assert.equal(look.fit.ok, true, `${label}: ${look.fit.issues.map((x) => x.detail).join("; ")}`);
      const n = (cat: Cloth["cat"]) => look.pieces.filter((p) => p.cat === cat).length;
      const dresses = n("dresses");
      const tops = n("tops");
      const bottoms = n("bottoms");
      assert.equal(n("shoes"), 1, `shoes ${label}`);
      assert.ok(n("outerwear") <= 1, `outer ${label}`);
      assert.ok(n("accessories") <= 1, `acc ${label}`);
      const xor = (dresses === 1 && !tops && !bottoms) || (!dresses && tops === 1 && bottoms === 1);
      assert.ok(xor, `body ${label} d${dresses} t${tops} b${bottoms}`);
      for (const p of look.pieces) {
        assert.ok(occasionScore(p, occ.id) >= 0, `veto ${p.name} ${label}`);
      }
      plated += 1;
    }
    assert.equal(plated, N);
  });
});

describe("gym kit", () => {
  it("200 plates never yield leather, polo, sunglasses, denim, heels, or a blazer, and always trainers", () => {
    const gens = GENERATIONS.map((g) => g.id).filter((id) =>
      occasionsFor(id).some((o) => o.id === "gym"),
    );
    const genders = ["femme", "masc"] as const;
    const themes = ["", "rainy", "cold"] as const;
    const banned = /leather|polo|sunglass|denim|\bjean|heel|blazer/i;
    const trainer = /trainer|runner sneaker|court sneaker|hiking sneaker/i;
    for (let i = 0; i < 200; i++) {
      const gen = gens[i % gens.length];
      const gender = genders[i % 2];
      const theme = themes[i % 3];
      const rail = forYou(SAMPLE_CLOSET, gen, gender);
      const look = localLook(rail, theme, [], gen, [], EMPTY_TASTE, "gym");
      const blob = look.pieces.map((p) => `${p.name} ${p.brand ?? ""}`).join(" ");
      const label = `${i} ${gender} ${gen} ${theme || "air"} ${blob}`;
      assert.equal(look.fit.ok, true, label);
      assert.ok(look.pieces.length > 0, `empty ${label}`);
      assert.equal(banned.test(blob), false, `street on gym ${label}`);
      assert.ok(
        look.pieces.some((p) => p.cat === "shoes" && trainer.test(p.name)),
        `no trainers ${label}`,
      );
      for (const p of look.pieces) {
        assert.ok(occasionScore(p, "gym") >= 0, `veto ${p.name} ${label}`);
      }
    }
  });
});

describe("work and wedding kits", () => {
  const genders = ["femme", "masc"] as const;
  const workGens = GENERATIONS.map((g) => g.id).filter((id) =>
    occasionsFor(id).some((o) => o.id === "work"),
  );
  const weddingGens = GENERATIONS.map((g) => g.id).filter((id) =>
    occasionsFor(id).some((o) => o.id === "wedding"),
  );
  const athleisure = /hoodie|sweatshirt|track|\btee\b|trainer|sneaker|runner|bermuda|\bshorts\b|fleece|windbreaker/i;
  const closed = /loafer|derby|oxford shoe|brogue|monk|chelsea|ankle boot|boot/i;
  const shirtKnit = /shirt|poplin|oxford|knit|merino|cashmere|blouse|turtleneck|cardigan|crew/i;
  const trousers = /trouser|chino/i;

  it("work is shirt or knit, trousers, a closed shoe — never shorts or trainers", () => {
    for (let i = 0; i < 80; i++) {
      const gen = workGens[i % workGens.length];
      const gender = genders[i % 2];
      const look = localLook(forYou(SAMPLE_CLOSET, gen, gender), "", [], gen, [], EMPTY_TASTE, "work");
      const blob = look.pieces.map((p) => p.name).join(" ");
      const label = `${i} ${gender} ${gen} ${blob}`;
      assert.equal(look.fit.ok, true, label);
      assert.equal(athleisure.test(blob), false, `athleisure at work ${label}`);
      assert.ok(look.pieces.some((p) => p.cat === "tops" && shirtKnit.test(p.name)), `no shirt ${label}`);
      assert.ok(look.pieces.some((p) => p.cat === "bottoms" && trousers.test(p.name)), `no trousers ${label}`);
      assert.ok(look.pieces.some((p) => p.cat === "shoes" && closed.test(p.name)), `open shoe ${label}`);
      assert.equal(look.pieces.some((p) => p.cat === "dresses"), false, label);
    }
  });

  it("wedding is never gym kit, and Fabindia or Manyavar can reach the look", () => {
    let indian = 0;
    for (let i = 0; i < 80; i++) {
      const gen = weddingGens[i % weddingGens.length];
      const gender = genders[i % 2];
      const look = localLook(forYou(SAMPLE_CLOSET, gen, gender), "", [], gen, [], EMPTY_TASTE, "wedding");
      const blob = look.pieces.map((p) => `${p.name} ${p.brand ?? ""}`).join(" ");
      const label = `${i} ${gender} ${gen} ${blob}`;
      assert.equal(look.fit.ok, true, label);
      assert.equal(athleisure.test(blob), false, `athleisure at a wedding ${label}`);
      if (look.pieces.some((p) => p.brand === "Fabindia" || p.brand === "Manyavar")) indian += 1;
    }
    assert.ok(indian > 0, "Fabindia/Manyavar never reached a wedding look");
  });
});

describe("minor safety", () => {
  it("alpha and teen cannot plate night, party, date, or other adult days", () => {
    for (const gen of ["alpha", "teen"] as const) {
      for (const occ of OCCASIONS) {
        if (occAllowed(gen, occ.id)) continue;
        const look = localLook(SAMPLE_CLOSET, "", [], gen, [], EMPTY_TASTE, occ.id);
        assert.equal(look.pieces.length, 0, `${gen} plated ${occ.id}`);
        assert.equal(look.fit.ok, false, `${gen} ${occ.id}`);
        assert.ok(look.fit.issues.some((i) => i.code === "age"), `${gen} ${occ.id}`);
      }
    }
    const night = validateLook(
      [
        C({ id: 80, cat: "tops", name: "Silk shirt" }),
        C({ id: 81, cat: "bottoms", name: "Trousers" }),
        C({ id: 82, cat: "shoes", name: "Loafer" }),
      ],
      "night",
      "alpha",
    );
    assert.equal(night.ok, false);
  });

  it("adults never plate school or play", () => {
    for (const gen of ["z", "zlate", "mill", "x", "prime"] as const) {
      for (const occ of ["school", "play"] as const) {
        assert.equal(occAllowed(gen, occ), false, `${gen} ${occ}`);
        const look = localLook(SAMPLE_CLOSET, "", [], gen, [], EMPTY_TASTE, occ);
        assert.equal(look.pieces.length, 0, `${gen} plated ${occ}`);
        assert.equal(look.fit.ok, false);
      }
    }
  });

  it("minor plates never include heels or adult-only cuts", () => {
    const banned = /heel|pump|stiletto|kitten|slip dress|halter|bodycon|\bclub\b/i;
    const heel = C({ id: 90, cat: "shoes", name: "Kitten heel" });
    assert.equal(validateLook([RAIL[9], RAIL[3], heel], "casual", "alpha").ok, false);
    assert.deepEqual(gatedLook([RAIL[9], RAIL[3], heel], "casual", "alpha"), []);
    for (const gen of ["alpha", "teen"] as const) {
      for (const occ of occasionsFor(gen)) {
        const look = localLook(forYou(SAMPLE_CLOSET, gen, "femme"), "", [], gen, [], EMPTY_TASTE, occ.id);
        const blob = look.pieces.map((p) => p.name).join(" ");
        assert.equal(look.fit.ok, true, `${gen} ${occ.id} ${blob}`);
        assert.equal(banned.test(blob), false, `${gen} ${occ.id} ${blob}`);
      }
    }
  });
});

describe("OCCASION_KIT coverage", () => {
  it("every occasion has want, veto, and a silhouette", () => {
    for (const occ of OCCASIONS) {
      const kit = OCCASION_KIT[occ.id];
      assert.ok(kit, `missing kit ${occ.id}`);
      assert.equal(kit === OCCASION_KIT.casual || occ.id === "casual" || Boolean(kit.want), true);
      assert.ok(kit.want instanceof RegExp, `want ${occ.id}`);
      assert.ok(kit.veto instanceof RegExp, `veto ${occ.id}`);
      assert.equal(typeof kit.brief, "string");
      assert.equal(typeof kit.dress, "boolean", `dress ${occ.id}`);
      assert.ok(["weather", "sport", "never", "tailored"].includes(kit.outer), `outer ${occ.id}`);
      assert.ok(["ok", "sport", "never", "bag"].includes(kit.acc), `acc ${occ.id}`);
    }
  });

  it("every allowed generation × occasion plates within retry", () => {
    const starved: string[] = [];
    for (const gen of GENERATIONS.map((g) => g.id)) {
      const allowed = new Set(occasionsFor(gen).map((o) => o.id));
      for (const occ of OCCASIONS) {
        if (!allowed.has(occ.id)) continue;
        for (const gender of ["femme", "masc"] as const) {
          const rail = forYou(SAMPLE_CLOSET, gen, gender);
          const look = localLook(rail, "", [], gen, [], EMPTY_TASTE, occ.id);
          if (!look.fit.ok || look.pieces.length === 0) {
            starved.push(
              `${gender} ${gen}/${occ.id}: ${look.fit.issues.map((i) => i.detail).join("; ") || "empty"}`,
            );
          }
        }
      }
    }
    assert.deepEqual(starved, [], starved.join(" | "));
  });
});
