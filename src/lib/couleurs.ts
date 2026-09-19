/** Luminance relative WCAG d'une couleur hex #rrggbb. */
export function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Rapport de contraste WCAG entre deux couleurs, ≥ 1. */
export function contraste(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  const [clair, sombre] = la > lb ? [la, lb] : [lb, la];
  return (clair + 0.05) / (sombre + 0.05);
}
