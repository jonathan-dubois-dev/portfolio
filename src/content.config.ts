import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { schemaRealisation } from "./lib/schema-realisation";
import { schemaAussi } from "./lib/schema-aussi";

// Un fichier Markdown = une étude de cas. Tout le contenu structuré est dans le
// frontmatter (validé par le même schéma dans tests/realisations.test.ts) ;
// le corps du fichier est facultatif (une phrase de clôture au plus).
const realisations = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/realisations" }),
  schema: schemaRealisation,
});

// Sept cartes « Aussi construit » : pas de page dédiée, une vignette illustrée avec badge de statut.
const aussi = defineCollection({ loader: glob({ pattern: "*.md", base: "./src/content/aussi" }), schema: schemaAussi });

export const collections = { realisations, aussi };
