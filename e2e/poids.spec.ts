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
  // quand même à la première vue (constaté à l'exécution) : seuil relevé à 5 comme prévu par la tâche
  // (fix round 1 : la fusion des blocs IBM Plex Sans 400/600 ramène le compte mesuré à 4, mais le
  // seuil reste à 5 pour ne pas re-casser le test si Chromium change à nouveau de comportement).
  expect(polices).toBeLessThanOrEqual(5);
});

test("le contenu n'emploie aucun caractère hors de la plage latin des polices", async ({ page }) => {
  for (const u of ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"]) {
    await page.goto(u);
    const texte = await page.evaluate(() => document.body.innerText);
    expect(texte, u).not.toMatch(/[œŒ]/);
  }
});

test("le semi-gras est plus large que le regular", async ({ page }) => {
  await page.goto("/");
  const { largeur400, largeur600 } = await page.evaluate(async () => {
    await document.fonts.ready;
    const texte = "Jonathan Dubois portfolio automatisation";
    function largeur(poids: number) {
      const s = document.createElement("span");
      s.style.position = "absolute";
      s.style.visibility = "hidden";
      s.style.whiteSpace = "nowrap";
      s.style.font = `${poids} 20px "IBM Plex Sans"`;
      s.textContent = texte;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    }
    return { largeur400: largeur(400), largeur600: largeur(600) };
  });
  expect(largeur400).toBeGreaterThan(0);
  expect(largeur600).toBeGreaterThan(0);
  expect(largeur600).toBeGreaterThan(largeur400);
});
