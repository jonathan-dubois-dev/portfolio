import { describe, it, expect } from "vitest";
import { NOEUDS, ARETES, TRAJETS, DEBUT_PULSE, PERIODE, SEUIL_ETROIT, MARGE, HAUTEUR, region, disposer, ease, pointBezier, impulsion, type Boite } from "../src/scripts/flux-geometrie";

/** Largeurs de texte de référence — l'ordre de grandeur réel des libellés en 12,5 px mono. */
const LARGEURS = [150, 200, 80, 90, 120, 110, 120];

describe("le graphe", () => {
  it("porte les sept briques réelles de l'estimateur, dans l'ordre, et rien d'autre", () => {
    expect(NOEUDS).toEqual([
      "Webhook /btp-estimation", "Notion · 55 prestations", "Compactage", "LLM · T = 0,2",
      "Garde-fous G1–G4", "Notion · Telegram", "Réponse au demandeur",
    ]);
  });
  it("chaque arête relie deux nœuds existants, chaque trajet suit des arêtes", () => {
    for (const [i, j] of ARETES) { expect(NOEUDS[i]).toBeDefined(); expect(NOEUDS[j]).toBeDefined(); }
    for (const t of TRAJETS) for (let k = 0; k < t.length - 1; k++)
      expect(ARETES.some(([i, j]) => i === t[k] && j === t[k + 1]), `${t[k]}→${t[k + 1]}`).toBe(true);
  });
});

describe("region", () => {
  it("étroit : toute la largeur moins les marges", () => {
    expect(region(390, 600, true)).toEqual({ x: 10, y: 12, w: 370, h: 576 });
    expect(SEUIL_ETROIT).toBe(900);
  });
  it("large : la colonne de droite démarre après le texte", () => {
    expect(region(1000, 700, false, 600)).toEqual({ x: 600, y: 70, w: 370, h: 560 });
  });
  it("large sans xMin est une erreur — jamais de largeur devinée", () => {
    expect(() => region(1000, 700, false)).toThrow("xMin requis pour la colonne de droite");
  });
});

describe("disposer", () => {
  const R = { x: 10, y: 12, w: 370, h: 576 };
  const B = disposer(LARGEURS, R);

  it("empile six rangées, 5 et 6 côte à côte", () => {
    const cys = [...new Set(B.map((b) => b.cy))];
    expect(cys.length).toBe(6);
    expect(B[5].cy).toBe(B[6].cy);
  });

  it("aucun libellé n'est rétréci : chaque boîte fait sa largeur + MARGE", () => {
    B.forEach((b, i) => expect(b.w, `boîte ${i}`).toBe(LARGEURS[i] + MARGE));
  });

  it("les rangées à une boîte sont centrées et descendent dans l'ordre", () => {
    for (const i of [0, 1, 2, 3, 4]) expect(Math.abs(B[i].cx - (R.x + R.w / 2)), `boîte ${i}`).toBeLessThan(1);
    for (const i of [0, 1, 2, 3, 4]) expect(B[i].cy, `boîte ${i}`).toBeLessThan(B[i + 1].cy);
  });

  it("les deux sorties du garde-fou encadrent le centre, sans se chevaucher", () => {
    expect(B[5].cx).toBeLessThan(B[6].cx);
    expect(B[5].cx + B[5].w / 2).toBeLessThanOrEqual(B[6].cx - B[6].w / 2 + 1e-6);
  });

  it("tout le graphe tient dans la région", () => {
    for (const b of B) {
      expect(b.cx - b.w / 2).toBeGreaterThanOrEqual(R.x - 1e-6);
      expect(b.cx + b.w / 2).toBeLessThanOrEqual(R.x + R.w + 1e-6);
    }
  });

  it("à 200 px, 5 et 6 se séparent : sept rangées", () => {
    const boites = disposer(LARGEURS, { x: 10, y: 12, w: 200, h: 576 });
    expect([...new Set(boites.map((b) => b.cy))].length).toBe(7);
  });

  it("les rangées sont régulièrement espacées", () => {
    const cys = [...new Set(B.map((b) => b.cy))].sort((a, b) => a - b);
    const pas = cys.slice(1).map((c, i) => c - cys[i]);
    for (const p of pas) expect(p).toBeCloseTo(R.h / cys.length, 6);
  });
});

describe("l'invariant de largeur", () => {
  it("sur cinquante régions, aucune boîte n'est plus étroite que son libellé", () => {
    let graine = 42;
    const alea = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
    for (let n = 0; n < 50; n++) {
      const w = 260 + alea() * 1140, h = 200 + alea() * 600;
      const boites = disposer(LARGEURS, { x: alea() * 100, y: 0, w, h });
      boites.forEach((b, i) => expect(b.w, `w=${w.toFixed(0)} boîte ${i}`).toBeGreaterThanOrEqual(LARGEURS[i] + MARGE - 1e-6));
    }
  });
});

describe("ease", () => {
  it("est bornée et monotone", () => {
    expect(ease(-1)).toBe(0); expect(ease(2)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(ease(0.25));
  });
});

describe("pointBezier", () => {
  const a: Boite = { cx: 100, cy: 100, w: 40, h: HAUTEUR }, b: Boite = { cx: 300, cy: 200, w: 60, h: HAUTEUR };
  it("part du dessous de a et arrive sur le dessus de b", () => {
    expect(pointBezier(a, b, 0)).toEqual({ x: 100, y: 100 + HAUTEUR / 2 });
    expect(pointBezier(a, b, 1)).toEqual({ x: 300, y: 200 - HAUTEUR / 2 });
  });
  it("descend toujours : y croît le long de la courbe", () => {
    for (let t = 0.1; t <= 1; t += 0.1) expect(pointBezier(a, b, t).y).toBeGreaterThan(pointBezier(a, b, t - 0.1).y);
  });
});

describe("impulsion", () => {
  const boites: Boite[] = NOEUDS.map((_, i) => ({ cx: 50, cy: 100 * i, w: 40, h: HAUTEUR }));
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
    expect(fin.y).toBeGreaterThan(debut.y);
  });
});
