import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { execFileSync } from "node:child_process";
import {
  CLIENT_BUNDLE_ROOTS,
  clientAssetFiles,
  scanClientBundle,
} from "./client-bundle-secrets.mjs";

describe("supply chain — client bundle", () => {
  it("has a built client to grep", () => {
    const files = clientAssetFiles();
    assert.ok(
      files.length > 0,
      `no client assets under ${CLIENT_BUNDLE_ROOTS.join(", ")}`,
    );
  });

  it("contains no live secret, key, or token", () => {
    const { leaks } = scanClientBundle();
    assert.deepEqual(
      leaks,
      [],
      leaks.map((l) => `${l.kind} in ${l.file}`).join("; "),
    );
  });
});

describe("supply chain — npm audit", () => {
  it("reports zero vulnerabilities or logs only unpatchable", () => {
    const out = execFileSync("npm", ["audit", "--json"], {
      encoding: "utf8",
      cwd: process.cwd(),
    });
    const json = JSON.parse(out);
    const counts = json.metadata?.vulnerabilities ?? {};
    const total =
      (counts.critical ?? 0) +
      (counts.high ?? 0) +
      (counts.moderate ?? 0) +
      (counts.low ?? 0);
    assert.equal(total, 0);
  });
});
