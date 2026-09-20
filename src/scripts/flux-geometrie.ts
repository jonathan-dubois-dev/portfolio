/** Géométrie pure du hero « Le flux » — aucune dépendance au DOM, testée dans vitest. */
export type Boite = { cx: number; cy: number; w: number; h: number };
export type Region = { x: number; y: number; w: number; h: number };

/** Les briques réelles du workflow d'estimation BTP (spec § 5). Les positions se calculent,
 *  elles ne sont plus écrites à la main : un libellé n'a qu'un libellé. */
export const NOEUDS: string[] = [
  "Webhook /btp-estimation",
  "Notion · 53 prestations",
  "Compactage",
  "LLM · T = 0,2",
  "Garde-fous G1–G4",
  "Notion · Telegram",
  "Réponse au demandeur",
];
export const ARETES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6]];
/** Les deux chemins que l'impulsion alterne. */
export const TRAJETS: number[][] = [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6]];

export const PAS = 190;          // ms entre deux apparitions de nœud
export const DUREE_ARETE = 320;  // ms pour tracer une arête
export const DEBUT_PULSE = 1700; // ms avant la première impulsion
export const PERIODE = 3400;     // ms pour parcourir un trajet
/** px : le SEUL seuil de largeur. La media query de `Hero.astro` porte la même valeur, et un test
 *  compare les deux fichiers — en dessous, le graphe passe sous le texte ; au-dessus, à sa droite. */
export const SEUIL_ETROIT = 900;

export const ECART = 24;    // px entre deux boîtes d'une même rangée
export const MARGE = 26;    // px ajoutés à la largeur du texte
export const HAUTEUR = 34;  // px : hauteur d'une boîte

/** `etroit` est le même signal booléen que le CSS (`matchMedia`), jamais une largeur de canvas :
 *  sous le seuil le graphe occupe toute la toile, au-dessus il tient dans la colonne de droite,
 *  qui commence après le texte — d'où `xMin`, obligatoire, jamais deviné. */
export function region(W: number, H: number, etroit: boolean, xMin?: number): Region {
  if (etroit) return { x: 10, y: 12, w: W - 20, h: H - 24 };
  if (xMin === undefined) throw new Error("xMin requis pour la colonne de droite");
  return { x: xMin, y: H * 0.1, w: W - xMin - W * 0.03, h: H * 0.8 };
}

/** Empile les sept boîtes dans l'ordre de la séquence, une rangée par nœud — sauf 5 et 6, les deux
 *  sorties du même garde-fou, qui partagent la dernière rangée quand elles y tiennent.
 *  Invariant : une boîte fait toujours `largeur + MARGE` ; elle n'est rétrécie que si cette valeur
 *  dépasse la région, seul cas où le rendu tronque un libellé. */
export function disposer(largeurs: number[], R: Region): Boite[] {
  const w = largeurs.map((l) => l + MARGE);
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
  return boites;
}

export function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
}

/** Point à t ∈ [0,1] sur la courbe qui descend du bas-centre de a au haut-centre de b,
 *  poignées verticales : les rangées sont empilées, le flux se lit de haut en bas. */
export function pointBezier(a: Boite, b: Boite, t: number): { x: number; y: number } {
  const dy = Math.abs(b.cy - a.cy) * 0.5;
  const p0 = { x: a.cx, y: a.cy + HAUTEUR / 2 }, p1 = { x: a.cx, y: p0.y + dy };
  const p3 = { x: b.cx, y: b.cy - HAUTEUR / 2 }, p2 = { x: b.cx, y: p3.y - dy };
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Position de l'impulsion à l'instant t (ms depuis le départ), ou null avant DEBUT_PULSE. */
export function impulsion(t: number, boites: Boite[]): { x: number; y: number; trajet: number } | null {
  if (t < DEBUT_PULSE) return null;
  const cycle = Math.floor((t - DEBUT_PULSE) / PERIODE);
  const ph = ((t - DEBUT_PULSE) % PERIODE) / PERIODE;
  const trajet = cycle % 2, traj = TRAJETS[trajet], seg = traj.length - 1;
  const s = Math.min(seg - 1e-6, ph * seg), i = Math.floor(s), f = s - i;
  const p = pointBezier(boites[traj[i]], boites[traj[i + 1]], f);
  return { x: p.x, y: p.y, trajet };
}
