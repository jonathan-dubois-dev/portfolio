import { NOEUDS, ARETES, PAS, DUREE_ARETE, HAUTEUR, SEUIL_ETROIT, ease, region, disposer, pointBezier, impulsion, type Boite, type Mode } from "./flux-geometrie";

const ENCRE = "#14161c", TRAIT = "#a39d94", FOND = "#f7f5f2", ACCENT = "#2447e0";
const POLICE = '500 12.5px "IBM Plex Mono", ui-monospace, monospace';
const ETROIT = matchMedia(`(max-width:${SEUIL_ETROIT}px)`);

declare global { interface Window { __fluxImages?: number; __fluxTronques?: number } }

function ajuster(cv: HTMLCanvasElement) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, W: r.width, H: r.height };
}

/** Tête de flèche de 6 px à l'entrée de b, orientée par la tangente de fin de courbe. */
function fleche(ctx: CanvasRenderingContext2D, a: Boite, b: Boite, mode: Mode) {
  const q = pointBezier(a, b, 0.96, mode), p = pointBezier(a, b, 1, mode);
  const ang = Math.atan2(p.y - q.y, p.x - q.x), T = 6;
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-T, T * 0.45); ctx.lineTo(-T, -T * 0.45); ctx.closePath();
  ctx.fillStyle = TRAIT; ctx.fill(); ctx.restore();
}

function dessiner(cv: HTMLCanvasElement, t: number, reduit: boolean, xMin: number | undefined) {
  const { ctx, W, H } = ajuster(cv);
  ctx.clearRect(0, 0, W, H);
  const etroit = ETROIT.matches;
  const R = region(W, H, etroit, etroit ? undefined : xMin);
  ctx.font = POLICE;
  const { boites: B, mode } = disposer(NOEUDS.map((l) => ctx.measureText(l).width), R);

  // Arêtes, tracées progressivement par échantillonnage ; la flèche apparaît une fois l'arête finie.
  for (const [i, j] of ARETES) {
    const k = ease((t - (j * PAS - 120)) / DUREE_ARETE);
    if (k <= 0) continue;
    const a = B[i], b = B[j], N = 40;
    ctx.beginPath();
    const p0 = pointBezier(a, b, 0, mode); ctx.moveTo(p0.x, p0.y);
    for (let s = 1; s <= N * k; s++) { const p = pointBezier(a, b, s / N, mode); ctx.lineTo(p.x, p.y); }
    ctx.strokeStyle = TRAIT; ctx.lineWidth = 1.25; ctx.stroke();
    if (k >= 1) fleche(ctx, a, b, mode);
  }

  // Nœuds : boîte à coins arrondis, libellé mono, tronqué seulement si la boîte est contrainte.
  let tronques = 0;
  B.forEach((b, i) => {
    let l = NOEUDS[i];
    if (ctx.measureText(l).width > b.w - 16) {
      tronques++;
      while (ctx.measureText(l).width > b.w - 16 && l.length > 4) l = l.slice(0, -2) + "…";
    }
    const k = ease((t - i * PAS) / 380);
    if (k <= 0) return;
    ctx.save();
    ctx.translate(b.cx, b.cy); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.roundRect(-b.w / 2, -HAUTEUR / 2, b.w, HAUTEUR, 5);
    ctx.fillStyle = FOND; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 1.25; ctx.stroke();
    ctx.fillStyle = ENCRE; ctx.font = POLICE; ctx.textBaseline = "middle"; ctx.textAlign = "center";
    ctx.fillText(l, 0, 1);
    ctx.restore();
  });

  // Impulsion cobalt — jamais en mouvement réduit.
  if (!reduit) {
    const p = impulsion(t, B, mode);
    if (p) {
      ctx.save(); ctx.shadowColor = ACCENT; ctx.shadowBlur = 10; ctx.fillStyle = ACCENT;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  window.__fluxTronques = tronques;
  window.__fluxImages = (window.__fluxImages ?? 0) + 1;
}

/** Démarre le hero : une boucle rAF arrêtée hors écran ; en mouvement réduit, une seule image finale. */
export function demarrerFlux(cv: HTMLCanvasElement, section: Element, reduit = matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const texte = section.querySelector<HTMLElement>(".texte");
  const xMin = () => {
    if (!texte || ETROIT.matches) return undefined;
    return texte.getBoundingClientRect().right - cv.getBoundingClientRect().left + 24;
  };
  if (reduit) {
    dessiner(cv, 1e9, true, xMin());
    window.addEventListener("resize", () => dessiner(cv, 1e9, true, xMin()), { passive: true });
    return;
  }
  let actif = false, t0: number | null = null, raf = 0;
  const tick = (now: number) => {
    if (!actif) return;
    if (t0 === null) t0 = now;
    dessiner(cv, now - t0, false, xMin());
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting && !actif) { actif = true; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && actif) { actif = false; cancelAnimationFrame(raf); }
    }
  }, { threshold: 0.05 });
  io.observe(section);
}

for (const cv of document.querySelectorAll<HTMLCanvasElement>("canvas[data-flux]")) {
  const section = cv.closest("[data-hero]");
  if (section) demarrerFlux(cv, section);
}
