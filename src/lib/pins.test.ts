import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pinFromCredits, savePins, loadPins } from "./pins.ts";
import { store } from "./storage.ts";
import { STORAGE_KEYS } from "./privacy.ts";
import type { Cloth } from "./types.ts";

const shirt = (over: Partial<Cloth> = {}): Cloth => ({
  id: 10001,
  name: "Navy poplin shirt",
  cat: "tops",
  color: "navy",
  photo: "https://images.unsplash.com/photo-x",
  brand: "COS",
  cut: "poplin shirt",
  from: "house",
  ...over,
});

describe("pin from credits", () => {
  it("adds the exact rail item by id, not a clone", () => {
    const item = shirt();
    const first = pinFromCredits({ clothes: [item], pinned: [], hidden: [item.id] }, item);
    assert.equal(first.clothes.length, 1);
    assert.equal(first.clothes[0], item);
    assert.deepEqual(first.pinned, [item.id]);
    assert.equal(first.hidden.includes(item.id), false);
    const second = pinFromCredits(first, { ...item, name: "Clone" });
    assert.equal(second.clothes.length, 1);
    assert.equal(second.clothes[0].name, "Navy poplin shirt");
    assert.deepEqual(second.pinned, [item.id]);
  });

  it("survives a reload of STORAGE_KEYS.pins", () => {
    store.set(STORAGE_KEYS.pins, "[]");
    savePins([10001, 10001, 10002]);
    assert.deepEqual(loadPins(), [10001, 10002]);
    const raw = store.get(STORAGE_KEYS.pins, "[]");
    const again = JSON.parse(raw) as number[];
    assert.deepEqual(again, [10001, 10002]);
  });
});
