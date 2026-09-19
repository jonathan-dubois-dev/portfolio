import { test, expect } from "@playwright/test";

declare global { interface Window { __fluxImages?: number } }

async function pixelsDessines(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>("canvas[data-flux]")!;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
}

test("le hero porte le nom, les deux titres, la ligne, la ville et deux appels", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await expect(hero.locator("h1")).toHaveText("Jonathan Dubois");
  await expect(hero.locator("[data-titres]")).toContainText("Ingénieur automatisation IA");
  await expect(hero.locator("[data-titres]")).toContainText("Creative technologist");
  await expect(hero.locator("[data-meta]")).toContainText("Toulouse");
  await expect(hero.locator("a.bouton")).toHaveCount(2);
  await expect(hero.locator("a.bouton.plein")).toHaveAttribute("href", "#realisations");
  await expect(hero.locator("a.bouton.creux")).toHaveAttribute("href", "#contact");
});

test("sans JavaScript, le texte du hero est intact", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-hero] h1")).toBeVisible();
  await expect(page.locator("[data-hero] a.bouton")).toHaveCount(2);
  await ctx.close();
});

test("le graphe est dessiné et l'impulsion circule", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2600);
  expect(await pixelsDessines(page)).toBeGreaterThan(2000);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(600);
  const b = await page.evaluate(() => window.__fluxImages);
  expect(b).toBeGreaterThan(a!);
});

test("mouvement réduit : graphe fini, une seule image", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(1200);
  expect(await pixelsDessines(page)).toBeGreaterThan(2000);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__fluxImages)).toBe(a);
  expect(a).toBe(1);
  await ctx.close();
});

test("hors écran, la boucle s'arrête ; elle repart au retour", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__fluxImages)).toBe(a);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => window.__fluxImages)).toBeGreaterThan(a!);
});

test("téléphone : le graphe passe sous le texte", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const texte = await page.locator("[data-hero] .texte").boundingBox();
  const toile = await page.locator("canvas[data-flux]").boundingBox();
  expect(toile!.y).toBeGreaterThanOrEqual(texte!.y + texte!.height - 1);
});
