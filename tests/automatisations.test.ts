import { describe, it, expect } from "vitest";
import { automatisations, METIERS, comptes, parMetier } from "../src/data/automatisations";
import { INTERDITS, PERSONAS, motsInterdits, regleClient } from "../src/lib/verifier-contenu";

const ATTENDU = { total: 100, actifs: 93, parMetier: { btp: 29, therapeutes: 37, immo: 12, sagesfemmes: 6, hub: 5, interne: 11 } };

describe("l'inventaire des automatisations", () => {
  it("compte 100 workflows dont 93 actifs, répartis comme l'export du 19/09/2026", () => {
    expect(comptes()).toEqual(ATTENDU);
  });
  it("a des identifiants n8n uniques et bien formés", () => {
    const ids = automatisations.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9]{16}$/);
  });
  it("chaque ligne est complète, française, sans persona ni mot interdit, et respecte la règle client", () => {
    for (const a of automatisations) {
      expect(["btp", "therapeutes", "immo", "sagesfemmes", "hub", "interne"], a.id).toContain(a.metier);
      expect(["cron", "webhook", "telegram", "formulaire", "cockpit", "sous-workflow"], a.id).toContain(a.declencheur);
      expect(a.nom.length, a.id).toBeGreaterThanOrEqual(6);
      expect(a.nom, a.id).not.toMatch(/^Aelto|^Camille —|^Immo —|^À chaque étape —|^Hub santé —/);
      expect(a.action.length, a.id).toBeGreaterThanOrEqual(20);
      expect(a.action.length, a.id).toBeLessThanOrEqual(140);
      const texte = `${a.nom} ${a.action}`;
      expect(motsInterdits(texte, [...INTERDITS, ...PERSONAS]), a.id).toEqual([]);
      expect(regleClient(texte), a.id).toEqual([]);
    }
  });
  it("METIERS porte un titre, un statut et un ordre unique par métier", () => {
    const ordres = Object.values(METIERS).map((m) => m.ordre).sort();
    expect(ordres).toEqual([1, 2, 3, 4, 5, 6]);
    expect(METIERS.btp.statut).toBe("demo");
    expect(METIERS.sagesfemmes.statut).toBe("usage");
    expect(METIERS.interne.statut).toBe("usage");
    expect(METIERS.hub.statut).toBe("demonstrateur");
  });
  it("parMetier regroupe sans perdre une ligne", () => {
    const groupes = parMetier();
    expect(Object.values(groupes).reduce((n, g) => n + g.length, 0)).toBe(100);
  });
});
