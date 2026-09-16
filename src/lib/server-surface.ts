/** Rate limits, city sanitise, and IDOR: never trust a client-sent user id. */

export const GRILL_PER_HOUR = 12;
export const WEATHER_PER_HOUR = 60;
export const HOUR_MS = 60 * 60 * 1000;

const buckets = new Map<string, { n: number; reset: number }>();

export function resetRateBuckets() {
  buckets.clear();
}

export function takeToken(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const cur = buckets.get(key);
  if (!cur || now >= cur.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

export function scopedUserId(sessionUserId: string, requested?: string | null): string {
  if (!sessionUserId) throw new Error("Unauthorized");
  if (requested && requested !== sessionUserId) throw new Error("Forbidden");
  return sessionUserId;
}

export function sanitizeCity(city: string): string {
  const t = city.trim().slice(0, 80);
  if (!t) return "";
  if (/[^\p{L}\p{N}\s,.'-]/u.test(t)) return "";
  return t;
}

export function weatherRequestUrl(city: string): string | null {
  const c = sanitizeCity(city);
  if (!c) return null;
  return `https://wttr.in/${encodeURIComponent(c)}?format=j1`;
}

export const SERVER_SURFACE = [
  { route: "GET/POST /api/auth/$", auth: "broker", scope: "session row", rate: "better-auth", csrf: "trustedOrigins + same-site" },
  { route: "getProfile GET", auth: "authMiddleware", scope: "context.userId", rate: "session", csrf: "assertSameSiteRequest" },
  { route: "saveProfile POST", auth: "authMiddleware", scope: "context.userId", rate: "session", csrf: "assertSameSiteRequest" },
  { route: "fetchWeather POST", auth: "same-site", scope: "none (public weather)", rate: `${WEATHER_PER_HOUR}/h`, csrf: "assertSameSiteRequest" },
  { route: "grillOutfit POST", auth: "same-site", scope: "client wardrobe only", rate: `${GRILL_PER_HOUR}/h`, csrf: "assertSameSiteRequest" },
  { route: "getConnectorReadiness POST", auth: "none (flag only)", scope: "no user rows", rate: "none", csrf: "none — no cookie, no data" },
  { route: "POST /api/razorpay/webhook (stub, flag off)", auth: "HMAC X-Razorpay-Signature", scope: "event id, idempotent", rate: "n/a", csrf: "n/a — provider callback, not wired" },
] as const;
