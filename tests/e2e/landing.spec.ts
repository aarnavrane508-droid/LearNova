import { expect, test } from "@playwright/test";

test("landing page describes the phase and supports section navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Coolearn/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Your pace.");
  await expect(page.getByText("A new way to grow · In development")).toBeVisible();
  await page.getByRole("link", { name: "Explore the vision" }).click();
  await expect(page).toHaveURL(/#experience$/);
  await expect(page.getByRole("heading", { name: "Less guesswork. More understanding." })).toBeInViewport();
  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fitsViewport).toBe(true);
  expect(errors).toEqual([]);
});

test("unknown routes offer a working return link", async ({ page }) => {
  const response = await page.goto("/missing-page");
  expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL("/");
});

test("mobile navigation is usable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The desktop uses an always-visible navigation.");
  await page.goto("/");
  await page.getByLabel("Open navigation").click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Our roadmap" }).click();
  await expect(page).toHaveURL(/#roadmap$/);
});
