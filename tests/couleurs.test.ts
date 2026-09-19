import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { JETONS } from "../src/data/jetons";
import { luminance, contraste } from "../src/lib/couleurs";

describe("contraste", () => {
  it("noir sur blanc vaut 21, blanc sur blanc vaut 1", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contraste("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
  it("luminance du blanc = 1, du noir = 0", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
    expect(luminance("#000000")).toBe(0);
  });
});

describe("les jetons du site", () => {
  it("encre, doux et accent passent AA sur le fond (≥ 4,5)", () => {
    expect(contraste(JETONS.encre, JETONS.fond)).toBeGreaterThanOrEqual(7);
    expect(contraste(JETONS.doux, JETONS.fond)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(JETONS.accent, JETONS.fond)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(JETONS.fond, JETONS.encre)).toBeGreaterThanOrEqual(7); // texte clair sur bouton plein
  });
  it("le trait fort passe le contraste des éléments non textuels (WCAG 1.4.11, ≥ 3)", () => {
    // Bordure du bouton creux et trait du graphe : ce sont des éléments d'interface, pas du texte.
    expect(contraste(JETONS.traitFort, JETONS.fond)).toBeGreaterThanOrEqual(3);
  });
  it("le vert du badge « en usage » passe AA sur le fond (≥ 4,5)", () => {
    expect(contraste("#1f7a4f", JETONS.fond)).toBeGreaterThanOrEqual(4.5);
  });
  it("global.css porte exactement les mêmes valeurs", () => {
    const css = readFileSync("src/styles/global.css", "utf8");
    for (const [nom, hex] of Object.entries(JETONS)) expect(css, nom).toContain(hex);
  });
  it("Base.astro déclare la couleur de barre du navigateur = le fond du site", () => {
    const base = readFileSync("src/layouts/Base.astro", "utf8");
    expect(base).toContain(`name="theme-color" content="${JETONS.fond}"`);
  });
});
