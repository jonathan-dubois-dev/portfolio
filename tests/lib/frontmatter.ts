import { parse } from "yaml";

/** Le frontmatter YAML d'un fichier `.md` de `src/content/realisations` (délimité par `---`). */
export function frontmatter(texte: string): unknown {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) throw new Error("frontmatter absent");
  return parse(m[1]);
}
