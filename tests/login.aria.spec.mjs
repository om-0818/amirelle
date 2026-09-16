import { expect, test } from "playwright/test";

test.describe("login aria tree", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
  });

  test("who we dress is on the accessibility tree, not a CSS class", async ({ page }) => {
    await expect(page.locator("main")).toMatchAriaSnapshot(`
      - heading "Amirelle" [level=1]
      - heading "Your generation" [level=2]
      - button "Woman"
      - button "Man"
      - button "Both rails"
      - button "Create account"
    `);
  });

  test("10–13 puts Girl and Boy on the tree", async ({ page }) => {
    await page.getByRole("button", { name: /Gen Alpha/ }).click();
    await expect(page.getByRole("button", { name: "Girl", exact: true })).toBeVisible();
    await expect(page.locator("main")).toMatchAriaSnapshot(`
      - button "Girl"
      - button "Boy"
      - button "Both rails"
    `);
    await expect(page.getByRole("button", { name: "Woman", exact: true })).toHaveCount(0);
  });

  test("Enter hides who we dress on the tree", async ({ page }) => {
    await page.getByRole("button", { name: /Already have an account/ }).click();
    await expect(page.getByRole("heading", { name: "Enter" })).toBeVisible();
    await expect(page.locator("main")).toMatchAriaSnapshot(`
      - heading "Amirelle" [level=1]
      - heading "Enter" [level=2]
      - button "Continue with Google"
      - button "Enter"
    `);
    await expect(page.getByRole("button", { name: "Woman", exact: true })).toHaveCount(0);
  });
});
