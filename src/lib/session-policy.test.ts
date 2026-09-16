import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { runSignOut } from "../../scripts/sign-out-plan.mjs";
import { COOKIE_FLAGS, SESSION_POLICY, sessionExpired, sessionTampered } from "./session-policy.ts";

const serverSrc = readFileSync(new URL("./auth/server.ts", import.meta.url), "utf8");

describe("session cookie contract", () => {
  it("is HttpOnly, Secure, SameSite=Lax, __Host-, with a 7-day life and daily refresh", () => {
    assert.equal(COOKIE_FLAGS.httpOnly, true);
    assert.equal(COOKIE_FLAGS.secure, true);
    assert.equal(COOKIE_FLAGS.sameSite, "lax");
    assert.match(SESSION_POLICY.cookieName, /^__Host-/);
    assert.equal(SESSION_POLICY.expiresIn, 60 * 60 * 24 * 7);
    assert.equal(SESSION_POLICY.updateAge, 60 * 60 * 24);
    assert.match(serverSrc, /httpOnly:\s*true/);
    assert.match(serverSrc, /secure:\s*true/);
    assert.match(serverSrc, /sameSite:\s*"lax"/);
    assert.match(serverSrc, /expiresIn:\s*SESSION_POLICY\.expiresIn/);
    assert.match(serverSrc, /updateAge:\s*SESSION_POLICY\.updateAge/);
  });
});

describe("expired and tampered sessions", () => {
  it("rejects a session whose expiresAt is in the past", () => {
    const now = new Date("2026-09-15T13:50:00Z");
    assert.equal(sessionExpired("2026-09-15T13:49:59Z", now), true);
    assert.equal(sessionExpired("2026-09-15T13:50:00Z", now), true);
    assert.equal(sessionExpired("2026-09-15T13:50:01Z", now), false);
    assert.equal(sessionExpired("not-a-date", now), true);
  });

  it("treats missing, unsigned, or mangled tokens as tampered", () => {
    assert.equal(sessionTampered(null), true);
    assert.equal(sessionTampered(""), true);
    assert.equal(sessionTampered("nosig"), true);
    assert.equal(sessionTampered(".abcdefghi"), true);
    assert.equal(sessionTampered("payload."), true);
    assert.equal(sessionTampered("payload.short"), true);
    assert.equal(sessionTampered("pay load.signature1"), true);
    assert.equal(sessionTampered("payload.signature1"), false);
  });
});

describe("logout invalidates the server session", () => {
  it("asks the server to delete the session before it clears the client", async () => {
    const order: string[] = [];
    await runSignOut({
      livePreview: false,
      hasBearer: false,
      requestSignOut: async () => {
        order.push("server");
      },
      clearToken: () => {
        order.push("client");
      },
      redirect: () => {
        order.push("redirect");
      },
    });
    assert.deepEqual(order, ["server", "client", "redirect"]);
  });

  it("does not redirect when the server refuses, so the cookie stays live", async () => {
    const order: string[] = [];
    await assert.rejects(
      () =>
        runSignOut({
          livePreview: false,
          hasBearer: false,
          requestSignOut: async () => {
            order.push("server");
            throw new Error("no");
          },
          clearToken: () => {
            order.push("client");
          },
          redirect: () => {
            order.push("redirect");
          },
        }),
      /still signed in/,
    );
    assert.deepEqual(order, ["server"]);
  });
});
