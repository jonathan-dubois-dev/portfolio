import { test, expect } from "@playwright/test";

test("une page d'étude rend ses figures en WebP, lazy, avec alt et légende", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  const figs = page.locator("figure[data-figure]");
  expect(await figs.count()).toBeGreaterThanOrEqual(2);
  const img = figs.first().locator("img");
  await expect(img).toHaveAttribute("loading", "lazy");
  expect(await img.getAttribute("src")).toMatch(/\.webp/);
  expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(10);
  await expect(figs.first().locator("figcaption")).not.toBeEmpty();
});

test("les cartes de l'accueil portent une vignette", async ({ page }) => {
  await page.goto("/");
  const vignettes = page.locator("#realisations article[data-carte] img");
  expect(await vignettes.count()).toBe(await page.locator("#realisations article[data-carte]").count());
  await expect(vignettes.first()).toHaveAttribute("loading", "lazy");
});

test("page d'étude : première vue < 1,2 Mo", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  await page.waitForLoadState("networkidle");
  const total = await page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return nav.transferSize + rs.reduce((s, r) => s + r.transferSize, 0);
  });
  expect(total).toBeLessThan(1_200_000);
});
