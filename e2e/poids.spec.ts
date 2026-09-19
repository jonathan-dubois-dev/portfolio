import { test, expect } from "@playwright/test";

test("première vue de l'accueil < 1 Mo, aucune requête tierce", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const { total, tiers, polices } = await page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      total: nav.transferSize + rs.reduce((s, r) => s + r.transferSize, 0),
      tiers: rs.map((r) => r.name).filter((n) => !n.startsWith(location.origin)),
      polices: rs.map((r) => r.name).filter((n) => n.endsWith(".woff2")).length,
    };
  });
  expect(tiers).toEqual([]);
  expect(total).toBeLessThan(1_000_000);
  // Plex Mono 500 n'est pas employé sur l'accueil hors canvas, mais Chromium le télécharge
  // quand même à la première vue (constaté à l'exécution) : seuil relevé à 5 comme prévu par la tâche.
  expect(polices).toBeLessThanOrEqual(5);
});

test("le contenu n'emploie aucun caractère hors de la plage latin des polices", async ({ page }) => {
  for (const u of ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"]) {
    await page.goto(u);
    const texte = await page.evaluate(() => document.body.innerText);
    expect(texte, u).not.toMatch(/[œŒ]/);
  }
});
