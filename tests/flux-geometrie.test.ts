import { describe, it, expect } from "vitest";
import { NOEUDS, ARETES, TRAJETS, DEBUT_PULSE, PERIODE, SEUIL_ETROIT, region, boite, ease, pointBezier, impulsion, type Boite } from "../src/scripts/flux-geometrie";

describe("le graphe", () => {
  it("porte les sept briques réelles de l'estimateur, dans l'ordre", () => {
    expect(NOEUDS.map((n) => n.l)).toEqual([
      "Webhook  /btp-estimation", "Catalogue Notion · 53 prestations", "Compactage", "LLM · T = 0,2",
      "Garde-fous G1–G4", "Notion · Telegram", "Réponse au client",
    ]);
  });
  it("chaque arête relie deux nœuds existants, chaque trajet suit des arêtes", () => {
    for (const [i, j] of ARETES) { expect(NOEUDS[i]).toBeDefined(); expect(NOEUDS[j]).toBeDefined(); }
    for (const t of TRAJETS) for (let k = 0; k < t.length - 1; k++)
      expect(ARETES.some(([i, j]) => i === t[k] && j === t[k + 1]), `${t[k]}→${t[k + 1]}`).toBe(true);
  });
});

describe("region", () => {
  it("bureau : les 53 % de droite", () => {
    expect(region(1000, 700)).toEqual({ x: 440, y: 70, w: 530, h: 560 });
  });
  it("téléphone : toute la largeur moins les marges", () => {
    expect(region(390, 600)).toEqual({ x: 10, y: 12, w: 370, h: 576 });
    expect(SEUIL_ETROIT).toBe(760);
  });
});

describe("boite", () => {
  it("prend la largeur du texte plus 26, plafonnée à la moitié de la région", () => {
    const R = { x: 0, y: 0, w: 400, h: 300 };
    expect(boite({ l: "x", x: 0.5, y: 0.5 }, R, 100)).toEqual({ cx: 200, cy: 150, w: 126, h: 34 });
    expect(boite({ l: "x", x: 0.5, y: 0.5 }, R, 900).w).toBe(200);
  });
});

describe("ease", () => {
  it("est bornée et monotone", () => {
    expect(ease(-1)).toBe(0); expect(ease(2)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(ease(0.25));
  });
});

describe("pointBezier", () => {
  const a: Boite = { cx: 100, cy: 100, w: 40, h: 34 }, b: Boite = { cx: 300, cy: 200, w: 60, h: 34 };
  it("part du bord droit de a et arrive au bord gauche de b", () => {
    expect(pointBezier(a, b, 0)).toEqual({ x: 120, y: 100 });
    expect(pointBezier(a, b, 1)).toEqual({ x: 270, y: 200 });
  });
});

describe("impulsion", () => {
  const boites: Boite[] = NOEUDS.map((n, i) => ({ cx: 100 * i, cy: 50, w: 40, h: 34 }));
  it("n'existe pas avant DEBUT_PULSE", () => {
    expect(impulsion(DEBUT_PULSE - 1, boites)).toBeNull();
  });
  it("alterne les deux trajets d'un cycle à l'autre", () => {
    expect(impulsion(DEBUT_PULSE, boites)?.trajet).toBe(0);
    expect(impulsion(DEBUT_PULSE + PERIODE, boites)?.trajet).toBe(1);
    expect(impulsion(DEBUT_PULSE + 2 * PERIODE, boites)?.trajet).toBe(0);
  });
  it("avance le long du trajet pendant la période", () => {
    const debut = impulsion(DEBUT_PULSE + 10, boites)!, fin = impulsion(DEBUT_PULSE + PERIODE - 10, boites)!;
    expect(fin.x).toBeGreaterThan(debut.x);
  });
});
