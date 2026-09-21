import { describe, it, expect } from "vitest";
import chiffres from "../src/data/chiffres.json";
import { chiffresSansSource, type Chiffre } from "../src/lib/verifier-contenu";
import { comptes } from "../src/data/automatisations";

describe("les chiffres de l'accueil", () => {
  it("sont exactement trois", () => {
    expect(chiffres).toHaveLength(3);
  });
  it("portent chacun une source nommée", () => {
    expect(chiffresSansSource(chiffres as Chiffre[])).toEqual([]);
  });
  it("chiffresSansSource nomme le chiffre fautif", () => {
    const faux: Chiffre[] = [{ valeur: "12", libelle: "choses", source: "" }, { valeur: "3", libelle: "trucs", source: "dépôt X, relevé le 19/09/2026" }];
    expect(chiffresSansSource(faux)).toEqual(["12 choses"]);
  });
  it("le chiffre des workflows dit exactement les comptes de l'inventaire", () => {
    const c = comptes();
    expect(chiffres[0].valeur).toBe(`${c.total} · ${c.actifs} actifs`);
    expect(chiffres[0].libelle).toBe("workflows n8n construits");
  });
  it("le chiffre des applications est le nombre de noms de sa source", () => {
    expect(chiffres[2].valeur).toBe(String(chiffres[2].source.split("·").length));
    expect(chiffres[2].source).toContain("lab-effets.expertia059.workers.dev");
  });
  it("le chiffre des tests est la somme écrite dans sa source, arrondie vers le bas", () => {
    const nombres = [...chiffres[1].source.matchAll(/(\d[\d ]*\d|\d) (?:vitest|e2e|pytest)/g)].map((m) => Number(m[1].replace(/ /g, "")));
    const somme = nombres.reduce((s, n) => s + n, 0);
    expect(chiffres[1].source).toContain(`somme ${somme.toLocaleString("fr-FR")}`);
    expect(chiffres[1].valeur).toBe(`${Math.floor(somme / 1000)} 000+`);
  });
});
