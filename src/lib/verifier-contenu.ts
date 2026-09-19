export type Chiffre = { valeur: string; libelle: string; source: string };

/** Les chiffres de l'accueil sans source exploitable (moins de 10 caractères). */
export function chiffresSansSource(chiffres: Chiffre[]): string[] {
  return chiffres
    .filter((c) => !c.source || c.source.trim().length < 10)
    .map((c) => `${c.valeur} ${c.libelle}`);
}
