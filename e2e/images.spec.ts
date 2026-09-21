import { test, expect } from "@playwright/test";
import { poidsPremiereVue } from "./lib/poids";

test("une page d'étude rend ses figures en WebP, lazy, avec alt et légende", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  const figs = page.locator("figure[data-figure]");
  expect(await figs.count()).toBeGreaterThanOrEqual(2);
  const img = figs.first().locator("img");
  await expect(img).toHaveAttribute("loading", "lazy");
  expect(await img.getAttribute("src")).toMatch(/\.webp/);
  // Ce test porte sur les figures de la galerie (alt substantiel, cf. tests/images.test.ts), pas sur
  // les vignettes de carte ci-dessous, qui sont décoratives et portent alt="" (M14).
  expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(10);
  await expect(figs.first().locator("figcaption")).not.toBeEmpty();
});

test("les sept cartes de l'accueil portent une vignette recadrée, décorative", async ({ page }) => {
  await page.goto("/");
  const vignettes = page.locator("#realisations article[data-carte] img");
  await expect(vignettes).toHaveCount(7);
  await expect(vignettes.first()).toHaveAttribute("loading", "lazy");
  // Décorative : le titre de la carte porte déjà le sens (M14) ; alt vide, pas d'assertion de longueur.
  await expect(vignettes.first()).toHaveAttribute("alt", "");
});

test("page d'étude : première vue < 1,2 Mo", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  const total = await poidsPremiereVue(page);
  expect(total).toBeLessThan(1_200_000);
});
