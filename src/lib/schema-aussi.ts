import { z } from "astro/zod";

/** Une carte « Aussi construit » (spec v3 § 4) : pas de page, une vignette, un badge, un lien s'il existe. */
export const schemaAussi = z.object({
  titre: z.string().min(5).max(70),
  phrase: z.string().min(20).max(160),
  statut: z.enum(["usage", "demo", "demonstrateur", "arrete"]),
  ordre: z.number().int().min(1).max(7),
  lien: z.object({ libelle: z.string().min(3), url: z.string().min(1) }).optional(),
  image: z.object({ fichier: z.string().regex(/^[a-z0-9-]+\.(png|webp)$/), alt: z.string().min(10) }),
});
export type Aussi = z.infer<typeof schemaAussi>;
