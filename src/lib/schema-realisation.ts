import { z } from "astro/zod";

export const schemaRealisation = z.object({
  titre: z.string().min(10),
  /** Une ligne « ce que ça prouve », affichée sous le titre et sur la carte. */
  prouve: z.string().min(20),
  statut: z.enum(["usage", "demo", "demonstrateur"]),
  /** Métier de l'inventaire lié, s'il existe ; sert à afficher un lien vers `/automatisations/#<metier>`. */
  metier: z.enum(["btp", "therapeutes", "immo", "sagesfemmes", "hub", "interne"]).optional(),
  /** Phrase de statut honnête, affichée sous le badge. */
  statutLigne: z.string().min(20),
  ordre: z.number().int().min(1),
  /** Résumé de la carte de l'accueil. */
  resume: z.string().min(40).max(240),
  contexte: z.string().min(60),
  construit: z.array(z.string().min(20)).min(6).max(8),
  /** Étapes du diagramme, dans l'ordre. */
  schema: z.array(z.string().min(2)).min(3).max(8),
  preuves: z.array(z.string().min(10)).min(2),
  incident: z.object({
    titre: z.string().min(5),
    constat: z.string().min(30),
    cause: z.string().min(30),
    correctif: z.string().min(30),
  }),
  stack: z.array(z.string()).min(3),
  liens: z.array(z.object({ libelle: z.string(), url: z.string().url() })).default([]),
  images: z
    .array(
      z.object({
        fichier: z.string().regex(/^[a-z0-9-]+\.(png|webp)$/),
        alt: z.string().min(10),
        legende: z.string().min(10),
      }),
    )
    .min(2),
});

export type Realisation = z.infer<typeof schemaRealisation>;
