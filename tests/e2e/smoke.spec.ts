import { expect, test } from "@playwright/test";

test("home page renders venues from data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Delhi Tracks" })).toBeVisible();
  await expect(page.getByText("SAMPLE Alpha Stadium")).toBeVisible();
});
