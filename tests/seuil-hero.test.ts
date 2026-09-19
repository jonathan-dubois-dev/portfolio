import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { SEUIL_ETROIT } from "../src/scripts/flux-geometrie";

/** Le hero bascule d'une mise en page à l'autre sur UN seuil, déclaré à trois endroits :
 *  la media query de Hero.astro, le matchMedia de flux.ts, et SEUIL_ETROIT.
 *  Les trois désaccordés, le CSS empile le graphe sous le texte pendant que le JS le dessine
 *  encore dans la colonne de droite — c'est exactement le défaut qui tronquait les libellés. */
const hero = readFileSync("src/components/Hero.astro", "utf8");
const flux = readFileSync("src/scripts/flux.ts", "utf8");

const seuilDe = (source: string, quoi: string) => {
  const m = /\(max-width:\s*(\d+)px\)/.exec(source);
  expect(m, `aucun seuil (max-width:…px) trouvé dans ${quoi}`).not.toBeNull();
  return Number(m![1]);
};

describe("le seuil du hero", () => {
  it("vaut 900 px dans Hero.astro", () => {
    expect(hero).toContain("(max-width:900px)");
    expect(seuilDe(hero, "Hero.astro")).toBe(900);
  });

  it("vaut 900 px dans flux.ts", () => {
    expect(flux).toContain("(max-width:900px)");
    expect(seuilDe(flux, "flux.ts")).toBe(900);
  });

  it("est le même des deux côtés, et c'est SEUIL_ETROIT", () => {
    expect(seuilDe(flux, "flux.ts")).toBe(seuilDe(hero, "Hero.astro"));
    expect(SEUIL_ETROIT).toBe(seuilDe(hero, "Hero.astro"));
  });
});
