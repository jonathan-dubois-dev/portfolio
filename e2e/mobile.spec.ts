import { test, expect } from "@playwright/test";

const PAGES = ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"];

for (const u of PAGES) {
  test(`téléphone 390 px : ${u} ne défile pas horizontalement`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test("toutes les cibles cliquables font au moins 44 px de haut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trop = await page.evaluate(() =>
    [...document.querySelectorAll("a.bouton")].map((a) => a.getBoundingClientRect().height).filter((h) => h < 44),
  );
  expect(trop).toEqual([]);
});

test("le focus clavier est visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab"); // lien d'évitement
  await page.keyboard.press("Tab");
  const contour = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(contour).not.toBe("none");
});

test("le lien d'évitement mène au contenu", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("a.evitement")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenu$/);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("contenu");
});

test("bureau : le graphe ne mord jamais sur la colonne de texte", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForTimeout(2600);
  const limite = await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>("canvas[data-flux]")!;
    const t = document.querySelector<HTMLElement>("[data-hero] .texte")!;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const dpr = c.width / c.getBoundingClientRect().width;
    let premiere = c.width;
    for (let x = 0; x < c.width && premiere === c.width; x++)
      for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 0) { premiere = x; break; }
    return {
      premiere: premiere / dpr,
      bord: t.getBoundingClientRect().right - c.getBoundingClientRect().left,
      largeur: c.getBoundingClientRect().width,
    };
  });
  expect(limite.premiere).toBeLessThan(limite.largeur);
  expect(limite.premiere).toBeGreaterThanOrEqual(limite.bord);
});
