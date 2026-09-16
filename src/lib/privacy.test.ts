import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  ACCOUNT_ONLY,
  LOCAL_ONLY,
  NEVER,
  STORAGE_KEYS,
  STORAGE_KEY_LINES,
  accountPayload,
  ACCOUNT_FIELDS,
  clearAllLocal,
  exportLocalData,
  leavesDeviceForGrill,
} from "./privacy.ts";

describe("digital closet privacy", () => {
  it("names every key we persist, and none of them are a photo library token", () => {
    const keys = Object.values(STORAGE_KEYS);
    assert.equal(keys.length >= 8, true);
    assert.equal(
      keys.some((k) => /google|photos.library|drive/i.test(k)),
      false,
    );
  });

  it("lists every STORAGE_KEYS entry", () => {
    const listed = new Set(STORAGE_KEY_LINES.map((l) => l.key));
    for (const key of Object.values(STORAGE_KEYS)) {
      assert.equal(listed.has(key), true, `missing ${key}`);
    }
    assert.equal(STORAGE_KEY_LINES.length, Object.keys(STORAGE_KEYS).length);
  });

  it("export is valid JSON of all local keys; account is only email/birth/gender/city", () => {
    const bag: Record<string, string> = {
      [STORAGE_KEYS.user]: JSON.stringify([{ id: 1, name: "Kurta", photo: "data:image/jpeg;base64,xx" }]),
      [STORAGE_KEYS.meta]: JSON.stringify({ birthDate: "1996-04-02", gender: "femme", wears: 9 }),
      [STORAGE_KEYS.taste]: JSON.stringify({ brands: { COS: 1 } }),
    };
    const dump = exportLocalData((k) => bag[k] ?? "", { email: "a@b.c", city: "Pune" });
    const json = JSON.stringify(dump);
    const parsed = JSON.parse(json) as typeof dump;
    for (const name of Object.keys(STORAGE_KEYS)) {
      assert.equal(name in parsed.local, true, name);
    }
    assert.equal(parsed.account.email, "a@b.c");
    assert.equal(parsed.account.birth, "1996-04-02");
    assert.equal(parsed.account.gender, "femme");
    assert.equal(parsed.account.city, "Pune");
    assert.deepEqual(Object.keys(parsed.account).sort(), ["birth", "city", "email", "gender"]);
    const extra = accountPayload({
      email: "x",
      birth: "y",
      gender: "z",
      city: "Pune",
      wears: 99,
      photos: "no",
      identity: "teen",
      taste: { brands: { COS: 1 } },
      userId: "someone-else",
    });
    assert.deepEqual([...ACCOUNT_FIELDS].sort(), ["birth", "city", "email", "gender"]);
    assert.deepEqual(Object.keys(extra).sort(), [...ACCOUNT_FIELDS].sort());
    assert.equal("wears" in extra, false);
    assert.equal("photos" in extra, false);
    assert.equal("identity" in extra, false);
    assert.equal("taste" in extra, false);
    assert.equal("userId" in extra, false);
    const round = JSON.parse(JSON.stringify(extra)) as Record<string, unknown>;
    assert.deepEqual(Object.keys(round).sort(), ["birth", "city", "email", "gender"]);
    assert.equal(Object.keys(round).length, 4);
  });

  it("fails if the account payload ever grows past email/birth/gender/city", () => {
    const src = readFileSync(new URL("./privacy.ts", import.meta.url), "utf8");
    assert.equal(ACCOUNT_FIELDS.length, 4);
    assert.deepEqual([...ACCOUNT_FIELDS], ["email", "birth", "gender", "city"]);
    assert.match(src, /export const ACCOUNT_FIELDS = \["email", "birth", "gender", "city"\] as const/);
    assert.doesNotMatch(src, /ACCOUNT_FIELDS = \[[^\]]*(identity|taste|photo|wear)/);
  });

  it("export after delete is empty local data", () => {
    const bag: Record<string, string> = {};
    for (const key of Object.values(STORAGE_KEYS)) bag[key] = JSON.stringify({ kept: true });
    clearAllLocal((key) => {
      delete bag[key];
    });
    const dump = exportLocalData((k) => bag[k] ?? "", { email: "a@b.c", city: "Pune" });
    for (const name of Object.keys(STORAGE_KEYS)) {
      assert.equal(dump.local[name], null, name);
    }
    assert.equal(JSON.stringify(dump.local).includes("kept"), false);
  });

  it("delete clears every STORAGE_KEYS entry", () => {
    const bag: Record<string, string> = {};
    for (const key of Object.values(STORAGE_KEYS)) bag[key] = "x";
    clearAllLocal((key) => {
      delete bag[key];
    });
    for (const key of Object.values(STORAGE_KEYS)) {
      assert.equal(key in bag, false, key);
    }
  });

  it("the stylist is sent names, never pictures", () => {
    assert.equal(leavesDeviceForGrill("101 | White shirt | COS | tops | white"), true);
    assert.equal(leavesDeviceForGrill("data:image/jpeg;base64,/9j/"), false);
    assert.equal(leavesDeviceForGrill("https://images.unsplash.com/photo"), false);
  });

  it("promises we never scan a library, and that photos stay here", () => {
    const never = NEVER.join(" ");
    const local = LOCAL_ONLY.join(" ");
    const account = ACCOUNT_ONLY.join(" ");
    assert.match(never, /Google Photos library/i);
    assert.match(never, /not pictures|names/i);
    assert.match(local, /this browser/i);
    assert.match(account, /Birth date/i);
    assert.doesNotMatch(never + local + account, /scan your camera roll unbidden/i);
  });
});
