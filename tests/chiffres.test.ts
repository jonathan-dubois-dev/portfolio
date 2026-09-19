import { describe, it, expect } from "vitest";
import chiffres from "../src/data/chiffres.json";
import { chiffresSansSource, type Chiffre } from "../src/lib/verifier-contenu";

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
});
