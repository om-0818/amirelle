import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PUSH_ENABLED, registerPush } from "./offline.ts";

describe("offline", () => {
  it("the worker caches the shell and never touches the closet or push", () => {
    const sw = readFileSync(new URL("../../public/sw.js", import.meta.url), "utf8");
    assert.match(sw, /amirelle-shell-v1/);
    assert.match(sw, /cache\.addAll\(SHELL\)/);
    assert.match(sw, /pathname\.startsWith\("\/api\/"\)/);
    assert.match(sw, /mode === "navigate"/);
    assert.doesNotMatch(sw, /localStorage|amirelle_user|amirelle_ledger|indexedDB/i);
    assert.doesNotMatch(sw, /pushManager|showNotification|PushSubscription/);
    assert.equal(PUSH_ENABLED, false);
  });

  it("push scaffolding stays off", async () => {
    assert.equal(await registerPush(), null);
    const src = readFileSync(new URL("./offline.ts", import.meta.url), "utf8");
    assert.match(src, /PUSH_ENABLED = false/);
    assert.doesNotMatch(src, /pushManager\.subscribe/);
    const root = readFileSync(new URL("../routes/__root.tsx", import.meta.url), "utf8");
    assert.match(root, /registerOffline/);
  });
});
