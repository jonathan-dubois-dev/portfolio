import { test, expect } from "@playwright/test";

test("l'accueil répond 200 et porte le nom en h1", async ({ page }) => {
  const r = await page.goto("/");
  expect(r?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Jonathan Dubois");
});

test("404 personnalisée", async ({ page }) => {
  const r = await page.goto("/nimporte-quoi/");
  expect(r?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Cette page n'existe pas");
});

test("zéro erreur console sur l'accueil", async ({ page }) => {
  const erreurs: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(erreurs).toEqual([]);
});

for (const slug of ["pack-btp", "pack-therapeutes", "site-sages-femmes", "hub-sante", "studio-moonkura"]) {
  test(`/realisations/${slug}/ : titre, « ce que ça prouve », six sections, diagramme`, async ({ page }) => {
    const r = await page.goto(`/realisations/${slug}/`);
    expect(r?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-prouve]")).toBeVisible();
    await expect(page.locator("main h2")).toHaveText(["Contexte", "Ce que j'ai construit", "Preuves", "Un incident réel, et comment je l'ai réglé", "Stack"]);
    await expect(page.locator("figure.schema svg")).toHaveAttribute("role", "img");
  });
}

test("chaque page d'étude porte un badge", async ({ page }) => {
  const attendus: Record<string, string> = {
    "pack-btp": "Pack de démonstration, en service",
    "pack-therapeutes": "Pack de démonstration, en service",
    "site-sages-femmes": "En usage quotidien",
    "hub-sante": "Démonstrateur, en construction",
    "studio-moonkura": "En usage quotidien",
  };
  for (const [slug, texte] of Object.entries(attendus)) {
    await page.goto(`/realisations/${slug}/`);
    await expect(page.locator("[data-badge]")).toHaveCount(1);
    await expect(page.locator("[data-badge]")).toHaveText(texte);
    await expect(page.locator("[data-statut-ligne]")).toBeVisible();
  }
});
