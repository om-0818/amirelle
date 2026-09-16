# Server surface

| Route | Auth | This user | Rate | CSRF |
| --- | --- | --- | --- | --- |
| `GET/POST /api/auth/$` | Broker / Better Auth | Session row for this cookie | Better Auth | `trustedOrigins` + Fetch-Metadata |
| `getProfile` GET | `authMiddleware` | `WHERE user_id = context.userId` | Session | `assertSameSiteRequest` |
| `saveProfile` POST | `authMiddleware` | `INSERT … context.userId` — body cannot pick a user | Session | `assertSameSiteRequest` |
| `fetchWeather` POST | Same-site | No user rows. City sanitised; no SSRF | 60 / hour / city | `assertSameSiteRequest` |
| `grillOutfit` POST | Same-site | Client wardrobe only. No user id in payload | 12 / hour (xAI quota) | `assertSameSiteRequest` |
| `getConnectorReadiness` POST | None | Boolean flag, no rows | None | None — no cookie, no data |

IDOR: no route takes a user id in a param. Profile SQL is session-scoped. A foreign id in `scopedUserId` throws Forbidden.
