export type Chiffre = { valeur: string; libelle: string; source: string };

/** Les chiffres de l'accueil sans source exploitable (moins de 10 caractères). */
export function chiffresSansSource(chiffres: Chiffre[]): string[] {
  return chiffres
    .filter((c) => !c.source || c.source.trim().length < 10)
    .map((c) => `${c.valeur} ${c.libelle}`);
}

/** Jamais dans le contenu publié : porteurs du hub, lieux, proches (spec § 6). */
export const INTERDITS: string[] = ["Revel", "Dauzats", "Virginie", "Teulat", "médecin traitant", "compagne", "Maison Aube"];
/** En plus, dans l'étude du hub : rien n'est signé. */
export const INTERDITS_HUB: string[] = ["signé", "signée"];

export type Statut = "usage" | "demo" | "demonstrateur" | "arrete";
/** Les quatre statuts affichés partout (spec v3 § 2). `arrete` est réservé aux cartes « Aussi construit ». */
export const STATUTS: Record<Statut, string> = {
  usage: "En usage quotidien",
  demo: "Pack de démonstration, en service",
  demonstrateur: "Démonstrateur, en construction",
  arrete: "Arrêté",
};
/** Personas de démonstration : jamais nommées dans l'inventaire. */
export const PERSONAS: string[] = ["Marc", "Camille"];

/** Occurrences de « client(e) » qui ne sont ni « client de démonstration » ni précédées de « aucun » / « pas encore de ». */
export function regleClient(texte: string): string[] {
  const fautes: string[] = [];
  const re = /(\S+\s+)?(?<!\p{L})client(e?s?)(?!\p{L})(\s+\S+)?/giu;
  for (const m of texte.matchAll(re)) {
    const avant = (m[1] ?? "").toLowerCase(), apres = (m[3] ?? "").toLowerCase();
    const debut = texte.slice(Math.max(0, m.index! - 16), m.index!).toLowerCase();
    if (apres.startsWith(" de") && /\bde démonstration/i.test(texte.slice(m.index!, m.index! + 40))) continue;
    if (/\baucune?\s*$/i.test(avant) || /pas encore de\s*$/.test(debut + avant)) continue;
    fautes.push(m[0].trim().replace(/[.,;:!?…»)]+$/, ""));
  }
  return fautes;
}

/** Fragments qui disent « en production » / « en prod » — admis seulement dans les études en usage (spec v3 § 2). */
export function regleProduction(texte: string): string[] {
  const re = /(\S+\s+)?\ben prod(?:uction)?\b(\s+\S+)?/giu;
  return [...texte.matchAll(re)].map((m) => m[0].trim().replace(/[.,;:!?…»)]+$/, ""));
}

/** Les mots de `interdits` présents dans `texte`, sans tenir compte de la casse, dans l'ordre de la liste. */
export function motsInterdits(texte: string, interdits: string[]): string[] {
  const bas = texte.toLowerCase();
  return interdits.filter((m) => bas.includes(m.toLowerCase()));
}
