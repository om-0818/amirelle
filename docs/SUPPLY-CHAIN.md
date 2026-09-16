# Supply chain

`npm audit` on 2026-09-15: **0 vulnerabilities**. Nothing to patch. No major upgrades.

| Item | Severity | Action |
| --- | --- | --- |
| npm audit (all) | none | none |
| better-auth client ships `BETTER_AUTH_SECRET` *name* (Bun.env getter) | low | name only; value not in client |
| Unsplash stills | low | public URLs, no keys |

Client grep (`.vercel/output/static`): live `XAI_API_KEY` value absent. No `postgres://`, no PEM private keys.
