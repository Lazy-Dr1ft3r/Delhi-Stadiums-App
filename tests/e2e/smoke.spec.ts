import { expect, test } from "@playwright/test";

// These tests run against the SAMPLE venues in data/venues.

test("explore lists venues and filters them", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("3 venues")).toBeVisible();
  await expect(page.getByRole("link", { name: /SAMPLE Alpha Stadium/ })).toBeVisible();

  await page.getByRole("button", { name: "Cinder" }).click();
  await expect(page.getByText("1 venue", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /SAMPLE Bravo Sports Complex/ })).toBeVisible();

  await page.getByRole("button", { name: /Clear/ }).click();
  await page.getByRole("searchbox", { name: "Search venues" }).fill("charlie");
  await expect(page.getByText("1 venue", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /SAMPLE Charlie Ground/ })).toBeVisible();
});

test("map view renders markers", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "map" }).click();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator("path.leaflet-interactive")).toHaveCount(3);
});

test("venue detail shows status, specs and 'Not confirmed' for unknowns", async ({ page }) => {
  await page.goto("/venues/sample-bravo-sports-complex");
  await expect(
    page.getByRole("heading", { level: 1, name: "SAMPLE Bravo Sports Complex" }),
  ).toBeVisible();
  await expect(page.getByText(/Verified 15 Aug 2026/)).toBeVisible();
  // Floodlights is confirmed false; spikes is unknown and must not read as "No".
  const row = (label: string) => page.locator("dl > div", { hasText: label });
  await expect(row("Floodlights").locator("dd")).toHaveText("No");
  await expect(row("Spikes allowed").locator("dd")).toHaveText("Not confirmed");
  await expect(page.getByRole("link", { name: "Directions" })).toHaveAttribute(
    "href",
    /google\.com\/maps\/dir/,
  );
});

test("unknown venue id returns 404", async ({ page }) => {
  const res = await page.goto("/venues/does-not-exist");
  expect(res?.status()).toBe(404);
});
