import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  POPUP_SCRIPT_SHA,
  POPUP_STYLE_SHA,
  contentSecurityPolicy,
  securityHeaders,
} from "./security-headers.ts";

function sha256(s: string) {
  return `sha256-${createHash("sha256").update(s, "utf8").digest("base64")}`;
}

describe("CSP", () => {
  it("has no unsafe-inline and no unsafe-eval", () => {
    const prod = contentSecurityPolicy("prod");
    const preview = contentSecurityPolicy("preview");
    for (const csp of [prod, preview]) {
      assert.doesNotMatch(csp, /unsafe-inline/);
      assert.doesNotMatch(csp, /unsafe-eval/);
      assert.match(csp, /script-src 'self' https:\/\/grok.com/);
      assert.match(csp, /object-src 'none'/);
    }
    assert.match(prod, /frame-ancestors 'none'/);
    assert.match(preview, /frame-ancestors https:\/\/grok.com/);
  });

  it("prod sends HSTS, nosniff, referrer, and DENY framing", () => {
    const h = securityHeaders("prod");
    assert.equal(h["X-Content-Type-Options"], "nosniff");
    assert.equal(h["Referrer-Policy"], "no-referrer");
    assert.equal(h["X-Frame-Options"], "DENY");
    assert.match(h["Strict-Transport-Security"]!, /max-age=31536000/);
    assert.equal(securityHeaders("preview")["Strict-Transport-Security"], undefined);
  });

  it("popup hashes match the live completion HTML", () => {
    const src = readFileSync(new URL("./auth/popup.server.ts", import.meta.url), "utf8");
    const script = src.match(/<script>\n([\s\S]*?)\n<\/script>/)?.[1];
    const style = src.match(/<style>\n([\s\S]*?)\n<\/style>/)?.[1];
    assert.ok(script && style);
    const scripts = [sha256(script), sha256(`\n${script}\n`)];
    const styles = [sha256(style), sha256(`\n${style}\n`)];
    assert.deepEqual([...POPUP_SCRIPT_SHA].sort(), scripts.sort());
    assert.deepEqual([...POPUP_STYLE_SHA].sort(), styles.sort());
    const csp = contentSecurityPolicy("prod");
    for (const h of [...POPUP_SCRIPT_SHA, ...POPUP_STYLE_SHA]) {
      assert.match(csp, new RegExp(h.replace(/[+/]/g, "\\$&")));
    }
  });
});
