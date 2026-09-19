/** Géométrie pure du hero « Le flux » — aucune dépendance au DOM, testée dans vitest. */
export type Boite = { cx: number; cy: number; w: number; h: number };
export type Region = { x: number; y: number; w: number; h: number };
export type Mode = "large" | "etroit";
export type Disposition = { boites: Boite[]; mode: Mode };

/** Les briques réelles du workflow d'estimation BTP (spec § 5). Les positions se calculent,
 *  elles ne sont plus écrites à la main : un libellé n'a qu'un libellé. */
export const NOEUDS: string[] = [
  "Webhook /btp-estimation",
  "Notion · 53 prestations",
  "Compactage",
  "LLM · T = 0,2",
  "Garde-fous G1–G4",
  "Notion · Telegram",
  "Réponse au client",
];
export const ARETES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6]];
/** Les deux chemins que l'impulsion alterne. */
export const TRAJETS: number[][] = [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6]];

export const PAS = 190;          // ms entre deux apparitions de nœud
export const DUREE_ARETE = 320;  // ms pour tracer une arête
export const DEBUT_PULSE = 1700; // ms avant la première impulsion
export const PERIODE = 3400;     // ms pour parcourir un trajet
export const SEUIL_ETROIT = 760; // px : le SEUL seuil, partagé avec la media query du Hero

export const ECART = 24;    // px entre deux boîtes d'une même rangée
export const MARGE = 26;    // px ajoutés à la largeur du texte
export const HAUTEUR = 34;  // px : hauteur d'une boîte

/** `etroit` est le même signal booléen que le CSS (`matchMedia`), jamais une largeur de canvas :
 *  le canvas est étroit sur un grand écran dès que la colonne de texte prend la moitié gauche. */
export function region(W: number, H: number, etroit: boolean, xMin?: number): Region {
  if (etroit) return { x: 10, y: 12, w: W - 20, h: H - 24 };
  if (xMin === undefined) throw new Error("xMin requis en mode large");
  return { x: xMin, y: H * 0.1, w: W - xMin - W * 0.03, h: H * 0.8 };
}

/** Rangée de chaque nœud : 0 = milieu, 1 = haut, 2 = bas. */
const RANGEE_DE = [0, 1, 0, 1, 0, 1, 2];
const RANGEE_Y = [0.5, 0.2, 0.8];

/** Place les sept boîtes. Invariant : une boîte fait toujours `largeur + MARGE`, sauf si
 *  cette valeur dépasse la région (seul cas où le rendu tronque un libellé).
 *  Essai « large » d'abord — trois rangées, positions glissées le long de la séquence pour que
 *  x croisse toujours ; s'il ne tient pas, repli « étroit » — une colonne de rangées empilées. */
export function disposer(largeurs: number[], R: Region): Disposition {
  const w = largeurs.map((l) => l + MARGE);
  const cx = new Array<number>(7).fill(0);
  const right = (i: number) => cx[i] + w[i] / 2;

  cx[0] = R.x + w[0] / 2;
  for (let i = 1; i <= 5; i++) {
    // La boîte suivante démarre au centre de la précédente (rangée différente, chevauchement en x
    // permis) et jamais avant le bord droit + ECART de la boîte d'avant de la MÊME rangée.
    const mini = i >= 2 ? Math.max(cx[i - 1], right(i - 2) + ECART) : cx[i - 1];
    cx[i] = w[i] / 2 + mini;
  }
  cx[6] = Math.max(cx[5], cx[4] + w[6] / 2);

  const L = Math.max(...cx.map((_, i) => right(i))) - R.x;
  if (L <= R.w) {
    const decalage = (R.w - L) / 2;
    return {
      boites: cx.map((x, i) => ({ cx: x + decalage, cy: R.y + RANGEE_Y[RANGEE_DE[i]] * R.h, w: w[i], h: HAUTEUR })),
      mode: "large",
    };
  }

  // Repli étroit : les rangées suivent la séquence ; 5 et 6 partagent la dernière si elles tiennent.
  const rangees: number[][] = w[5] + w[6] + ECART > R.w
    ? [[0], [1], [2], [3], [4], [5], [6]]
    : [[0], [1], [2], [3], [4], [5, 6]];
  const n = rangees.length;
  const boites: Boite[] = largeurs.map(() => ({ cx: 0, cy: 0, w: 0, h: HAUTEUR }));
  rangees.forEach((rangee, r) => {
    const ws = rangee.map((i) => Math.min(w[i], R.w));
    const totale = ws.reduce((a, b) => a + b, 0) + ECART * (rangee.length - 1);
    let x = R.x + (R.w - totale) / 2;
    rangee.forEach((i, j) => {
      boites[i].w = ws[j];
      boites[i].cx = x + ws[j] / 2;
      boites[i].cy = R.y + ((r + 0.5) * R.h) / n;
      x += ws[j] + ECART;
    });
  });
  return { boites, mode: "etroit" };
}

export function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
}

/** Point à t ∈ [0,1] sur la courbe qui relie a à b : de flanc à flanc en large,
 *  de dessous à dessus en étroit, où les rangées sont empilées. */
export function pointBezier(a: Boite, b: Boite, t: number, mode: Mode): { x: number; y: number } {
  let p0, p1, p2, p3;
  if (mode === "etroit") {
    const dy = Math.abs(b.cy - a.cy) * 0.5;
    p0 = { x: a.cx, y: a.cy + HAUTEUR / 2 }; p1 = { x: a.cx, y: p0.y + dy };
    p3 = { x: b.cx, y: b.cy - HAUTEUR / 2 }; p2 = { x: b.cx, y: p3.y - dy };
  } else {
    const dx = Math.abs(b.cx - a.cx) * 0.5;
    p0 = { x: a.cx + a.w / 2, y: a.cy }; p1 = { x: p0.x + dx, y: a.cy };
    p3 = { x: b.cx - b.w / 2, y: b.cy }; p2 = { x: p3.x - dx, y: b.cy };
  }
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Position de l'impulsion à l'instant t (ms depuis le départ), ou null avant DEBUT_PULSE. */
export function impulsion(t: number, boites: Boite[], mode: Mode): { x: number; y: number; trajet: number } | null {
  if (t < DEBUT_PULSE) return null;
  const cycle = Math.floor((t - DEBUT_PULSE) / PERIODE);
  const ph = ((t - DEBUT_PULSE) % PERIODE) / PERIODE;
  const trajet = cycle % 2, traj = TRAJETS[trajet], seg = traj.length - 1;
  const s = Math.min(seg - 1e-6, ph * seg), i = Math.floor(s), f = s - i;
  const p = pointBezier(boites[traj[i]], boites[traj[i + 1]], f, mode);
  return { x: p.x, y: p.y, trajet };
}
