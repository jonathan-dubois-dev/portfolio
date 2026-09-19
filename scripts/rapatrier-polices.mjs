// Rapatrie les polices depuis l'API CSS de Google Fonts (plage latin seulement) → public/fonts/ + src/styles/polices.css.
// Licences : Archivo et IBM Plex sont sous SIL Open Font License 1.1 — l'auto-hébergement est permis (voir README).
//
// Google sert certaines familles (ex. IBM Plex Sans) comme une police variable unique : l'API CSS répète alors
// la MÊME url woff2 sous plusieurs blocs @font-face à graisse fixe (400, 600…). Téléchargée telle quelle, cela
// produit deux fichiers strictement identiques sur le disque. On détecte ce cas par URL partagée et on fusionne
// ces blocs en un seul @font-face dont `font-weight` est la plage min-max, pour n'écrire le fichier qu'une fois.
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const FAMILLES = "family=Archivo:wdth,wght@100..125,400..900&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;500";
const CSS_URL = `https://fonts.googleapis.com/css2?${FAMILLES}&display=swap`;
// Un navigateur récent obtient des woff2 ; sans cet en-tête l'API rend du ttf.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const css = await (await fetch(CSS_URL, { headers: { "User-Agent": UA } })).text();
mkdirSync("public/fonts", { recursive: true });

// Blocs @font-face annotés « /* latin */ » uniquement.
const blocsBruts = [...css.matchAll(/\/\* (\w[\w-]*) \*\/\s*(@font-face\s*\{[^}]*\})/g)].filter((m) => m[1] === "latin");

const blocs = blocsBruts.map(([, , bloc]) => {
  const familleOriginale = /font-family:\s*'([^']+)'/.exec(bloc)[1];
  const famille = familleOriginale.replace(/\s+/g, "-").toLowerCase();
  const style = /font-style:\s*([\w-]+)/.exec(bloc)?.[1] ?? "normal";
  const etirement = /font-stretch:\s*([\d.% ]+)/.exec(bloc)?.[1]?.trim();
  const affichage = /font-display:\s*(\w+)/.exec(bloc)?.[1] ?? "swap";
  const plageUnicode = /unicode-range:\s*([^;]+);/.exec(bloc)[1].trim();
  const poids = (/font-weight:\s*([\d ]+)/.exec(bloc)?.[1] ?? "400").trim();
  const url = /url\((https:[^)]+\.woff2)\)/.exec(bloc)[1];
  return { famille, familleOriginale, style, etirement, affichage, plageUnicode, poids, url };
});

// Regroupe par URL réelle du fichier : deux blocs qui partagent la même URL partagent les mêmes octets.
const groupes = new Map();
for (const b of blocs) {
  if (!groupes.has(b.url)) groupes.set(b.url, []);
  groupes.get(b.url).push(b);
}

let sortie = "/* Généré par scripts/rapatrier-polices.mjs — ne pas éditer à la main. */\n";
let n = 0;
// Garde-fou : un fichier écrit deux fois sous le même nom, ou deux fichiers aux octets identiques
// sous des noms différents, sont tous deux des doublons qui ne devraient jamais atteindre le disque.
// La fusion par URL ci-dessus doit déjà les avoir éliminés avant le téléchargement — ceci est une
// deuxième ligne de défense, pas le mécanisme de dédoublonnage principal.
const nomsEcrits = new Set();
const empreintes = new Map(); // sha256 -> nom
for (const [url, membres] of groupes) {
  const premier = membres[0];
  const poidsNombres = membres.flatMap((m) => m.poids.split(/\s+/).map(Number));
  const min = Math.min(...poidsNombres);
  const max = Math.max(...poidsNombres);
  const poidsDescripteur = min === max ? `${min}` : `${min} ${max}`;
  const poidsFichier = min === max ? `${min}` : `${min}-${max}`;
  const nom = `${premier.famille}-${poidsFichier}.woff2`;

  const octets = new Uint8Array(await (await fetch(url)).arrayBuffer());
  const empreinte = createHash("sha256").update(octets).digest("hex");

  if (nomsEcrits.has(nom)) throw new Error(`Nom de police en double : ${nom}`);
  const dejaVu = empreintes.get(empreinte);
  if (dejaVu && dejaVu !== nom) throw new Error(`Octets identiques : ${nom} et ${dejaVu}`);
  nomsEcrits.add(nom);
  empreintes.set(empreinte, nom);

  writeFileSync(`public/fonts/${nom}`, octets);

  sortie += "@font-face {\n";
  sortie += `  font-family: '${premier.familleOriginale}';\n`;
  sortie += `  font-style: ${premier.style};\n`;
  sortie += `  font-weight: ${poidsDescripteur};\n`;
  if (premier.etirement) sortie += `  font-stretch: ${premier.etirement};\n`;
  sortie += `  font-display: ${premier.affichage};\n`;
  sortie += `  src: url('/fonts/${nom}') format('woff2');\n`;
  sortie += `  unicode-range: ${premier.plageUnicode};\n`;
  sortie += "}\n";
  n++;
}
writeFileSync("src/styles/polices.css", sortie);
console.log(`${n} fichiers écrits dans public/fonts/, src/styles/polices.css régénéré`);
