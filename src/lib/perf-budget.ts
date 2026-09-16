import { localLook, occasionScore, stripLook, validateLook } from "./outfit.ts";
import { SAMPLE_CLOSET, forYou } from "./catalog.ts";
import { EMPTY_TASTE } from "./habit.ts";
import { GENERATIONS } from "./generations.ts";
import { occasionsFor, type Generation } from "./types.ts";

/** Milliseconds. Measured 2026-09-15 on the 15k rail; slack for CI. */
export const PERF_BUDGET_MS = {
  occasionScore: { p95: 1, max: 5 },
  stripLook: { p95: 10, max: 30 },
  validateLook: { p95: 5, max: 20 },
  localLook: { p95: 750, max: 1200 },
  retryLoop: { p95: 750, max: 1200 },
} as const;

export type PerfStep = keyof typeof PERF_BUDGET_MS;

const nowMs = () => Number(process.hrtime.bigint()) / 1e6;

export function percentile(xs: number[], p: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[i];
}

export type PlateProfile = Record<PerfStep, number[]>;

export function profilePlateCycle(perGen = 2): PlateProfile {
  const out: PlateProfile = {
    occasionScore: [],
    stripLook: [],
    validateLook: [],
    localLook: [],
    retryLoop: [],
  };
  const gens = Object.keys(GENERATIONS) as Generation[];
  for (const gen of gens) {
    const rail = forYou(SAMPLE_CLOSET, gen, "both");
    const occs = occasionsFor(gen);
    for (let i = 0; i < perGen; i++) {
      const occ = occs[i % occs.length].id;
      const cloth = rail[i % rail.length];
      let t = nowMs();
      occasionScore(cloth, occ);
      out.occasionScore.push(nowMs() - t);

      t = nowMs();
      const look = localLook(rail, "", [], gen, [], EMPTY_TASTE, occ);
      const plate = nowMs() - t;
      out.localLook.push(plate);
      out.retryLoop.push(plate);

      t = nowMs();
      stripLook(look.pieces, occ, [], gen, "");
      out.stripLook.push(nowMs() - t);

      t = nowMs();
      validateLook(look.pieces, occ, gen, "");
      out.validateLook.push(nowMs() - t);
    }
  }
  return out;
}

export function budgetFailures(profile: PlateProfile): string[] {
  const fail: string[] = [];
  for (const step of Object.keys(PERF_BUDGET_MS) as PerfStep[]) {
    const xs = profile[step];
    const cap = PERF_BUDGET_MS[step];
    const p95 = percentile(xs, 95);
    const max = xs.length ? Math.max(...xs) : 0;
    if (p95 > cap.p95) fail.push(`${step} p95 ${p95.toFixed(1)}ms > ${cap.p95}ms`);
    if (max > cap.max) fail.push(`${step} max ${max.toFixed(1)}ms > ${cap.max}ms`);
  }
  return fail;
}
