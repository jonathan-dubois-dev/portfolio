/** Géométrie pure du hero « Le flux » — aucune dépendance au DOM, testée dans vitest. */
export type Noeud = { l: string; x: number; y: number };
export type Boite = { cx: number; cy: number; w: number; h: number };
export type Region = { x: number; y: number; w: number; h: number };

/** Les briques réelles du workflow d'estimation BTP (spec § 5). Coordonnées normalisées dans la région. */
export const NOEUDS: Noeud[] = [
  { l: "Webhook  /btp-estimation", x: 0.04, y: 0.5 },
  { l: "Catalogue Notion · 53 prestations", x: 0.22, y: 0.18 },
  { l: "Compactage", x: 0.4, y: 0.5 },
  { l: "LLM · T = 0,2", x: 0.55, y: 0.18 },
  { l: "Garde-fous G1–G4", x: 0.7, y: 0.5 },
  { l: "Notion · Telegram", x: 0.88, y: 0.22 },
  { l: "Réponse au client", x: 0.88, y: 0.78 },
];
export const ARETES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6]];
/** Les deux chemins que l'impulsion alterne. */
export const TRAJETS: number[][] = [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6]];

export const PAS = 190;          // ms entre deux apparitions de nœud
export const DUREE_ARETE = 320;  // ms pour tracer une arête
export const DEBUT_PULSE = 1700; // ms avant la première impulsion
export const PERIODE = 3400;     // ms pour parcourir un trajet
export const SEUIL_ETROIT = 760; // px : en dessous, le graphe passe sous le texte

export function region(W: number, H: number): Region {
  return W < SEUIL_ETROIT
    ? { x: 10, y: 12, w: W - 20, h: H - 24 }
    : { x: W * 0.44, y: H * 0.1, w: W * 0.53, h: H * 0.8 };
}

export function boite(n: Noeud, R: Region, largeurTexte: number): Boite {
  const w = Math.min(largeurTexte + 26, R.w * 0.5);
  return { cx: R.x + n.x * R.w, cy: R.y + n.y * R.h, w, h: 34 };
}

export function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
}

/** Point à t ∈ [0,1] sur la courbe qui sort du bord droit de a et entre par le bord gauche de b. */
export function pointBezier(a: Boite, b: Boite, t: number): { x: number; y: number } {
  const dx = Math.abs(b.cx - a.cx) * 0.5;
  const p0 = { x: a.cx + a.w / 2, y: a.cy }, p1 = { x: p0.x + dx, y: a.cy };
  const p3 = { x: b.cx - b.w / 2, y: b.cy }, p2 = { x: p3.x - dx, y: b.cy };
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
