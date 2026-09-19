import { describe, it, expect } from "vitest";
import { NOEUDS, ARETES, TRAJETS, DEBUT_PULSE, PERIODE, SEUIL_ETROIT, RANGEES, RANGEE_Y, ECART, region, disposer, ease, pointBezier, impulsion, type Boite } from "../src/scripts/flux-geometrie";

describe("le graphe", () => {
  it("porte les sept briques réelles de l'estimateur, dans l'ordre", () => {
    expect(NOEUDS.map((n) => n.l)).toEqual([
      "Webhook  /btp-estimation", "Notion · 53 prestations", "Compactage", "LLM · T = 0,2",
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
  it("bureau, xMin donné : démarre après le texte", () => {
    expect(region(1000, 700, 600)).toEqual({ x: 600, y: 70, w: 370, h: 560 });
  });
  it("téléphone : toute la largeur moins les marges", () => {
    expect(region(390, 600)).toEqual({ x: 10, y: 12, w: 370, h: 576 });
    expect(SEUIL_ETROIT).toBe(760);
  });
});

describe("disposer", () => {
  const R = { x: 100, y: 0, w: 600, h: 300 };
  const largeurs = [150, 250, 80, 90, 120, 110, 120];

  it("range chaque rangée sans chevauchement, à l'intérieur de la région", () => {
    const B = disposer(largeurs, R);
    for (const rangee of [RANGEES[0], RANGEES[1]]) {
      const tries = [...rangee].sort((a, b) => B[a].cx - B[b].cx);
      for (let k = 0; k < tries.length - 1; k++) {
        const a = B[tries[k]], b = B[tries[k + 1]];
        expect(a.cx + a.w / 2 + ECART).toBeLessThanOrEqual(b.cx - b.w / 2 + 1e-6);
      }
      for (const i of rangee) {
        expect(B[i].cx - B[i].w / 2).toBeGreaterThanOrEqual(R.x - 1e-6);
        expect(B[i].cx + B[i].w / 2).toBeLessThanOrEqual(R.x + R.w + 1e-6);
      }
    }
  });

  it("rétrécit une rangée trop large pour tenir exactement dans la largeur", () => {
    const Retroit = { x: 100, y: 0, w: 300, h: 300 };
    const B = disposer(largeurs, Retroit);
    const rangee = RANGEES[0];
    const sommeW = rangee.reduce((s, i) => s + B[i].w, 0);
    expect(sommeW + ECART * (rangee.length - 1)).toBeCloseTo(300, 5);
    const tries = [...rangee].sort((a, b) => B[a].cx - B[b].cx);
    for (let k = 0; k < tries.length - 1; k++) {
      const a = B[tries[k]], b = B[tries[k + 1]];
      expect(a.cx + a.w / 2 + ECART).toBeLessThanOrEqual(b.cx - b.w / 2 + 1e-6);
    }
  });

  it("le nœud 6 s'aligne sous le nœud 5 et reste dans la région", () => {
    const B = disposer(largeurs, R);
    expect(B[6].cy).toBe(R.y + 0.8 * R.h);
    expect(B[6].cx).toBe(B[5].cx);
    expect(B[6].cx + B[6].w / 2).toBeLessThanOrEqual(R.x + R.w + 1e-6);

    const Retroit = { x: 0, y: 0, w: 120, h: 300 };
    const Betroit = disposer(largeurs, Retroit);
    expect(Betroit[6].cx + Betroit[6].w / 2).toBeLessThanOrEqual(Retroit.x + Retroit.w + 1e-6);
  });

  it("chaque rangée est à l'ordonnée attendue", () => {
    const B = disposer(largeurs, R);
    RANGEES.forEach((rangee, r) => {
      for (const i of rangee) expect(B[i].cy).toBe(R.y + RANGEE_Y[r] * R.h);
    });
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
