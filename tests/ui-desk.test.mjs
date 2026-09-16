/**
 * Automated UI tests. Playwright + Chromium — already in the house.
 * These assert what a member can see, not class-name soup.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { chromium } from "playwright";

const BASE = process.env.UI_BASE_URL || "http://127.0.0.1:8080";

let browser;
let page;

async function fontOf(locator) {
  const handle = await locator.elementHandle();
  assert.ok(handle, "missing element");
  return handle.evaluate((el) => {
    const sample = el.querySelector(".font-display") || el.querySelector("span") || el;
    const cs = getComputedStyle(sample);
    return {
      fontSize: parseFloat(cs.fontSize),
      height: el.getBoundingClientRect().height,
      family: cs.fontFamily,
    };
  });
}

describe("login desk — utilities and who we dress", () => {
  before(async () => {
    browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const res = await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    assert.ok(res && res.ok(), `login did not load (${res?.status()})`);
  });

  after(async () => {
    await browser?.close();
  });

  it("kicker-brand is 11px uppercase, not a second headline", async () => {
    const members = page.locator("text=Members").first();
    const cs = await members.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        size: parseFloat(s.fontSize),
        transform: s.textTransform,
        tracking: parseFloat(s.letterSpacing),
      };
    });
    assert.ok(cs.size <= 12, `kicker was ${cs.size}px`);
    assert.equal(cs.transform, "uppercase");
    assert.ok(cs.tracking >= 2, "brand tracking should be wide");
  });

  it("Woman/Man match the generation card type, and hit 44px", async () => {
    const years = page.getByRole("button", { name: /18–24/ });
    const woman = page.getByRole("button", { name: "Woman", exact: true });
    const man = page.getByRole("button", { name: "Man", exact: true });
    await woman.scrollIntoViewIfNeeded();
    const y = await fontOf(years);
    const w = await fontOf(woman);
    const m = await fontOf(man);
    assert.equal(w.fontSize, y.fontSize, `Woman ${w.fontSize} vs years ${y.fontSize}`);
    assert.equal(m.fontSize, y.fontSize);
    assert.ok(w.height >= 44, `Woman height ${w.height}`);
    assert.ok(m.height >= 44, `Man height ${m.height}`);
    assert.match(w.family, /Cormorant|serif/i);
  });

  it("10–13 switches the labels to Girl and Boy at the same size", async () => {
    await page.getByRole("button", { name: /10–13/ }).click();
    const girl = page.getByRole("button", { name: "Girl", exact: true });
    const boy = page.getByRole("button", { name: "Boy", exact: true });
    await girl.waitFor();
    const g = await fontOf(girl);
    const b = await fontOf(boy);
    assert.equal(g.fontSize, b.fontSize);
    assert.ok(g.fontSize <= 24, `Girl was still a headline at ${g.fontSize}px`);
    assert.equal(await page.getByRole("button", { name: "Woman", exact: true }).count(), 0);
  });

  it("55+ returns Woman and Man", async () => {
    await page.getByRole("button", { name: /55 and over/ }).click();
    await page.getByRole("button", { name: "Woman", exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Girl", exact: true }).count(), 0);
  });

  it("Enter hides who we dress so a returning member is not blocked", async () => {
    await page.getByRole("button", { name: /Already have an account/ }).click();
    await page.getByRole("heading", { name: "Enter" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Woman", exact: true }).count(), 0);
    assert.equal(await page.getByRole("button", { name: "Both rails" }).count(), 0);
    await page.getByRole("button", { name: "Continue with Google" }).waitFor();
  });
});

describe("codeless path — aria snapshot, not a click-recorder", () => {
  it("the login tree names Woman, Man, and Both without us writing locators", async () => {
    const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    const tree = await page.locator("main").ariaSnapshot();
    await browser.close();
    assert.match(tree, /heading "Amirelle"/);
    assert.match(tree, /heading "Your generation"/);
    assert.match(tree, /button "Woman"/);
    assert.match(tree, /button "Man"/);
    assert.match(tree, /button "Both rails"/);
    assert.match(tree, /button "Create account"/);
    assert.doesNotMatch(tree, /button "Girl"/);
  });
});