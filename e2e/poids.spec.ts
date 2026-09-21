import { test, expect } from "@playwright/test";
import { poidsPremiereVue } from "./lib/poids";

test("première vue de l'accueil < 350 Ko, aucune requête tierce", async ({ page }) => {
  await page.goto("/");
  const total = await poidsPremiereVue(page);
  const { tiers, polices } = await page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return {
      tiers: rs.map((r) => r.name).filter((n) => !n.startsWith(location.origin)),
      polices: rs.map((r) => r.name).filter((n) => n.endsWith(".woff2")).length,
    };
  });
  expect(tiers).toEqual([]);
  // Les vignettes de carte sont désormais recadrées (640×400) : la première vue tombe sous 350 Ko.
  // Un dépassement serait une régression de poids, pas une excuse pour relever le seuil.
  expect(total).toBeLessThan(350_000);
  // Quatre fichiers woff2 sont réellement chargés à la première vue depuis la fusion des blocs
  // IBM Plex Sans 400/600. Le seuil colle à la mesure : un cinquième fichier serait une régression.
  expect(polices).toBeLessThanOrEqual(4);
});

test("première vue de /automatisations/ < 1 Mo", async ({ page }) => {
  await page.goto("/automatisations/");
  const total = await poidsPremiereVue(page);
  expect(total).toBeLessThan(1_000_000);
});

test("les vignettes de l'accueil, toutes chargées, tiennent sous 200 Ko", async ({ page, request }) => {
  await page.goto("/");
  const srcs = await page.locator("img[src^='/_astro/']").evaluateAll((els) => els.map((i) => i.getAttribute("src")!));
  expect(srcs.length).toBe(15); // 7 études + 7 cartes + portrait
  let total = 0;
  for (const s of srcs) total += (await (await request.get(s)).body()).length;
  expect(total).toBeLessThan(200_000); // mesuré 164 098 le 21/09/2026
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
