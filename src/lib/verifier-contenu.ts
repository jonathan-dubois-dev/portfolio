export type Chiffre = { valeur: string; libelle: string; source: string };

/** Les chiffres de l'accueil sans source exploitable (moins de 10 caractères). */
export function chiffresSansSource(chiffres: Chiffre[]): string[] {
  return chiffres
    .filter((c) => !c.source || c.source.trim().length < 10)
    .map((c) => `${c.valeur} ${c.libelle}`);
}

/** Jamais dans le contenu publié : porteurs du hub, lieux, proches (spec § 6). */
export const INTERDITS: string[] = ["Revel", "Dauzats", "Virginie", "Teulat", "médecin traitant"];
/** En plus, dans l'étude du hub : il n'y a pas de client, rien n'est signé. */
export const INTERDITS_HUB: string[] = ["client", "signé", "signée"];

/** Les mots de `interdits` présents dans `texte`, sans tenir compte de la casse, dans l'ordre de la liste. */
export function motsInterdits(texte: string, interdits: string[]): string[] {
  const bas = texte.toLowerCase();
  return interdits.filter((m) => bas.includes(m.toLowerCase()));
}
