import { NOEUDS, ARETES, PAS, DUREE_ARETE, ease, region, boite, pointBezier, impulsion, type Boite } from "./flux-geometrie";

const ENCRE = "#14161c", TRAIT = "#a39d94", FOND = "#f7f5f2", ACCENT = "#2447e0";
const POLICE = '500 12.5px "IBM Plex Mono", ui-monospace, monospace';

declare global { interface Window { __fluxImages?: number } }

function ajuster(cv: HTMLCanvasElement) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, W: r.width, H: r.height };
}

function dessiner(cv: HTMLCanvasElement, t: number, reduit: boolean) {
  const { ctx, W, H } = ajuster(cv);
  ctx.clearRect(0, 0, W, H);
  const R = region(W, H);
  ctx.font = POLICE;
  const B: Boite[] = NOEUDS.map((n) => boite(n, R, ctx.measureText(n.l).width));

  // Arêtes, tracées progressivement par échantillonnage.
  for (const [i, j] of ARETES) {
    const k = ease((t - (j * PAS - 120)) / DUREE_ARETE);
    if (k <= 0) continue;
    const a = B[i], b = B[j], N = 40;
    ctx.beginPath();
    const p0 = pointBezier(a, b, 0); ctx.moveTo(p0.x, p0.y);
    for (let s = 1; s <= N * k; s++) { const p = pointBezier(a, b, s / N); ctx.lineTo(p.x, p.y); }
    ctx.strokeStyle = TRAIT; ctx.lineWidth = 1.25; ctx.stroke();
  }

  // Nœuds : boîte à coins arrondis, libellé mono, tronqué si la boîte est contrainte.
  B.forEach((b, i) => {
    const k = ease((t - i * PAS) / 380);
    if (k <= 0) return;
    ctx.save();
    ctx.translate(b.cx, b.cy); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 5);
    ctx.fillStyle = FOND; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 1.25; ctx.stroke();
    ctx.fillStyle = ENCRE; ctx.font = POLICE; ctx.textBaseline = "middle"; ctx.textAlign = "center";
    let l = NOEUDS[i].l;
    while (ctx.measureText(l).width > b.w - 16 && l.length > 4) l = l.slice(0, -2) + "…";
    ctx.fillText(l, 0, 1);
    ctx.restore();
  });

  // Impulsion cobalt — jamais en mouvement réduit.
  if (!reduit) {
    const p = impulsion(t, B);
    if (p) {
      ctx.save(); ctx.shadowColor = ACCENT; ctx.shadowBlur = 10; ctx.fillStyle = ACCENT;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  window.__fluxImages = (window.__fluxImages ?? 0) + 1;
}

/** Démarre le hero : une boucle rAF arrêtée hors écran ; en mouvement réduit, une seule image finale. */
export function demarrerFlux(cv: HTMLCanvasElement, section: Element, reduit = matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if (reduit) {
    dessiner(cv, 1e9, true);
    window.addEventListener("resize", () => dessiner(cv, 1e9, true), { passive: true });
    return;
  }
  let actif = false, t0: number | null = null, raf = 0;
  const tick = (now: number) => {
    if (!actif) return;
    if (t0 === null) t0 = now;
    dessiner(cv, now - t0, false);
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
