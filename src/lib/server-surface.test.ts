import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  GRILL_PER_HOUR,
  SERVER_SURFACE,
  WEATHER_PER_HOUR,
  scopedUserId,
  sanitizeCity,
  takeToken,
  resetRateBuckets,
  weatherRequestUrl,
} from "./server-surface.ts";

describe("server surface — IDOR", () => {
  it("never returns another user's id from a param", () => {
    assert.equal(scopedUserId("user-a"), "user-a");
    assert.equal(scopedUserId("user-a", "user-a"), "user-a");
    assert.throws(() => scopedUserId("user-a", "user-b"), /Forbidden/);
    assert.throws(() => scopedUserId("", "user-b"), /Unauthorized/);
  });

  it("getProfile and saveProfile bind SQL to context.userId, never a body id", () => {
    const src = readFileSync(new URL("./profile.ts", import.meta.url), "utf8");
    assert.match(src, /authMiddleware/);
    assert.match(src, /user_id = \$\{context\.userId\}/);
    assert.match(src, /values \(\$\{context\.userId\}/);
    assert.doesNotMatch(src, /data\.userId|data\.user_id/);
  });
});

describe("server surface — weather", () => {
  it("rejects cities that would leave wttr.in", () => {
    assert.equal(weatherRequestUrl("Pune"), "https://wttr.in/Pune?format=j1");
    assert.equal(weatherRequestUrl("https://evil.example"), null);
    assert.equal(weatherRequestUrl("../admin"), null);
    assert.equal(weatherRequestUrl("Pune;curl x"), null);
    assert.equal(sanitizeCity(""), "");
  });

  it("caps weather calls inside the hour", () => {
    resetRateBuckets();
    for (let i = 0; i < WEATHER_PER_HOUR; i++) assert.equal(takeToken("weather:t", WEATHER_PER_HOUR, 1000, 0), true);
    assert.equal(takeToken("weather:t", WEATHER_PER_HOUR, 1000, 0), false);
    assert.equal(takeToken("weather:t", WEATHER_PER_HOUR, 1000, 1000), true);
  });
});

describe("server surface — grill", () => {
  it("caps grill calls inside the hour", () => {
    resetRateBuckets();
    for (let i = 0; i < GRILL_PER_HOUR; i++) assert.equal(takeToken("grill:t", GRILL_PER_HOUR, 1000, 0), true);
    assert.equal(takeToken("grill:t", GRILL_PER_HOUR, 1000, 0), false);
  });

  it("does not accept a user id on the grill payload", () => {
    const src = readFileSync(new URL("./style-me.ts", import.meta.url), "utf8");
    assert.doesNotMatch(src, /userId/);
    assert.match(src, /assertSameSiteRequest/);
    assert.match(src, /takeToken\("grill"/);
  });
});

describe("server surface — auth and readiness", () => {
  it("lists every server route", () => {
    const names = SERVER_SURFACE.map((r) => r.route).join(" ");
    assert.match(names, /\/api\/auth\/\$/);
    assert.match(names, /getProfile/);
    assert.match(names, /saveProfile/);
    assert.match(names, /fetchWeather/);
    assert.match(names, /grillOutfit/);
    assert.match(names, /getConnectorReadiness/);
    assert.match(names, /razorpay\/webhook/);
    assert.equal(SERVER_SURFACE.length, 7);
  });

  it("auth catch-all only forwards the request, never a user id param", () => {
    const src = readFileSync(new URL("../routes/api/auth/$.ts", import.meta.url), "utf8");
    assert.match(src, /auth\.handler\(request\)/);
  });
});
