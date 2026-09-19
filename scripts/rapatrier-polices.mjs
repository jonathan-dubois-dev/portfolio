// Rapatrie les polices depuis l'API CSS de Google Fonts (plage latin seulement) → public/fonts/ + src/styles/polices.css.
// Licences : Archivo et IBM Plex sont sous SIL Open Font License 1.1 — l'auto-hébergement est permis (voir README).
import { mkdirSync, writeFileSync } from "node:fs";

const FAMILLES = "family=Archivo:wdth,wght@100..125,400..900&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;500";
const CSS_URL = `https://fonts.googleapis.com/css2?${FAMILLES}&display=swap`;
// Un navigateur récent obtient des woff2 ; sans cet en-tête l'API rend du ttf.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const css = await (await fetch(CSS_URL, { headers: { "User-Agent": UA } })).text();
mkdirSync("public/fonts", { recursive: true });

// Blocs @font-face annotés « /* latin */ » uniquement.
const blocs = [...css.matchAll(/\/\* (\w[\w-]*) \*\/\s*(@font-face\s*\{[^}]*\})/g)].filter((m) => m[1] === "latin");
let sortie = "/* Généré par scripts/rapatrier-polices.mjs — ne pas éditer à la main. */\n";
let n = 0;
for (const [, , bloc] of blocs) {
  const famille = /font-family:\s*'([^']+)'/.exec(bloc)[1].replace(/\s+/g, "-").toLowerCase();
  const poids = (/font-weight:\s*([\d ]+)/.exec(bloc)?.[1] ?? "400").trim().replace(" ", "-");
  const url = /url\((https:[^)]+\.woff2)\)/.exec(bloc)[1];
  const nom = `${famille}-${poids}.woff2`;
  const octets = new Uint8Array(await (await fetch(url)).arrayBuffer());
  writeFileSync(`public/fonts/${nom}`, octets);
  sortie += bloc.replace(/url\([^)]+\)\s*format\('woff2'\)/, `url('/fonts/${nom}') format('woff2')`) + "\n";
  n++;
}
writeFileSync("src/styles/polices.css", sortie);
console.log(`${n} fichiers écrits dans public/fonts/, src/styles/polices.css régénéré`);
