const fichiers = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/realisations/*/*.{png,webp}",
  { eager: true },
);

export function imageDe(slug: string, fichier: string): ImageMetadata {
  const m = fichiers[`/src/assets/realisations/${slug}/${fichier}`];
  if (!m) throw new Error(`Image absente : ${slug}/${fichier}`);
  return m.default;
}
