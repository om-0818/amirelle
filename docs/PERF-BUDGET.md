# Plate performance budget

Measured 2026-09-15, Node 22, house rail ~15k cuts.

**After catalog index (gen × cat × occasion-want at load):**

| Step | p50 | p95 | max | Budget p95 | Budget max |
| --- | --- | --- | --- | --- | --- |
| `occasionScore` | 0.002 ms | 0.003 ms | 0.008 ms | 1 ms | 5 ms |
| `stripLook` (look-sized) | <1 ms | <1 ms | — | 10 ms | 30 ms |
| `validateLook` | 0.42 ms | 0.57 ms | 2.5 ms | 5 ms | 20 ms |
| `localLook` + retry | **44 ms** | **47 ms** | 78 ms | 750 ms | 1200 ms |
| retry loop | = localLook | = localLook | = localLook | 750 ms | 1200 ms |

Before index, `localLook` p95 was 155 ms (full-rail sort every retry). Slack in the budget is for `npm test` running files in parallel.

Test: `src/lib/perf-budget.test.ts`. Equivalence: `src/lib/catalog-index.test.ts` (500 seeds).
