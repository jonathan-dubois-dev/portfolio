# Portfolio de Jonathan Dubois — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un site personnel statique (accueil + trois études de cas) qui, en 30 secondes, fait comprendre à une agence ou à un recruteur ce que Jonathan sait construire — avec un hero animé « Le flux » (canvas 2D, 0 ko de librairie), déployé sur Cloudflare Pages, testé et pesé.

**Architecture:** Astro 6 statique, contenu des études de cas en Markdown (frontmatter structuré validé par un schéma zod partagé entre Astro et vitest), données de l'accueil en modules TypeScript, CSS à jetons sans framework, un seul script navigateur (le hero). Tests : vitest sur les fonctions pures et le contenu, Playwright contre `astro preview`.

**Tech Stack:** Node ≥ 24 · Astro ^6.4.4 · @astrojs/sitemap · vitest ^3.2 · @playwright/test ^1.55 · yaml ^2.6 (dev, lecture du frontmatter dans les tests) · Cloudflare Pages via `npx wrangler`.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-design.md` — le plan argumente depuis la spec ; lire les deux.

## Global Constraints

Copiées de la spec, valables pour chaque tâche :

- **Dépôt** : `C:\Dev\portfolio`, branche `main`, commit après chaque tâche. **Chaque message de commit se termine par ces deux lignes exactes** :
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
  ```
- **Node ≥ 24** (24.15.0 installé). **Astro ^6.4.4**. Sur cette machine, toute commande `wrangler` se lance avec `NODE_OPTIONS=--use-system-ca` (bash) ou `$env:NODE_OPTIONS="--use-system-ca"` (PowerShell).
- **Aucun framework CSS** (pas de Tailwind), **ni GSAP, ni Lenis, ni Three.js**. Le seul JavaScript navigateur est le hero.
- **Jetons de couleur, verbatim** : `--fond #f7f5f2` · `--encre #14161c` · `--doux #5d6270` · `--trait #dcd7d0` · `--trait-fort #a39d94` · `--accent #2447e0` (**le seul accent**). Teintes de schéma réservées aux diagrammes : `#14161c`, `#2447e0`, `#c8506e`, `#1f8a7a`.
- **Polices** : Archivo (variable, `wdth` 100–125) en display ; IBM Plex Sans 400/600 en texte ; IBM Plex Mono 400/500 en libellés. Google Fonts jusqu'à la tâche 12, auto-hébergées ensuite.
- **Copie** : français, tutoiement absent (le site parle à un inconnu), pas d'anglicisme évitable. **Mots interdits** dans tout le contenu publié : `Revel`, `Dauzats`, `Virginie`, `Teulat`, `médecin traitant`. Dans l'étude de cas du hub, en plus : `client`, `cliente`, `signé`. Un test le garantit.
- **Chiffres** : chaque chiffre de l'accueil porte une `source` non vide (test). Les valeurs du plan sont provisoires ; Jonathan les relit avant publication (spec § 10.6).
- **Budget** : première vue de `/` **< 1 000 000 octets** mesurés par `performance.getEntriesByType`, aucune requête vers un domaine tiers après la tâche 12.
- **Accessibilité** : `prefers-reduced-motion` respecté, texte du hero en HTML, canvas `aria-hidden`, cibles ≥ 44 px, focus visible, contrastes AA.
- **Une mutation par test** : chaque tâche contient une étape « casser, voir rouge, réparer ». Un test qui ne rougit pas sur sa mutation est un test à réécrire, pas à garder.
- **Ports** : `astro preview` sur **4322** (le 4321 est pris par `hub-sante/rue`). Playwright en `workers: 1` (le parallélisme est intermittent sur cette machine).
- **Ne jamais tuer un processus par nom d'image** (`node.exe`, `python.exe`) : cibler le PID (`netstat -ano | findstr :4322`).

---

## Structure des fichiers

```
C:\Dev\portfolio\
  package.json · astro.config.mjs · tsconfig.json · vitest.config.ts · playwright.config.ts · README.md
  public/
    favicon.svg                      — tâche 1
    og.png                           — tâche 10 (généré)
    fonts/*.woff2                    — tâche 12 (rapatriées)
  scripts/
    capturer-og.mjs                  — tâche 10
    rapatrier-polices.mjs            — tâche 12
  src/
    styles/global.css                — jetons, base typographique, mise en page — tâche 1
    styles/polices.css               — @font-face — tâche 12
    layouts/Base.astro               — en-tête HTML, SEO — tâche 1
    data/identite.ts                 — nom, titres, contact — tâche 2
    data/jetons.ts                   — les couleurs, pour les tests de contraste — tâche 2
    data/chiffres.json               — trois chiffres sourcés — tâche 2
    data/stack.ts · data/vignettes.ts — tâche 2
    lib/verifier-contenu.ts          — chiffresSansSource(), motsInterdits(), INTERDITS — tâche 2 (chiffres) et 3 (interdits)
    lib/schema-realisation.ts        — schéma zod partagé — tâche 3
    lib/couleurs.ts                  — luminance(), contraste() — tâche 11
    content.config.ts                — collection `realisations` — tâche 3
    content/realisations/{pack-btp,hub-sante,studio-moonkura}.md — tâche 3
    components/Schema.astro          — diagramme SVG d'une étude de cas — tâche 4
    pages/realisations/[slug].astro  — gabarit d'étude de cas — tâche 4
    components/Hero.astro            — bloc de positionnement + canvas — tâche 5
    scripts/flux-geometrie.ts        — fonctions pures du graphe — tâche 6
    scripts/flux.ts                  — rendu canvas, boucle, repli — tâche 7
    components/{Chiffres,CarteRealisation,Vignettes}.astro — tâche 8
    components/{Methode,Stack,Contact}.astro — tâche 9
    pages/index.astro                — tâche 5, complété en 8 et 9
    pages/404.astro · pages/robots.txt.ts — tâche 1
  tests/   (vitest)
    chiffres.test.ts                 — tâche 2
    realisations.test.ts             — tâche 3
    flux-geometrie.test.ts           — tâche 6
    couleurs.test.ts                 — tâche 11
  e2e/     (Playwright)
    pages.spec.ts                    — tâche 1, complété en 4
    hero.spec.ts                     — tâche 5 (texte), 7 (canvas, repli, boucle)
    accueil.spec.ts                  — tâche 8, 9
    seo.spec.ts                      — tâche 10
    mobile.spec.ts                   — tâche 11
    poids.spec.ts                    — tâche 12
```

---

### Task 1: Socle Astro, mise en page de base, 404, robots

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`, `src/pages/404.astro`, `src/pages/robots.txt.ts`, `public/favicon.svg`
- Test: `e2e/pages.spec.ts`

**Interfaces:**
- Produces: `Base.astro` avec `Props { title: string; description: string; image?: string }` et un `<slot />` dans `<body>` ; classes CSS globales `.colonne`, `.section`, `.bouton.plein`, `.bouton.creux`, `.etiquette`, `.evitement` ; jetons CSS `--fond --encre --doux --trait --trait-fort --accent --display --texte --mono`.

- [ ] **Step 1: Créer `package.json`**

```json
{
  "name": "portfolio-jonathan-dubois",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev --port 4322",
    "build": "astro build",
    "preview": "astro preview --host 127.0.0.1 --port 4322",
    "test": "vitest run",
    "e2e": "astro build && playwright test",
    "og": "node scripts/capturer-og.mjs",
    "polices": "node scripts/rapatrier-polices.mjs"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^6.4.4"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "typescript": "^5.6.0",
    "vitest": "^3.2.0",
    "yaml": "^2.6.0"
  }
}
```

- [ ] **Step 2: Créer les configurations**

`astro.config.mjs` :
```js
// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // URL de production sur Pages ; un domaine perso viendra plus tard (spec § 11).
  site: "https://jonathan-dubois.pages.dev",
  integrations: [sitemap()],
});
```

`tsconfig.json` :
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`vitest.config.ts` :
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
```

`playwright.config.ts` :
```ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4322", ...devices["Desktop Chrome"] },
  webServer: {
    command: "npx astro preview --host 127.0.0.1 --port 4322",
    url: "http://127.0.0.1:4322",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

- [ ] **Step 3: Installer**

Run: `cd /c/Dev/portfolio && npm install && npx playwright install chromium`
Expected: `node_modules/` créé, aucune erreur ; Chromium téléchargé (ou déjà présent).

- [ ] **Step 4: Écrire le test e2e qui échoue**

`e2e/pages.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("l'accueil répond 200 et porte le nom en h1", async ({ page }) => {
  const r = await page.goto("/");
  expect(r?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Jonathan Dubois");
});

test("404 personnalisée", async ({ page }) => {
  const r = await page.goto("/nimporte-quoi/");
  expect(r?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Cette page n'existe pas");
});

test("zéro erreur console sur l'accueil", async ({ page }) => {
  const erreurs: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") erreurs.push(m.text()); });
  page.on("pageerror", (e) => erreurs.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(erreurs).toEqual([]);
});
```

- [ ] **Step 5: Lancer pour voir l'échec**

Run: `npm run e2e`
Expected: échec du build (`src/pages` absent) ou 3 tests rouges.

- [ ] **Step 6: Écrire `src/styles/global.css`**

```css
:root{
  --fond:#f7f5f2; --encre:#14161c; --doux:#5d6270; --trait:#dcd7d0; --trait-fort:#a39d94;
  --accent:#2447e0;
  --display:'Archivo',system-ui,sans-serif;
  --texte:'IBM Plex Sans',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;
  --colonne:72rem;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--fond);color:var(--encre);font-family:var(--texte);font-size:16px;line-height:1.55;
     padding-inline:clamp(16px,4vw,48px)}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
img,svg,canvas{max-width:100%}
code{font-family:var(--mono);font-size:.92em}

.evitement{position:absolute;left:-999px;top:0;background:var(--encre);color:var(--fond);padding:.6rem 1rem;z-index:100}
.evitement:focus{left:16px}

.colonne{max-width:var(--colonne);margin-inline:auto}
.section{padding-block:clamp(3rem,7vw,5.5rem);border-top:1px solid var(--trait)}
.section h2{font-family:var(--display);font-variation-settings:'wdth' 108;font-weight:700;font-size:clamp(1.5rem,2.6vw,2.1rem);letter-spacing:-.01em;margin:0 0 1.5rem;text-wrap:balance}
.section p{max-width:65ch}

.etiquette{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--doux)}
.mono{font-family:var(--mono)}

.bouton{font-family:var(--texte);font-weight:600;font-size:.95rem;text-decoration:none;padding:.7rem 1.1rem;border-radius:4px;min-height:44px;display:inline-flex;align-items:center;gap:.5rem}
.bouton.plein{background:var(--encre);color:var(--fond)}
.bouton.creux{border:1px solid var(--trait-fort);color:var(--encre)}
.bouton:hover{opacity:.9}

.pied{border-top:1px solid var(--trait);padding-block:1.5rem 3rem;font-family:var(--mono);font-size:.78rem;color:var(--doux)}

@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} }
```

- [ ] **Step 7: Écrire `src/layouts/Base.astro`**

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description: string;
  /** Chemin absolu de l'image Open Graph ; par défaut la capture du hero (tâche 10). */
  image?: string;
}
const { title, description, image = "/og.png" } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
const ogImage = new URL(image, Astro.site).toString();
---

<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="theme-color" content="#f7f5f2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />
  </head>
  <body>
    <a class="evitement" href="#contenu">Aller au contenu</a>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Écrire les pages minimales et le favicon**

`src/pages/index.astro` (provisoire, remplacé à la tâche 5) :
```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="Jonathan Dubois — Ingénieur automatisation IA · Creative technologist" description="Ingénieur automatisation IA et creative technologist à Toulouse.">
  <main id="contenu" class="colonne">
    <h1>Jonathan Dubois</h1>
  </main>
</Base>
```

`src/pages/404.astro` :
```astro
---
import Base from "../layouts/Base.astro";
---
<Base title="Page introuvable — Jonathan Dubois" description="Cette page n'existe pas.">
  <main id="contenu" class="colonne section">
    <h1>Cette page n'existe pas</h1>
    <p><a href="/">Retour à l'accueil</a></p>
  </main>
</Base>
```

`src/pages/robots.txt.ts` :
```ts
import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
```

`public/favicon.svg` (un point cobalt sur fond os — le nœud du flux) :
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#f7f5f2"/><rect x="6" y="11" width="20" height="10" rx="2.5" fill="none" stroke="#14161c" stroke-width="1.6"/><circle cx="26" cy="16" r="3.2" fill="#2447e0"/></svg>
```

- [ ] **Step 9: Lancer les tests**

Run: `npm run e2e`
Expected: 3 tests verts.

- [ ] **Step 10: Mutation** — dans `404.astro`, remplacer le texte du `h1` par `Introuvable`. Run `npx playwright test e2e/pages.spec.ts` → le test « 404 personnalisée » doit être rouge. Restaurer. Relancer → vert.

- [ ] **Step 11: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Socle Astro : mise en page de base, 404, robots, tests e2e

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 2: Données de l'accueil et chiffres sourcés

**Files:**
- Create: `src/data/identite.ts`, `src/data/jetons.ts`, `src/data/chiffres.json`, `src/data/stack.ts`, `src/data/vignettes.ts`, `src/lib/verifier-contenu.ts`
- Test: `tests/chiffres.test.ts`

**Interfaces:**
- Produces: `identite` (objet), `JETONS` (Record<string,string>), `chiffres` (JSON, tableau de `{ valeur, libelle, source }`), `stack: string[]`, `vignettes: Vignette[]`, `chiffresSansSource(chiffres): string[]`.

- [ ] **Step 1: Écrire le test qui échoue**

`tests/chiffres.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import chiffres from "../src/data/chiffres.json";
import { chiffresSansSource, type Chiffre } from "../src/lib/verifier-contenu";

describe("les chiffres de l'accueil", () => {
  it("sont exactement trois", () => {
    expect(chiffres).toHaveLength(3);
  });
  it("portent chacun une source nommée", () => {
    expect(chiffresSansSource(chiffres as Chiffre[])).toEqual([]);
  });
  it("chiffresSansSource nomme le chiffre fautif", () => {
    const faux: Chiffre[] = [{ valeur: "12", libelle: "choses", source: "" }, { valeur: "3", libelle: "trucs", source: "dépôt X, relevé le 19/09/2026" }];
    expect(chiffresSansSource(faux)).toEqual(["12 choses"]);
  });
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npm test`
Expected: échec — modules introuvables.

- [ ] **Step 3: Écrire les données et la fonction**

`src/lib/verifier-contenu.ts` :
```ts
export type Chiffre = { valeur: string; libelle: string; source: string };

/** Les chiffres de l'accueil sans source exploitable (moins de 10 caractères). */
export function chiffresSansSource(chiffres: Chiffre[]): string[] {
  return chiffres
    .filter((c) => !c.source || c.source.trim().length < 10)
    .map((c) => `${c.valeur} ${c.libelle}`);
}
```

`src/data/chiffres.json` — **valeurs provisoires, à relire par Jonathan (spec § 10.6)** :
```json
[
  {
    "valeur": "une dizaine",
    "libelle": "de workflows IA en production",
    "source": "n8n.aelto.fr, workflows actifs relevés le 19/09/2026 : estimation BTP (A, B, B'), feeder Notion, digest IA, et les cinq automatisations du hub (relais mail, entretien, sauvegarde, digest, rappels)"
  },
  {
    "valeur": "1 500+",
    "libelle": "tests automatisés",
    "source": "journaux des dépôts au 19/09/2026 : studio 1 256 pytest, moteur de séparation 97, hub 174 vitest + 55 e2e, vitrine 61 + 70 e2e, Troisième Étage 93 + 116"
  },
  {
    "valeur": "7",
    "libelle": "applications déployées",
    "source": "aelto.fr · demo.aelto.fr · studio.aelto.fr · atelier.aelto.fr · hub (vitrine Pages + hub Workers) · a-chaque-etape.fr · troisieme-etage-v2.pages.dev — relevé le 19/09/2026"
  }
]
```

`src/data/identite.ts` :
```ts
export const identite = {
  nom: "Jonathan Dubois",
  titres: ["Ingénieur automatisation IA", "Creative technologist"] as const,
  ligne: "Je construis des systèmes IA qui tournent en production : agents, workflows, applications, génératif.",
  ville: "Toulouse",
  disponibilite: "Disponible en mission ou en poste",
  // Adresse provisoire (spec § 2) ; passera sur le domaine perso avec Email Routing.
  email: "duboisjonathan@orange.fr",
  // Vides tant que les comptes n'existent pas : le composant Contact n'affiche que les liens renseignés.
  liens: { linkedin: "", github: "" },
  descriptionSite:
    "Ingénieur automatisation IA et creative technologist à Toulouse : agents, workflows n8n, applications sur Cloudflare, génératif. Trois réalisations en production, testées et pesées.",
};
```

`src/data/jetons.ts` (les mêmes valeurs que `global.css` — un test de la tâche 11 vérifie la concordance) :
```ts
export const JETONS = {
  fond: "#f7f5f2",
  encre: "#14161c",
  doux: "#5d6270",
  trait: "#dcd7d0",
  traitFort: "#a39d94",
  accent: "#2447e0",
} as const;
```

`src/data/stack.ts` :
```ts
export const stack: string[] = [
  "n8n", "Cloudflare Workers / Pages / D1 / R2 / Workers AI", "OpenAI & Anthropic", "Notion",
  "Astro", "Three.js", "Python", "ComfyUI", "Demucs", "Playwright / vitest",
];
```

`src/data/vignettes.ts` :
```ts
export type Vignette = { titre: string; texte: string; url?: string };
export const vignettes: Vignette[] = [
  {
    titre: "L'Atelier — images et vidéos générées en local",
    texte: "ComfyUI sur une RTX 3060, exposé en service web. Démarrage à froid et à chaud mesurés, pièges de la vidéo locale documentés (le verbe d'action est obligatoire, la qualité vient de l'image de départ).",
    url: "https://atelier.aelto.fr",
  },
  {
    titre: "Troisième Étage — le site d'un groupe, en 3D temps réel",
    texte: "Un ascenseur en Three.js dont la cabine octogonale pivote pour desservir les salles ; repli CSS 3D sans WebGL ; première vue à 1,54 Mo ; 93 tests unitaires et 116 tests navigateur.",
    url: "https://troisieme-etage-v2.pages.dev",
  },
];
```

- [ ] **Step 4: Lancer les tests**

Run: `npm test`
Expected: 3 tests verts. (Si vitest refuse l'import JSON : ajouter `"resolveJsonModule": true` dans `compilerOptions` de `tsconfig.json` — le preset strict d'Astro l'inclut déjà.)

- [ ] **Step 5: Mutation** — vider la `source` du deuxième chiffre dans `chiffres.json`. Run `npm test` → « portent chacun une source nommée » rouge. Restaurer → vert.

- [ ] **Step 6: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Données de l'accueil : identité, jetons, chiffres sourcés, stack, vignettes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 3: Collection des études de cas, contenu réel, mots interdits

**Files:**
- Create: `src/lib/schema-realisation.ts`, `src/content.config.ts`, `src/content/realisations/pack-btp.md`, `src/content/realisations/hub-sante.md`, `src/content/realisations/studio-moonkura.md`
- Modify: `src/lib/verifier-contenu.ts` (ajouter `INTERDITS`, `INTERDITS_HUB`, `motsInterdits`)
- Test: `tests/realisations.test.ts`

**Interfaces:**
- Produces: `schemaRealisation` (zod) et le type `Realisation = z.infer<typeof schemaRealisation>` ; la collection Astro `realisations` (id = nom du fichier sans `.md`) ; `motsInterdits(texte: string, interdits: string[]): string[]`.

- [ ] **Step 1: Écrire le test qui échoue**

`tests/realisations.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { schemaRealisation } from "../src/lib/schema-realisation";
import { INTERDITS, INTERDITS_HUB, motsInterdits } from "../src/lib/verifier-contenu";

const DOSSIER = join(process.cwd(), "src/content/realisations");
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md"));

function frontmatter(texte: string): unknown {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) throw new Error("frontmatter absent");
  return parse(m[1]);
}

describe("les études de cas", () => {
  it("sont exactement trois", () => {
    expect(fichiers.sort()).toEqual(["hub-sante.md", "pack-btp.md", "studio-moonkura.md"]);
  });

  for (const f of fichiers) {
    const texte = readFileSync(join(DOSSIER, f), "utf8");
    it(`${f} respecte le schéma`, () => {
      const r = schemaRealisation.safeParse(frontmatter(texte));
      expect(r.success, JSON.stringify(r.success ? null : r.error.issues, null, 1)).toBe(true);
    });
    it(`${f} ne contient aucun mot interdit`, () => {
      expect(motsInterdits(texte, INTERDITS)).toEqual([]);
    });
  }

  it("le hub ne parle jamais de client ni de signature", () => {
    const texte = readFileSync(join(DOSSIER, "hub-sante.md"), "utf8");
    expect(motsInterdits(texte, INTERDITS_HUB)).toEqual([]);
  });

  it("le hub porte le badge de démonstrateur", () => {
    const fm = frontmatter(readFileSync(join(DOSSIER, "hub-sante.md"), "utf8")) as { statut: string; badge?: string };
    expect(fm.statut).toBe("demonstrateur");
    expect(fm.badge).toBe("Démonstrateur, en construction");
  });

  it("les ordres sont 1, 2, 3 sans doublon", () => {
    const ordres = fichiers.map((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { ordre: number }).ordre).sort();
    expect(ordres).toEqual([1, 2, 3]);
  });
});

describe("motsInterdits", () => {
  it("est insensible à la casse et rend les mots trouvés", () => {
    expect(motsInterdits("Une réunion à REVEL avec le client.", ["Revel", "client", "Teulat"])).toEqual(["Revel", "client"]);
  });
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npm test`
Expected: échec — modules et dossier introuvables.

- [ ] **Step 3: Écrire le schéma et la collection**

`src/lib/schema-realisation.ts` :
```ts
import { z } from "astro/zod";

export const schemaRealisation = z.object({
  titre: z.string().min(10),
  /** Une ligne « ce que ça prouve », affichée sous le titre et sur la carte. */
  prouve: z.string().min(20),
  statut: z.enum(["production", "demonstrateur"]),
  badge: z.string().optional(),
  /** Phrase de statut honnête, affichée sous le badge (hub uniquement). */
  statutLigne: z.string().optional(),
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
});

export type Realisation = z.infer<typeof schemaRealisation>;
```

`src/content.config.ts` :
```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { schemaRealisation } from "./lib/schema-realisation";

// Un fichier Markdown = une étude de cas. Tout le contenu structuré est dans le
// frontmatter (validé par le même schéma dans tests/realisations.test.ts) ;
// le corps du fichier est facultatif (une phrase de clôture au plus).
const realisations = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/realisations" }),
  schema: schemaRealisation,
});

export const collections = { realisations };
```

Ajouter à `src/lib/verifier-contenu.ts` :
```ts
/** Jamais dans le contenu publié : porteurs du hub, lieux, proches (spec § 6). */
export const INTERDITS: string[] = ["Revel", "Dauzats", "Virginie", "Teulat", "médecin traitant"];
/** En plus, dans l'étude du hub : il n'y a pas de client, rien n'est signé. */
export const INTERDITS_HUB: string[] = ["client", "signé", "signée"];

/** Les mots de `interdits` présents dans `texte`, sans tenir compte de la casse, dans l'ordre de la liste. */
export function motsInterdits(texte: string, interdits: string[]): string[] {
  const bas = texte.toLowerCase();
  return interdits.filter((m) => bas.includes(m.toLowerCase()));
}
```

- [ ] **Step 4: Écrire les trois études de cas**

`src/content/realisations/pack-btp.md` :
```markdown
---
titre: "Agent d'estimation de devis pour artisans — LLM + garde-fous déterministes"
prouve: "Un LLM en production, encadré par des règles déterministes, testé à chaque modification et corrigé sur incident réel."
statut: production
ordre: 1
resume: "Un artisan reçoit une demande floue ; en quelques minutes il a une fourchette crédible — ou un refus honnête. Jamais un prix inventé."
contexte: "Un artisan du bâtiment reçoit des demandes imprécises — « il y a une fuite », « refaire la salle de bain ». Répondre vite avec un ordre de grandeur crédible fait la différence commerciale ; répondre faux la détruit. Il fallait une estimation automatique qui sache aussi dire « je ne peux pas chiffrer ça sans venir voir »."
construit:
  - "Un webhook reçoit le formulaire de demande : nature des travaux, message libre, coordonnées."
  - "Le catalogue de prestations de l'artisan (53 briques tarifées) est lu dans Notion, puis compacté pour tenir dans le contexte du modèle."
  - "Un LLM en sortie JSON, température 0,2, choisit les briques pertinentes, rédige un cadrage et propose une fourchette basse–haute."
  - "Quatre garde-fous déterministes (G1 à G4) rejouent le calcul : plancher et plafond par type de demande, cohérence fourniture/pose, déplacement obligatoire, correction d'une borne aberrante."
  - "Si aucun mot-clé technique n'identifie la nature des travaux, le système répond par un repli explicite au lieu d'un chiffre."
  - "L'artisan reçoit la demande qualifiée dans Notion et une alerte Telegram ; le demandeur reçoit un e-mail nominatif au nom de l'artisan."
  - "Le prompt est versionné (v1.6) ; une batterie de dix cas — cinq nets, cinq replis — est rejouée après chaque modification, parce qu'un LLM varie d'une exécution à l'autre."
schema: ["Webhook", "Catalogue Notion", "Compactage", "LLM", "Garde-fous G1–G4", "Notion + Telegram", "E-mail"]
preuves:
  - "En production depuis juin 2026, branché sur un formulaire de démonstration public."
  - "Batterie de dix cas rejouée après chaque modification du prompt."
  - "Incident A-007 détecté par un contrôle qualité hebdomadaire automatique, corrigé, puis vérifié contre le code réellement déployé."
incident:
  titre: "A-007 — les fourchettes absurdes"
  constat: "La même demande — un réseau de plomberie cuisine et salle de bain — donnait successivement 130–391 €, 110–181 €, puis un refus. 181 € pour un réseau complet, c'est moins qu'une journée de main-d'œuvre."
  cause: "Le modèle mobilisait les briques en quantité unitaire (une heure, un mètre linéaire) ; le garde-fou G4 prenait cette somme pour un plafond fiable et écrasait dessus la borne haute — pourtant juste — du modèle. Il existait un plancher sur la borne basse, rien de symétrique sur la haute."
  correctif: "Un ratio : si la borne haute du modèle dépasse deux fois la somme catalogue, cette somme est manifestement unitaire et n'est plus un plafond — on bascule en repli explicite. Le bloc corrigé a été extrait du workflow déployé et rejoué tel quel sur quatre exécutions réelles : quatre sur quatre."
stack: ["n8n", "OpenAI", "Notion", "Telegram", "Cloudflare Pages", "Python"]
liens:
  - { libelle: "Formulaire de démonstration", url: "https://demo.aelto.fr/btp/contact.html" }
---
```

`src/content/realisations/hub-sante.md` :
```markdown
---
titre: "Plateforme de coordination pour maison de santé — compte-rendu de réunion automatique"
prouve: "Une application IA complète, de l'authentification aux automatisations, sous une contrainte réglementaire forte : zéro donnée patient."
statut: demonstrateur
badge: "Démonstrateur, en construction"
statutLigne: "Construit pour un projet réel de maison de santé pluriprofessionnelle ; resté au stade du démonstrateur — les outils déjà en place chez les praticiens couvraient une partie du besoin."
ordre: 2
resume: "Une quarantaine de praticiens à coordonner — réunions, documents, fournitures, forum — sans jamais toucher une donnée patient. Le compte-rendu de réunion s'écrit tout seul."
contexte: "Une maison de santé pluriprofessionnelle réunit une quarantaine de praticiens qui doivent se coordonner : réunions, documents partagés, fournitures, annonces, échanges internes. La contrainte qui commande tout : aucune donnée patient, sous aucune forme — sinon l'hébergement doit être certifié HDS. Le logiciel métier garde le patient ; la plateforme ne garde que la vie du centre."
construit:
  - "Un site public (Astro, Cloudflare Pages) dont l'accueil est le bâtiment lui-même, avec un espace par praticien, et un assistant de renseignement à débit limité (vingt questions par dix minutes et par adresse)."
  - "Un hub privé (Astro serveur sur Workers, base D1) avec sessions maison, mots de passe PBKDF2, invitations par courriel, journal d'activité."
  - "Des réunions avec compte-rendu automatique : l'enregistrement est transcrit (Whisper) puis structuré (Llama 3.3) sur Workers AI ; l'audio n'est jamais conservé, la transcription est effacée à la validation du président."
  - "Un détecteur d'allusion à un patient passe sur chaque brouillon avant validation ; la case « je confirme » est obligatoire."
  - "Documents versionnés avec corbeille, forum modéré, messagerie interne, réservation de salles, suivi des fournitures et des commandes."
  - "Cinq automatisations n8n : relais mail, entretien nocturne, sauvegarde quotidienne sur R2 sans transcriptions, digest du lundi, rappels de réunion et de commande."
  - "Une charte visuelle propre au lieu — plaques émaillées, onglets de carnet — avec un plancher de taille de texte pour les lecteurs de 75 ans."
schema: ["Enregistrement", "Whisper (Workers AI)", "Llama 3.3", "Détecteur patient", "Validation présidence", "Courriel sans contenu"]
preuves:
  - "174 tests unitaires et 55 tests navigateur sur le hub ; 61 et 70 sur le site public (relevés le 19/09/2026, à recopier avant publication)."
  - "Transcription vérifiée en conditions réelles sur Workers AI : treize secondes pour un enregistrement d'une minute, brouillon structuré, aucun texte dans les journaux."
  - "Sauvegarde R2 et relais mail vérifiés en production : courriel d'invitation réellement reçu."
incident:
  titre: "Connexion en erreur 500 dès le premier déploiement"
  constat: "Le hub fonctionnait parfaitement en local ; en production, chaque tentative de connexion répondait 500. Rien dans les journaux applicatifs."
  cause: "Le hachage des mots de passe utilisait PBKDF2 à 210 000 itérations. Le moteur WebCrypto de Cloudflare Workers plafonne à 100 000 : au-delà, l'appel lève une exception — invisible en local, où le moteur Node n'a pas cette limite."
  correctif: "Itérations ramenées sous le plafond, base distante rechargée, redéploiement — et une règle ajoutée à la liste de contrôle : tester la connexion réelle après chaque déploiement, jamais seulement en local."
stack: ["Astro", "Cloudflare Workers", "Cloudflare Pages", "D1", "R2", "Workers AI", "n8n", "vitest", "Playwright"]
liens:
  - { libelle: "Site public du démonstrateur", url: "https://hub-sante-demo.pages.dev" }
---
```

`src/content/realisations/studio-moonkura.md` :
```markdown
---
titre: "Station audio collaborative en ligne — séparation de pistes par IA, tempo variable"
prouve: "Creative technologist et rigueur à la fois : audio temps réel dans le navigateur, GPU local, 1 256 tests et des mutations pour les prouver."
statut: production
ordre: 3
resume: "Trois musiciens qui composent à distance. Un morceau déposé se sépare en quatre pistes, s'étiquette en tonalité, suit une carte de tempo — et se partage sans que les espaces se mélangent."
contexte: "Un groupe de trois personnes compose à distance et voulait un outil que les services grand public ne réunissent pas : séparer un morceau en pistes, travailler avec un tempo qui change en cours de morceau, cloisonner les espaces de chacun tout en partageant. Il fallait aussi que ça tourne sur un iPad, avec sa mémoire limitée."
construit:
  - "Un éditeur multipiste dans le navigateur (Web Audio, canvas) : découpe, étirement, effets, enregistrement au micro avec métronome et décompte."
  - "Un serveur Python qui rend les pistes et sert des tranches de trente secondes : lire depuis la quarantième seconde d'un stem coûte 5 Mo au lieu de 17."
  - "La séparation de pistes par Demucs sur un GPU local, via un worker qui s'annonce derrière Cloudflare Access — on clique depuis la tablette, le PC calcule."
  - "L'étiquetage automatique de la tonalité de chaque piste à sa naissance (basse Am, voix Am…), jamais sur la batterie."
  - "Une carte de tempo et de signature : le son suit la carte par étirement temporel à hauteur préservée, jointures sans accroc (0,00 ms mesuré)."
  - "Des espaces cloisonnés structurellement — la racine des fichiers est recalculée depuis l'espace résolu du demandeur, aucun refus n'est écrit à la main — et un partage par niveau."
  - "1 256 tests Python et 3 270 sous-tests, une centaine de scénarios navigateur, et des mutations pour vérifier que chaque test rougit quand on retire ce qu'il protège."
schema: ["Dépôt du morceau", "Demucs sur GPU", "Quatre pistes nommées", "Carte de tempo", "Lecture par tranches", "Partage d'espace"]
preuves:
  - "En ligne et utilisé par trois personnes, depuis un PC, une tablette et un téléphone."
  - "Lecture par tranches mesurée : 169 Mo de WAV téléchargés avant, 23 Mo après, pour les mêmes quatre pistes."
  - "Coutures de tranches exactes à l'échantillon près : écart nul à 22,05 et 44,1 kHz, 6 × 10⁻⁸ à 48 kHz."
incident:
  titre: "Le détecteur de tempo livré volontairement muet"
  constat: "Le détecteur automatique de tempo, testé et mesuré sur 250 boucles de batterie réelles, donnait 40 % de résultats justes et 52 % de faux — et deux justes sur treize dans la tranche rapide, celle qui compte pour ce groupe."
  cause: "Structurel, pas du bruit : la famille ternaire (× 4/3, × 3/4, × 3/2) manquait aux candidats, et un shuffle lu comme du binaire pèse à lui seul un cinquième des erreurs. Un second détecteur — le nombre de mesures d'une boucle — plafonnait à 6 % de justes : après le filtre de plage, les candidats survivants sont des octaves, qu'un alignement d'attaques ne sait pas séparer."
  correctif: "Le code reste, testé, mais débranché : la fonction rend une valeur vide tant que la mesure ne dépasse pas le hasard. L'utilisateur choisit le nombre de mesures dans une liste qui affiche le tempo correspondant, et vérifie à l'oreille. Mesurer, puis dire non, plutôt que livrer un chiffre faux une fois sur deux."
stack: ["Python", "Web Audio API", "canvas", "Demucs / PyTorch", "ffmpeg", "Cloudflare Access", "pytest", "Playwright"]
liens:
  - { libelle: "Le studio (accès sur invitation)", url: "https://studio.aelto.fr" }
---
```

- [ ] **Step 5: Lancer les tests**

Run: `npm test`
Expected: tous verts (chiffres + réalisations). Puis `npx astro check` ou `npm run build` → la collection se charge sans erreur de schéma.

- [ ] **Step 6: Mutations** — (a) dans `hub-sante.md`, remplacer « les outils déjà en place chez les praticiens » par « les outils du client » → `npm test` : « le hub ne parle jamais de client » rouge ; restaurer. (b) Retirer deux puces de `construit` dans `pack-btp.md` → « respecte le schéma » rouge (min 6) ; restaurer. Relancer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Études de cas : schéma partagé, collection, contenu réel, mots interdits

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 4: Gabarit d'étude de cas et diagramme

**Files:**
- Create: `src/components/Schema.astro`, `src/pages/realisations/[slug].astro`
- Modify: `e2e/pages.spec.ts` (ajouter les trois pages)

**Interfaces:**
- Consumes: la collection `realisations` (tâche 3), `Base.astro` (tâche 1).
- Produces: les URL `/realisations/pack-btp/`, `/realisations/hub-sante/`, `/realisations/studio-moonkura/` ; `Schema.astro` avec `Props { etapes: string[] }`.

- [ ] **Step 1: Ajouter les tests e2e qui échouent**

Ajouter à `e2e/pages.spec.ts` :
```ts
for (const slug of ["pack-btp", "hub-sante", "studio-moonkura"]) {
  test(`/realisations/${slug}/ : titre, « ce que ça prouve », six sections, diagramme`, async ({ page }) => {
    const r = await page.goto(`/realisations/${slug}/`);
    expect(r?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-prouve]")).toBeVisible();
    await expect(page.locator("main h2")).toHaveText(["Contexte", "Ce que j'ai construit", "Preuves", "Un incident réel, et comment je l'ai réglé", "Stack"]);
    await expect(page.locator("figure.schema svg")).toHaveAttribute("role", "img");
  });
}

test("le hub porte son badge et sa ligne de statut ; le BTP n'en a pas", async ({ page }) => {
  await page.goto("/realisations/hub-sante/");
  await expect(page.locator("[data-badge]")).toHaveText("Démonstrateur, en construction");
  await expect(page.locator("[data-statut-ligne]")).toBeVisible();
  await page.goto("/realisations/pack-btp/");
  await expect(page.locator("[data-badge]")).toHaveCount(0);
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/pages.spec.ts`
Expected: les nouvelles pages répondent 404 → rouge.

- [ ] **Step 3: Écrire `src/components/Schema.astro`**

```astro
---
/** Un enchaînement linéaire d'étapes, en SVG, dans un conteneur qui défile horizontalement si l'écran est étroit. */
interface Props { etapes: string[] }
const { etapes } = Astro.props;
const H = 64, PAD = 14, GAP = 34, CH = 7.6;
let x = 2;
const pos = etapes.map((l) => { const w = Math.round(l.length * CH + PAD * 2); const p = { l, w, x }; x += w + GAP; return p; });
const W = x - GAP + 2;
---
<figure class="schema">
  <div class="defile">
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={"Enchaînement : " + etapes.join(" → ")}>
      <defs>
        <marker id="fleche" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--trait-fort)" /></marker>
      </defs>
      {pos.map((p, i) => (
        <Fragment>
          <rect x={p.x} y={16} width={p.w} height={34} rx="5" fill="var(--fond)" stroke="var(--encre)" stroke-width="1.25" />
          <text x={p.x + p.w / 2} y={38} text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="12.5" font-weight="500" fill="var(--encre)">{p.l}</text>
          {i < pos.length - 1 && <line x1={p.x + p.w} y1={33} x2={p.x + p.w + GAP - 2} y2={33} stroke="var(--trait-fort)" stroke-width="1.25" marker-end="url(#fleche)" />}
        </Fragment>
      ))}
    </svg>
  </div>
</figure>
<style>
  .schema{margin:1.5rem 0 0}
  .defile{overflow-x:auto;padding-block:.25rem}
  svg{display:block;max-width:none}
</style>
```

- [ ] **Step 4: Écrire `src/pages/realisations/[slug].astro`**

```astro
---
import { getCollection } from "astro:content";
import Base from "../../layouts/Base.astro";
import Schema from "../../components/Schema.astro";
import { identite } from "../../data/identite";

export async function getStaticPaths() {
  const toutes = await getCollection("realisations");
  return toutes.map((r) => ({ params: { slug: r.id }, props: { r } }));
}
const { r } = Astro.props;
const d = r.data;
---
<Base title={`${d.titre} — ${identite.nom}`} description={d.prouve}>
  <header class="colonne entete">
    <p><a href="/" class="mono retour">← {identite.nom}</a></p>
    {d.badge && <p class="badge" data-badge>{d.badge}</p>}
    <h1>{d.titre}</h1>
    <p class="prouve" data-prouve>{d.prouve}</p>
    {d.statutLigne && <p class="statut-ligne" data-statut-ligne>{d.statutLigne}</p>}
  </header>
  <main id="contenu" class="colonne">
    <section class="section"><h2>Contexte</h2><p>{d.contexte}</p></section>
    <section class="section">
      <h2>Ce que j'ai construit</h2>
      <ul class="puces">{d.construit.map((c) => <li>{c}</li>)}</ul>
      <Schema etapes={d.schema} />
    </section>
    <section class="section">
      <h2>Preuves</h2>
      <ul class="puces">{d.preuves.map((p) => <li>{p}</li>)}</ul>
      {d.liens.length > 0 && <p class="liens">{d.liens.map((l) => <a href={l.url} rel="noopener">{l.libelle} ↗</a>)}</p>}
    </section>
    <section class="section">
      <h2>Un incident réel, et comment je l'ai réglé</h2>
      <h3>{d.incident.titre}</h3>
      <dl class="incident">
        <dt>Constat</dt><dd>{d.incident.constat}</dd>
        <dt>Cause</dt><dd>{d.incident.cause}</dd>
        <dt>Correctif</dt><dd>{d.incident.correctif}</dd>
      </dl>
    </section>
    <section class="section">
      <h2>Stack</h2>
      <p class="mono stack">{d.stack.join(" · ")}</p>
    </section>
    <p class="section"><a class="bouton creux" href="/#realisations">← Toutes les réalisations</a></p>
  </main>
  <footer class="pied colonne">{identite.nom} · {identite.ville}</footer>
</Base>
<style>
  .entete{padding-block:2rem 1rem}
  .retour{font-size:.8rem;text-decoration:none;color:var(--doux)}
  .badge{display:inline-block;font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);border:1px solid var(--accent);border-radius:999px;padding:.3rem .7rem;margin:1rem 0 0}
  h1{font-family:var(--display);font-variation-settings:'wdth' 112;font-weight:800;font-size:clamp(1.9rem,4vw,3.2rem);line-height:1.05;letter-spacing:-.02em;margin:.8rem 0 1rem;text-wrap:balance;max-width:26ch}
  .prouve{font-size:1.15rem;max-width:60ch;margin:0}
  .statut-ligne{color:var(--doux);max-width:60ch;margin:.8rem 0 0;font-size:.95rem}
  .puces{padding-left:1.2rem;max-width:65ch;display:grid;gap:.6rem;margin:0}
  .liens{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.2rem}
  h3{font-family:var(--display);font-variation-settings:'wdth' 104;font-weight:700;font-size:1.2rem;margin:0 0 1rem}
  .incident{display:grid;grid-template-columns:auto 1fr;gap:.8rem 1.5rem;max-width:70ch;margin:0}
  .incident dt{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--doux);padding-top:.3rem}
  .incident dd{margin:0}
  @media (max-width:600px){ .incident{grid-template-columns:1fr;gap:.2rem .8rem} .incident dd{margin-bottom:.8rem} }
  .stack{color:var(--doux);font-size:.9rem}
</style>
```

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts.

- [ ] **Step 6: Mutation** — dans `[slug].astro`, retirer `{d.badge && …}`. Run `npx playwright test e2e/pages.spec.ts` → « le hub porte son badge » rouge. Restaurer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Gabarit d'étude de cas : six sections, badge, diagramme SVG

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 5: Le hero — bloc de positionnement en HTML (sans canvas)

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`
- Test: `e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `identite` (tâche 2).
- Produces: `Hero.astro` avec la structure `.hero[data-hero] > canvas[data-flux] + .texte` ; l'ancre `#realisations` et `#contact` sur `index.astro` (sections vides à cette tâche, remplies en 8 et 9).

- [ ] **Step 1: Écrire les tests qui échouent**

`e2e/hero.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("le hero porte le nom, les deux titres, la ligne, la ville et deux appels", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("[data-hero]");
  await expect(hero.locator("h1")).toHaveText("Jonathan Dubois");
  await expect(hero.locator("[data-titres]")).toContainText("Ingénieur automatisation IA");
  await expect(hero.locator("[data-titres]")).toContainText("Creative technologist");
  await expect(hero.locator("[data-meta]")).toContainText("Toulouse");
  await expect(hero.locator("a.bouton")).toHaveCount(2);
  await expect(hero.locator("a.bouton.plein")).toHaveAttribute("href", "#realisations");
  await expect(hero.locator("a.bouton.creux")).toHaveAttribute("href", "#contact");
});

test("sans JavaScript, le texte du hero est intact", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-hero] h1")).toBeVisible();
  await expect(page.locator("[data-hero] a.bouton")).toHaveCount(2);
  await ctx.close();
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/hero.spec.ts`
Expected: rouge (`[data-hero]` absent).

- [ ] **Step 3: Écrire `src/components/Hero.astro`**

```astro
---
import { identite } from "../data/identite";
const [t1, t2] = identite.titres;
---
<section class="hero" data-hero aria-label="Présentation">
  <canvas class="toile" data-flux aria-hidden="true"></canvas>
  <div class="texte">
    <h1 class="nom">{identite.nom}</h1>
    <p class="titres" data-titres>{t1}<span class="sep">·</span>{t2}</p>
    <p class="ligne">{identite.ligne}</p>
    <p class="meta" data-meta>{identite.ville} <i>·</i> {identite.disponibilite}</p>
    <div class="ctas">
      <a class="bouton plein" href="#realisations">Voir les réalisations</a>
      <a class="bouton creux" href="#contact">Me contacter</a>
    </div>
  </div>
</section>
<style>
  .hero{position:relative;overflow:hidden;min-height:78vh;display:grid;grid-template-columns:minmax(0,1fr);max-width:var(--colonne);margin-inline:auto}
  .toile{position:absolute;inset:0;width:100%;height:100%;display:block}
  .texte{position:relative;z-index:1;padding:clamp(1.5rem,4vw,3.5rem) 0;align-self:center;max-width:36rem}
  .nom{font-family:var(--display);font-variation-settings:'wdth' 118;font-weight:800;font-size:clamp(2.6rem,6vw,4.6rem);line-height:.95;letter-spacing:-.02em;margin:0 0 1rem;text-wrap:balance}
  .titres{font-family:var(--display);font-variation-settings:'wdth' 100;font-weight:600;font-size:clamp(1.05rem,1.8vw,1.35rem);margin:0 0 1rem;line-height:1.25}
  .sep{color:var(--accent);padding-inline:.35em}
  .ligne{margin:0 0 1.4rem;color:var(--doux);max-width:44ch}
  .meta{font-family:var(--mono);font-size:.8rem;color:var(--doux);margin:0 0 1.6rem}
  .meta i{font-style:normal;color:var(--accent)}
  .ctas{display:flex;gap:.6rem;flex-wrap:wrap}
  /* Téléphone : le graphe passe SOUS le texte (spec § 5). */
  @media (max-width:760px){
    .hero{min-height:auto}
    .texte{padding-bottom:0}
    .toile{position:relative;inset:auto;height:52vh}
  }
</style>
```

- [ ] **Step 4: Réécrire `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
import Hero from "../components/Hero.astro";
import { identite } from "../data/identite";
---
<Base title={`${identite.nom} — ${identite.titres[0]} · ${identite.titres[1]}`} description={identite.descriptionSite}>
  <Hero />
  <main id="contenu" class="colonne">
    <section class="section" id="realisations"><h2>Réalisations</h2></section>
    <section class="section" id="contact"><h2>Contact</h2></section>
  </main>
  <footer class="pied colonne">{identite.nom} · {identite.ville}</footer>
</Base>
```

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts (pages + hero).

- [ ] **Step 6: Mutation** — dans `Hero.astro`, changer `href="#contact"` du bouton creux en `href="#"`. Run `npx playwright test e2e/hero.spec.ts` → rouge. Restaurer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Hero : bloc de positionnement en HTML, lisible sans JavaScript

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 6: Le flux — géométrie pure, testée

**Files:**
- Create: `src/scripts/flux-geometrie.ts`
- Test: `tests/flux-geometrie.test.ts`

**Interfaces:**
- Produces (consommé par la tâche 7) :
  ```ts
  export type Noeud = { l: string; x: number; y: number };
  export type Boite = { cx: number; cy: number; w: number; h: number };
  export type Region = { x: number; y: number; w: number; h: number };
  export const NOEUDS: Noeud[]; export const ARETES: [number, number][]; export const TRAJETS: number[][];
  export const PAS: number; export const DUREE_ARETE: number; export const DEBUT_PULSE: number; export const PERIODE: number; export const SEUIL_ETROIT: number;
  export function region(W: number, H: number): Region;
  export function boite(n: Noeud, R: Region, largeurTexte: number): Boite;
  export function ease(t: number): number;
  export function pointBezier(a: Boite, b: Boite, t: number): { x: number; y: number };
  export function impulsion(t: number, boites: Boite[]): { x: number; y: number; trajet: number } | null;
  ```

- [ ] **Step 1: Écrire le test qui échoue**

`tests/flux-geometrie.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { NOEUDS, ARETES, TRAJETS, DEBUT_PULSE, PERIODE, SEUIL_ETROIT, region, boite, ease, pointBezier, impulsion, type Boite } from "../src/scripts/flux-geometrie";

describe("le graphe", () => {
  it("porte les sept briques réelles de l'estimateur, dans l'ordre", () => {
    expect(NOEUDS.map((n) => n.l)).toEqual([
      "Webhook  /btp-estimation", "Catalogue Notion · 53 prestations", "Compactage", "LLM · T = 0,2",
      "Garde-fous G1–G4", "Notion · Telegram", "Réponse au client",
    ]);
  });
  it("chaque arête relie deux nœuds existants, chaque trajet suit des arêtes", () => {
    for (const [i, j] of ARETES) { expect(NOEUDS[i]).toBeDefined(); expect(NOEUDS[j]).toBeDefined(); }
    for (const t of TRAJETS) for (let k = 0; k < t.length - 1; k++)
      expect(ARETES.some(([i, j]) => i === t[k] && j === t[k + 1]), `${t[k]}→${t[k + 1]}`).toBe(true);
  });
});

describe("region", () => {
  it("bureau : les 53 % de droite", () => {
    expect(region(1000, 700)).toEqual({ x: 440, y: 70, w: 530, h: 560 });
  });
  it("téléphone : toute la largeur moins les marges", () => {
    expect(region(390, 600)).toEqual({ x: 10, y: 12, w: 370, h: 576 });
    expect(SEUIL_ETROIT).toBe(760);
  });
});

describe("boite", () => {
  it("prend la largeur du texte plus 26, plafonnée à la moitié de la région", () => {
    const R = { x: 0, y: 0, w: 400, h: 300 };
    expect(boite({ l: "x", x: 0.5, y: 0.5 }, R, 100)).toEqual({ cx: 200, cy: 150, w: 126, h: 34 });
    expect(boite({ l: "x", x: 0.5, y: 0.5 }, R, 900).w).toBe(200);
  });
});

describe("ease", () => {
  it("est bornée et monotone", () => {
    expect(ease(-1)).toBe(0); expect(ease(2)).toBe(1);
    expect(ease(0.5)).toBeGreaterThan(ease(0.25));
  });
});

describe("pointBezier", () => {
  const a: Boite = { cx: 100, cy: 100, w: 40, h: 34 }, b: Boite = { cx: 300, cy: 200, w: 60, h: 34 };
  it("part du bord droit de a et arrive au bord gauche de b", () => {
    expect(pointBezier(a, b, 0)).toEqual({ x: 120, y: 100 });
    expect(pointBezier(a, b, 1)).toEqual({ x: 270, y: 200 });
  });
});

describe("impulsion", () => {
  const boites: Boite[] = NOEUDS.map((n, i) => ({ cx: 100 * i, cy: 50, w: 40, h: 34 }));
  it("n'existe pas avant DEBUT_PULSE", () => {
    expect(impulsion(DEBUT_PULSE - 1, boites)).toBeNull();
  });
  it("alterne les deux trajets d'un cycle à l'autre", () => {
    expect(impulsion(DEBUT_PULSE, boites)?.trajet).toBe(0);
    expect(impulsion(DEBUT_PULSE + PERIODE, boites)?.trajet).toBe(1);
    expect(impulsion(DEBUT_PULSE + 2 * PERIODE, boites)?.trajet).toBe(0);
  });
  it("avance le long du trajet pendant la période", () => {
    const debut = impulsion(DEBUT_PULSE + 10, boites)!, fin = impulsion(DEBUT_PULSE + PERIODE - 10, boites)!;
    expect(fin.x).toBeGreaterThan(debut.x);
  });
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npm test`
Expected: rouge — module introuvable.

- [ ] **Step 3: Écrire `src/scripts/flux-geometrie.ts`**

```ts
/** Géométrie pure du hero « Le flux » — aucune dépendance au DOM, testée dans vitest. */
export type Noeud = { l: string; x: number; y: number };
export type Boite = { cx: number; cy: number; w: number; h: number };
export type Region = { x: number; y: number; w: number; h: number };

/** Les briques réelles du workflow d'estimation BTP (spec § 5). Coordonnées normalisées dans la région. */
export const NOEUDS: Noeud[] = [
  { l: "Webhook  /btp-estimation", x: 0.04, y: 0.5 },
  { l: "Catalogue Notion · 53 prestations", x: 0.22, y: 0.18 },
  { l: "Compactage", x: 0.4, y: 0.5 },
  { l: "LLM · T = 0,2", x: 0.55, y: 0.18 },
  { l: "Garde-fous G1–G4", x: 0.7, y: 0.5 },
  { l: "Notion · Telegram", x: 0.88, y: 0.22 },
  { l: "Réponse au client", x: 0.88, y: 0.78 },
];
export const ARETES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6]];
/** Les deux chemins que l'impulsion alterne. */
export const TRAJETS: number[][] = [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6]];

export const PAS = 190;          // ms entre deux apparitions de nœud
export const DUREE_ARETE = 320;  // ms pour tracer une arête
export const DEBUT_PULSE = 1700; // ms avant la première impulsion
export const PERIODE = 3400;     // ms pour parcourir un trajet
export const SEUIL_ETROIT = 760; // px : en dessous, le graphe passe sous le texte

export function region(W: number, H: number): Region {
  return W < SEUIL_ETROIT
    ? { x: 10, y: 12, w: W - 20, h: H - 24 }
    : { x: W * 0.44, y: H * 0.1, w: W * 0.53, h: H * 0.8 };
}

export function boite(n: Noeud, R: Region, largeurTexte: number): Boite {
  const w = Math.min(largeurTexte + 26, R.w * 0.5);
  return { cx: R.x + n.x * R.w, cy: R.y + n.y * R.h, w, h: 34 };
}

export function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
}

/** Point à t ∈ [0,1] sur la courbe qui sort du bord droit de a et entre par le bord gauche de b. */
export function pointBezier(a: Boite, b: Boite, t: number): { x: number; y: number } {
  const dx = Math.abs(b.cx - a.cx) * 0.5;
  const p0 = { x: a.cx + a.w / 2, y: a.cy }, p1 = { x: p0.x + dx, y: a.cy };
  const p3 = { x: b.cx - b.w / 2, y: b.cy }, p2 = { x: p3.x - dx, y: b.cy };
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

/** Position de l'impulsion à l'instant t (ms depuis le départ), ou null avant DEBUT_PULSE. */
export function impulsion(t: number, boites: Boite[]): { x: number; y: number; trajet: number } | null {
  if (t < DEBUT_PULSE) return null;
  const cycle = Math.floor((t - DEBUT_PULSE) / PERIODE);
  const ph = ((t - DEBUT_PULSE) % PERIODE) / PERIODE;
  const trajet = cycle % 2, traj = TRAJETS[trajet], seg = traj.length - 1;
  const s = Math.min(seg - 1e-6, ph * seg), i = Math.floor(s), f = s - i;
  const p = pointBezier(boites[traj[i]], boites[traj[i + 1]], f);
  return { x: p.x, y: p.y, trajet };
}
```

- [ ] **Step 4: Lancer les tests**

Run: `npm test`
Expected: tous verts. Si `region(1000,700)` diffère par un flottant (ex. `440.00000000000006`), remplacer `toEqual` par des `toBeCloseTo` champ par champ — ne pas arrondir dans le code.

- [ ] **Step 5: Mutation** — dans `impulsion`, remplacer `cycle % 2` par `0`. Run `npm test` → « alterne les deux trajets » rouge. Restaurer → vert.

- [ ] **Step 6: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Le flux : géométrie pure du graphe (nœuds réels, trajets, impulsion)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 7: Le flux — rendu canvas, boucle arrêtée hors écran, repli

**Files:**
- Create: `src/scripts/flux.ts`
- Modify: `src/components/Hero.astro` (ajouter le `<script>`)
- Modify: `e2e/hero.spec.ts` (ajouter quatre tests)

**Interfaces:**
- Consumes: tout `flux-geometrie.ts` (tâche 6), `canvas[data-flux]` dans `Hero.astro` (tâche 5).
- Produces: `window.__fluxImages: number` — compteur d'images dessinées, instrument des tests (comme le lab d'effets) ; `demarrerFlux(cv, section, reduit)`.

- [ ] **Step 1: Ajouter les tests qui échouent**

Ajouter à `e2e/hero.spec.ts` :
```ts
async function pixelsDessines(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>("canvas[data-flux]")!;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
}

test("le graphe est dessiné et l'impulsion circule", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2600);
  expect(await pixelsDessines(page)).toBeGreaterThan(2000);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(600);
  const b = await page.evaluate(() => window.__fluxImages);
  expect(b).toBeGreaterThan(a!);
});

test("mouvement réduit : graphe fini, une seule image", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(1200);
  expect(await pixelsDessines(page)).toBeGreaterThan(2000);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__fluxImages)).toBe(a);
  expect(a).toBe(1);
  await ctx.close();
});

test("hors écran, la boucle s'arrête ; elle repart au retour", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  const a = await page.evaluate(() => window.__fluxImages);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__fluxImages)).toBe(a);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => window.__fluxImages)).toBeGreaterThan(a!);
});

test("téléphone : le graphe passe sous le texte", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const texte = await page.locator("[data-hero] .texte").boundingBox();
  const toile = await page.locator("canvas[data-flux]").boundingBox();
  expect(toile!.y).toBeGreaterThanOrEqual(texte!.y + texte!.height - 1);
});
```

Et en tête du fichier, la déclaration globale :
```ts
declare global { interface Window { __fluxImages?: number } }
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/hero.spec.ts`
Expected: les quatre nouveaux tests rouges (canvas vide, compteur `undefined`).

- [ ] **Step 3: Écrire `src/scripts/flux.ts`**

```ts
import { NOEUDS, ARETES, PAS, DUREE_ARETE, ease, region, boite, pointBezier, impulsion, type Boite } from "./flux-geometrie";

const ENCRE = "#14161c", TRAIT = "#a39d94", FOND = "#f7f5f2", ACCENT = "#2447e0";
const POLICE = '500 12.5px "IBM Plex Mono", ui-monospace, monospace';

declare global { interface Window { __fluxImages?: number } }

function ajuster(cv: HTMLCanvasElement) {
  const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, W: r.width, H: r.height };
}

function dessiner(cv: HTMLCanvasElement, t: number, reduit: boolean) {
  const { ctx, W, H } = ajuster(cv);
  ctx.clearRect(0, 0, W, H);
  const R = region(W, H);
  ctx.font = POLICE;
  const B: Boite[] = NOEUDS.map((n) => boite(n, R, ctx.measureText(n.l).width));

  // Arêtes, tracées progressivement par échantillonnage.
  for (const [i, j] of ARETES) {
    const k = ease((t - (j * PAS - 120)) / DUREE_ARETE);
    if (k <= 0) continue;
    const a = B[i], b = B[j], N = 40;
    ctx.beginPath();
    const p0 = pointBezier(a, b, 0); ctx.moveTo(p0.x, p0.y);
    for (let s = 1; s <= N * k; s++) { const p = pointBezier(a, b, s / N); ctx.lineTo(p.x, p.y); }
    ctx.strokeStyle = TRAIT; ctx.lineWidth = 1.25; ctx.stroke();
  }

  // Nœuds : boîte à coins arrondis, libellé mono, tronqué si la boîte est contrainte.
  B.forEach((b, i) => {
    const k = ease((t - i * PAS) / 380);
    if (k <= 0) return;
    ctx.save();
    ctx.translate(b.cx, b.cy); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.globalAlpha = k;
    ctx.beginPath(); ctx.roundRect(-b.w / 2, -b.h / 2, b.w, b.h, 5);
    ctx.fillStyle = FOND; ctx.fill(); ctx.strokeStyle = ENCRE; ctx.lineWidth = 1.25; ctx.stroke();
    ctx.fillStyle = ENCRE; ctx.font = POLICE; ctx.textBaseline = "middle"; ctx.textAlign = "center";
    let l = NOEUDS[i].l;
    while (ctx.measureText(l).width > b.w - 16 && l.length > 4) l = l.slice(0, -2) + "…";
    ctx.fillText(l, 0, 1);
    ctx.restore();
  });

  // Impulsion cobalt — jamais en mouvement réduit.
  if (!reduit) {
    const p = impulsion(t, B);
    if (p) {
      ctx.save(); ctx.shadowColor = ACCENT; ctx.shadowBlur = 10; ctx.fillStyle = ACCENT;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  window.__fluxImages = (window.__fluxImages ?? 0) + 1;
}

/** Démarre le hero : une boucle rAF arrêtée hors écran ; en mouvement réduit, une seule image finale. */
export function demarrerFlux(cv: HTMLCanvasElement, section: Element, reduit = matchMedia("(prefers-reduced-motion: reduce)").matches) {
  if (reduit) {
    dessiner(cv, 1e9, true);
    window.addEventListener("resize", () => dessiner(cv, 1e9, true), { passive: true });
    return;
  }
  let actif = false, t0: number | null = null, raf = 0;
  const tick = (now: number) => {
    if (!actif) return;
    if (t0 === null) t0 = now;
    dessiner(cv, now - t0, false);
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (e.isIntersecting && !actif) { actif = true; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && actif) { actif = false; cancelAnimationFrame(raf); }
    }
  }, { threshold: 0.05 });
  io.observe(section);
}

for (const cv of document.querySelectorAll<HTMLCanvasElement>("canvas[data-flux]")) {
  const section = cv.closest("[data-hero]");
  if (section) demarrerFlux(cv, section);
}
```

- [ ] **Step 4: Brancher le script dans `Hero.astro`**

Ajouter, avant le bloc `<style>` de `src/components/Hero.astro` :
```astro
<script>
  import "../scripts/flux";
</script>
```

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts. Si « hors écran » échoue parce que la page est trop courte pour sortir le hero de l'écran : c'est attendu tant que les tâches 8-9 n'ont pas rempli l'accueil — ajouter provisoirement dans `index.astro` une `<div style="height:120vh"></div>` avant le `<footer>`, à retirer à la tâche 9 (le test doit rester vert sans elle après la tâche 9).

- [ ] **Step 6: Mutations** — (a) dans `demarrerFlux`, dans la branche `reduit`, remplacer `return;` par rien (la boucle démarre aussi) → « mouvement réduit » rouge ; restaurer. (b) Dans l'IntersectionObserver, retirer la branche `else if (!e.isIntersecting …)` → « hors écran » rouge ; restaurer. Relancer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Le flux : rendu canvas, boucle arrêtée hors écran, repli reduced-motion

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 8: Accueil — chiffres, cartes des réalisations, vignettes

**Files:**
- Create: `src/components/Chiffres.astro`, `src/components/CarteRealisation.astro`, `src/components/Vignettes.astro`
- Modify: `src/pages/index.astro`
- Test: `e2e/accueil.spec.ts`

**Interfaces:**
- Consumes: `chiffres.json`, `vignettes` (tâche 2), collection `realisations` (tâche 3).
- Produces: sections `#chiffres`, `#realisations` (trois `article[data-carte]` avec un lien vers la page), `#aussi`.

- [ ] **Step 1: Écrire le test qui échoue**

`e2e/accueil.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("trois chiffres, chacun avec sa valeur et son libellé", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#chiffres [data-chiffre]")).toHaveCount(3);
  await expect(page.locator("#chiffres [data-chiffre] strong").first()).not.toBeEmpty();
});

test("trois cartes de réalisation, dans l'ordre, qui mènent aux pages", async ({ page }) => {
  await page.goto("/");
  const cartes = page.locator("#realisations article[data-carte]");
  await expect(cartes).toHaveCount(3);
  await expect(cartes.nth(0).locator("h3")).toContainText("Agent d'estimation");
  await expect(cartes.nth(1).locator("[data-badge]")).toHaveText("Démonstrateur, en construction");
  await expect(cartes.nth(2).locator("h3")).toContainText("Station audio");
  await cartes.nth(0).locator("a").first().click();
  await expect(page).toHaveURL(/\/realisations\/pack-btp\/$/);
});

test("deux vignettes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#aussi [data-vignette]")).toHaveCount(2);
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/accueil.spec.ts`
Expected: rouge.

- [ ] **Step 3: Écrire les composants**

`src/components/Chiffres.astro` :
```astro
---
import chiffres from "../data/chiffres.json";
---
<section class="chiffres" id="chiffres" aria-label="En chiffres">
  {chiffres.map((c) => (
    <p data-chiffre><strong>{c.valeur}</strong> <span>{c.libelle}</span></p>
  ))}
</section>
<style>
  .chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem 2rem;border-top:1px solid var(--trait);border-bottom:1px solid var(--trait);padding-block:1.4rem;margin:0}
  p{margin:0;display:flex;flex-direction:column;gap:.15rem}
  strong{font-family:var(--display);font-variation-settings:'wdth' 112;font-weight:800;font-size:clamp(1.6rem,3vw,2.2rem);letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
  span{font-family:var(--mono);font-size:.8rem;color:var(--doux)}
</style>
```

`src/components/CarteRealisation.astro` :
```astro
---
import type { Realisation } from "../lib/schema-realisation";
interface Props { slug: string; d: Realisation }
const { slug, d } = Astro.props;
const url = `/realisations/${slug}/`;
---
<article class="carte" data-carte>
  {d.badge && <p class="badge" data-badge>{d.badge}</p>}
  <h3><a href={url}>{d.titre}</a></h3>
  <p class="resume">{d.resume}</p>
  <p class="prouve"><span class="etiquette">Ce que ça prouve</span><br />{d.prouve}</p>
  <p class="mono stack">{d.stack.slice(0, 4).join(" · ")}</p>
</article>
<style>
  /* Le lien du titre est étendu à toute la carte par le pseudo-élément — posé sur l'ANCRE, pas sur la carte. */
  .carte{position:relative;border:1px solid var(--trait-fort);border-radius:6px;padding:1.4rem;display:grid;gap:.8rem;align-content:start}
  .carte:hover{border-color:var(--encre)}
  .badge{margin:0;font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
  h3{font-family:var(--display);font-variation-settings:'wdth' 106;font-weight:700;font-size:1.25rem;line-height:1.2;margin:0;text-wrap:balance}
  h3 a{color:var(--encre);text-decoration:none}
  h3 a::after{content:"";position:absolute;inset:0}
  .resume,.prouve{margin:0;font-size:.95rem}
  .prouve{color:var(--doux)}
  .stack{margin:0;font-size:.75rem;color:var(--doux)}
</style>
```

`src/components/Vignettes.astro` :
```astro
---
import { vignettes } from "../data/vignettes";
---
<section class="section" id="aussi">
  <h2>Aussi</h2>
  <div class="grille">
    {vignettes.map((v) => (
      <article data-vignette>
        <h3>{v.url ? <a href={v.url} rel="noopener">{v.titre} ↗</a> : v.titre}</h3>
        <p>{v.texte}</p>
      </article>
    ))}
  </div>
</section>
<style>
  .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:2rem}
  h3{font-family:var(--display);font-variation-settings:'wdth' 106;font-weight:700;font-size:1.1rem;margin:0 0 .5rem}
  h3 a{color:var(--encre);text-decoration:none}
  h3 a:hover{color:var(--accent)}
  p{margin:0;font-size:.95rem;color:var(--doux)}
</style>
```

- [ ] **Step 4: Compléter `src/pages/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import Base from "../layouts/Base.astro";
import Hero from "../components/Hero.astro";
import Chiffres from "../components/Chiffres.astro";
import CarteRealisation from "../components/CarteRealisation.astro";
import Vignettes from "../components/Vignettes.astro";
import { identite } from "../data/identite";

const realisations = (await getCollection("realisations")).sort((a, b) => a.data.ordre - b.data.ordre);
---
<Base title={`${identite.nom} — ${identite.titres[0]} · ${identite.titres[1]}`} description={identite.descriptionSite}>
  <Hero />
  <main id="contenu" class="colonne">
    <Chiffres />
    <section class="section" id="realisations">
      <h2>Trois réalisations</h2>
      <div class="cartes">
        {realisations.map((r) => <CarteRealisation slug={r.id} d={r.data} />)}
      </div>
    </section>
    <Vignettes />
    <section class="section" id="contact"><h2>Contact</h2></section>
  </main>
  <footer class="pied colonne">{identite.nom} · {identite.ville}</footer>
</Base>
<style>
  .cartes{display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:1.2rem}
</style>
```

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts.

- [ ] **Step 6: Mutation** — dans `index.astro`, retirer `.sort(...)` sur la collection. Run `npx playwright test e2e/accueil.spec.ts` → « dans l'ordre » rouge (l'ordre alphabétique met le hub en premier). Restaurer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Accueil : chiffres sourcés, cartes des trois réalisations, vignettes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 9: Accueil — méthode, stack, contact

**Files:**
- Create: `src/components/Methode.astro`, `src/components/Stack.astro`, `src/components/Contact.astro`
- Modify: `src/pages/index.astro`, `e2e/accueil.spec.ts`

**Interfaces:**
- Consumes: `identite`, `stack` (tâche 2).
- Produces: sections `#methode`, `#stack`, `#contact` (avec `a[href^="mailto:"]`).

- [ ] **Step 1: Ajouter les tests qui échouent**

Ajouter à `e2e/accueil.spec.ts` :
```ts
test("méthode en quatre lignes, stack, contact avec mailto et disponibilité", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#methode li")).toHaveCount(4);
  await expect(page.locator("#stack li")).toHaveCount(10);
  const contact = page.locator("#contact");
  await expect(contact.locator('a[href^="mailto:"]')).toHaveAttribute("href", "mailto:duboisjonathan@orange.fr");
  await expect(contact).toContainText("Toulouse");
  await expect(contact).toContainText("Disponible en mission ou en poste");
  // Les liens LinkedIn/GitHub n'apparaissent que s'ils sont renseignés.
  await expect(contact.locator("[data-lien-vide]")).toHaveCount(0);
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/accueil.spec.ts`
Expected: rouge.

- [ ] **Step 3: Écrire les composants**

`src/components/Methode.astro` :
```astro
<section class="section" id="methode">
  <h2>Comment je travaille</h2>
  <ol>
    <li><strong>Une spec écrite avant le code</strong> — le problème, les décisions, ce qui est hors périmètre.</li>
    <li><strong>Un plan en tâches testables</strong> — chaque tâche livre quelque chose qui tourne, avec ses tests.</li>
    <li><strong>Des tests qui prouvent</strong> — une mutation par test : si retirer la fonctionnalité laisse la suite verte, le test est réécrit.</li>
    <li><strong>Une revue, puis la production</strong> — et une vérification en conditions réelles après chaque déploiement, jamais seulement en local.</li>
  </ol>
</section>
<style>
  ol{max-width:65ch;padding-left:1.2rem;display:grid;gap:.8rem;margin:0}
  strong{font-weight:600}
</style>
```

`src/components/Stack.astro` :
```astro
---
import { stack } from "../data/stack";
---
<section class="section" id="stack">
  <h2>Stack</h2>
  <ul class="mono">{stack.map((s) => <li>{s}</li>)}</ul>
</section>
<style>
  ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.5rem .6rem}
  li{border:1px solid var(--trait-fort);border-radius:999px;padding:.35rem .8rem;font-size:.8rem}
</style>
```

`src/components/Contact.astro` :
```astro
---
import { identite } from "../data/identite";
const liens = [
  { libelle: "LinkedIn", url: identite.liens.linkedin },
  { libelle: "GitHub", url: identite.liens.github },
].filter((l) => l.url.length > 0);
---
<section class="section" id="contact">
  <h2>Contact</h2>
  <p class="grand"><a href={`mailto:${identite.email}`}>{identite.email}</a></p>
  <p class="mono meta">{identite.ville} <i>·</i> {identite.disponibilite}</p>
  {liens.length > 0 && <p class="liens">{liens.map((l) => <a href={l.url} rel="noopener">{l.libelle} ↗</a>)}</p>}
</section>
<style>
  .grand{font-family:var(--display);font-variation-settings:'wdth' 108;font-weight:700;font-size:clamp(1.3rem,3vw,2rem);margin:0 0 .8rem;word-break:break-all}
  .grand a{color:var(--encre);text-decoration:none;border-bottom:2px solid var(--accent)}
  .meta{margin:0 0 1rem;font-size:.85rem;color:var(--doux)}
  .meta i{font-style:normal;color:var(--accent)}
  .liens{display:flex;gap:1.2rem;margin:0}
</style>
```

- [ ] **Step 4: Compléter `src/pages/index.astro`**

Importer les trois composants et remplacer la section `#contact` provisoire :
```astro
import Methode from "../components/Methode.astro";
import Stack from "../components/Stack.astro";
import Contact from "../components/Contact.astro";
```
```astro
    <Vignettes />
    <Methode />
    <Stack />
    <Contact />
  </main>
```
Retirer aussi la `<div style="height:120vh">` provisoire de la tâche 7 si elle existe.

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts, y compris « hors écran » du hero sans le bourrage provisoire.

- [ ] **Step 6: Mutation** — dans `Contact.astro`, retirer `.filter(...)` : deux liens vides apparaissent (`href=""`). Le test `[data-lien-vide]` ne peut pas les voir — **c'est une mutation qui survit** : ajouter au composant `data-lien-vide` sur tout lien dont `l.url` est vide n'a pas de sens. Remplacer plutôt le test par : `await expect(contact.locator('a[href=""]')).toHaveCount(0);` → avec la mutation, rouge ; sans, vert. Garder cette version du test.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Accueil : méthode, stack, contact ; l'accueil est complet

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 10: SEO — image Open Graph générée, sitemap, canonical

**Files:**
- Create: `scripts/capturer-og.mjs`, `public/og.png` (généré)
- Test: `e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `Base.astro` (canonical, og:image déjà posés à la tâche 1), `astro.config.mjs` (`site`).
- Produces: `public/og.png` 1200 × 630, capture du hero à l'état final.

- [ ] **Step 1: Écrire le test qui échoue**

`e2e/seo.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

const SITE = "https://jonathan-dubois.pages.dev";

test("sitemap : l'accueil et les trois réalisations", async ({ request }) => {
  const index = await (await request.get("/sitemap-index.xml")).text();
  const m = /<loc>([^<]+)<\/loc>/.exec(index)!;
  const sitemap = await (await request.get(m[1].replace(SITE, ""))).text();
  for (const u of ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"])
    expect(sitemap, u).toContain(`${SITE}${u}`);
});

test("canonical, description et image Open Graph par page", async ({ page, request }) => {
  await page.goto("/realisations/pack-btp/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/realisations/pack-btp/`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /LLM/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBe(`${SITE}/og.png`);
  const r = await request.get("/og.png");
  expect(r.status()).toBe(200);
  expect(Number(r.headers()["content-length"])).toBeGreaterThan(20_000);
});

test("robots.txt pointe le sitemap", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("sitemap-index.xml");
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/seo.spec.ts`
Expected: « image Open Graph » rouge (`/og.png` en 404).

- [ ] **Step 3: Écrire `scripts/capturer-og.mjs`**

```js
// Capture le hero à l'état final en 1200 × 630 → public/og.png.
// Prérequis : `npm run build` fait. Lance lui-même `astro preview` sur 4322 et l'arrête.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const URL = "http://127.0.0.1:4322/";
const serveur = spawn("npx", ["astro", "preview", "--host", "127.0.0.1", "--port", "4322"], { shell: true, stdio: "ignore" });
const attendre = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(URL)).ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error("preview injoignable"); };

try {
  await attendre();
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.evaluate(() => { document.querySelector("[data-hero]").style.minHeight = "630px"; });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: "public/og.png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await navigateur.close();
  console.log("public/og.png écrit");
} finally {
  serveur.kill();
}
```

- [ ] **Step 4: Générer l'image et vérifier son poids**

Run: `npm run build && npm run og && ls -l public/og.png`
Expected: `public/og.png écrit`, fichier entre 30 et 250 ko. **Ouvrir l'image** (Read) et vérifier à l'œil : nom lisible, graphe dessiné en entier, rien de coupé. Si le serveur 4322 ne s'arrête pas : `netstat -ano | findstr :4322` puis `taskkill //PID <pid> //F`.

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts.

- [ ] **Step 6: Mutation** — renommer `public/og.png` en `public/og-x.png`. Run `npx playwright test e2e/seo.spec.ts` → rouge. Restaurer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
SEO : image Open Graph générée depuis le hero, sitemap et canonical testés

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 11: Accessibilité et mobile — contrastes, cibles, focus, 390 px

**Files:**
- Create: `src/lib/couleurs.ts`
- Test: `tests/couleurs.test.ts`, `e2e/mobile.spec.ts`

**Interfaces:**
- Consumes: `JETONS` (tâche 2), `global.css` (tâche 1).
- Produces: `luminance(hex: string): number`, `contraste(a: string, b: string): number`.

- [ ] **Step 1: Écrire les tests qui échouent**

`tests/couleurs.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { JETONS } from "../src/data/jetons";
import { luminance, contraste } from "../src/lib/couleurs";

describe("contraste", () => {
  it("noir sur blanc vaut 21, blanc sur blanc vaut 1", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contraste("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
  it("luminance du blanc = 1, du noir = 0", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 5);
    expect(luminance("#000000")).toBe(0);
  });
});

describe("les jetons du site", () => {
  it("encre, doux et accent passent AA sur le fond (≥ 4,5)", () => {
    expect(contraste(JETONS.encre, JETONS.fond)).toBeGreaterThanOrEqual(7);
    expect(contraste(JETONS.doux, JETONS.fond)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(JETONS.accent, JETONS.fond)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(JETONS.fond, JETONS.encre)).toBeGreaterThanOrEqual(7); // texte clair sur bouton plein
  });
  it("global.css porte exactement les mêmes valeurs", () => {
    const css = readFileSync("src/styles/global.css", "utf8");
    for (const [nom, hex] of Object.entries(JETONS)) expect(css, nom).toContain(hex);
  });
});
```

`e2e/mobile.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

const PAGES = ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"];

for (const u of PAGES) {
  test(`téléphone 390 px : ${u} ne défile pas horizontalement`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(u);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}

test("toutes les cibles cliquables font au moins 44 px de haut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trop = await page.evaluate(() =>
    [...document.querySelectorAll("a.bouton")].map((a) => a.getBoundingClientRect().height).filter((h) => h < 44),
  );
  expect(trop).toEqual([]);
});

test("le focus clavier est visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab"); // lien d'évitement
  await page.keyboard.press("Tab");
  const contour = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(contour).not.toBe("none");
});

test("le lien d'évitement mène au contenu", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator("a.evitement")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenu$/);
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npm test && npx playwright test e2e/mobile.spec.ts`
Expected: `couleurs` rouge (module absent) ; mobile : vert ou rouge selon l'état, on le saura.

- [ ] **Step 3: Écrire `src/lib/couleurs.ts`**

```ts
/** Luminance relative WCAG d'une couleur hex #rrggbb. */
export function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Rapport de contraste WCAG entre deux couleurs, ≥ 1. */
export function contraste(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  const [clair, sombre] = la > lb ? [la, lb] : [lb, la];
  return (clair + 0.05) / (sombre + 0.05);
}
```

- [ ] **Step 4: Lancer les tests et corriger ce qui rougit**

Run: `npm test && npm run e2e`
Expected : tout vert. Si un `scrollWidth` dépasse 390 : trouver l'élément fautif avec `page.evaluate(() => [...document.querySelectorAll("*")].filter(e => e.getBoundingClientRect().right > 390).map(e => e.tagName + "." + e.className))` et corriger le CSS (le suspect habituel est le `figure.schema svg` — il doit rester dans son `.defile` en `overflow-x:auto`).

- [ ] **Step 5: Mutation** — dans `global.css`, remplacer `--doux:#5d6270` par `--doux:#9a9ea8` (trop clair). Run `npm test` → « passent AA » rouge **et** « mêmes valeurs » rouge. Restaurer → vert.

- [ ] **Step 6: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Accessibilité et mobile : contrastes testés, 390 px sans défilement, focus, évitement

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 12: Poids de la première vue et polices auto-hébergées

**Files:**
- Create: `scripts/rapatrier-polices.mjs`, `src/styles/polices.css`, `public/fonts/*.woff2`
- Modify: `src/layouts/Base.astro` (retirer Google Fonts, importer `polices.css`)
- Test: `e2e/poids.spec.ts`

**Interfaces:**
- Consumes: `Base.astro` (tâche 1).
- Produces: `@font-face` locales pour Archivo (variable), IBM Plex Sans 400/600, IBM Plex Mono 400/500 — plage `latin` uniquement (les caractères de `latin-ext` — œ, Œ — ne sont pas employés ; un test le garantit).

- [ ] **Step 1: Écrire le test qui échoue**

`e2e/poids.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("première vue de l'accueil < 1 Mo, aucune requête tierce", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const { total, tiers, polices } = await page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      total: nav.transferSize + rs.reduce((s, r) => s + r.transferSize, 0),
      tiers: rs.map((r) => r.name).filter((n) => !n.startsWith(location.origin)),
      polices: rs.map((r) => r.name).filter((n) => n.endsWith(".woff2")).length,
    };
  });
  expect(tiers).toEqual([]);
  expect(total).toBeLessThan(1_000_000);
  expect(polices).toBeLessThanOrEqual(4);
});

test("le contenu n'emploie aucun caractère hors de la plage latin des polices", async ({ page }) => {
  for (const u of ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/"]) {
    await page.goto(u);
    const texte = await page.evaluate(() => document.body.innerText);
    expect(texte, u).not.toMatch(/[œŒ]/);
  }
});
```

- [ ] **Step 2: Lancer pour voir l'échec**

Run: `npx playwright test e2e/poids.spec.ts`
Expected: « aucune requête tierce » rouge (fonts.googleapis.com, fonts.gstatic.com).

- [ ] **Step 3: Écrire `scripts/rapatrier-polices.mjs`**

```js
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
```

- [ ] **Step 4: Lancer le script et brancher les polices**

Run: `npm run polices && ls -l public/fonts/`
Expected: 4 fichiers (`archivo-400-900.woff2`, `ibm-plex-sans-400.woff2`, `ibm-plex-sans-600.woff2`, `ibm-plex-mono-400.woff2`, `ibm-plex-mono-500.woff2` — soit **5** ; le test tolère ≤ 4 **téléchargés à la première vue** : Plex Mono 500 n'est pas employé sur l'accueil hors canvas ; si le navigateur le charge quand même, passer le seuil du test à 5 et le noter dans le commit). Chaque fichier entre 10 et 120 ko.

Dans `src/layouts/Base.astro` : retirer les deux `<link rel="preconnect">` et le `<link rel="stylesheet" href="https://fonts.googleapis.com/…">` ; ajouter en tête du frontmatter `import "../styles/polices.css";` juste après l'import de `global.css`.

- [ ] **Step 5: Lancer les tests**

Run: `npm run e2e`
Expected: tous verts. Noter le `total` mesuré (l'afficher avec un `console.log` temporaire dans le test, puis le retirer) et le reporter dans le README à la tâche 13.

- [ ] **Step 6: Mutations** — (a) remettre le `<link rel="stylesheet" href="https://fonts.googleapis.com/…">` dans `Base.astro` → « aucune requête tierce » rouge ; retirer. (b) Ajouter dans `index.astro` une `<img src="/og.png">` répétée dix fois → « < 1 Mo » rouge ; retirer. Relancer → vert.

- [ ] **Step 7: Commit**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
Polices auto-hébergées (OFL), première vue pesée sous 1 Mo, zéro tiers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
```

---

### Task 13: README, déploiement sur Cloudflare Pages, vérification en ligne

**Files:**
- Create: `README.md`
- Modify: rien d'autre.

**Interfaces:**
- Consumes: tout.
- Produces: le site en ligne sur `https://jonathan-dubois.pages.dev`.

- [ ] **Step 1: Écrire `README.md`**

````markdown
# Portfolio de Jonathan Dubois

Site personnel statique — Astro 6, Cloudflare Pages. Spec : `docs/superpowers/specs/2026-09-19-portfolio-design.md`.

## Construire et tester

```bash
npm install
npm test          # vitest : contenu, chiffres sourcés, mots interdits, géométrie du hero, contrastes
npm run e2e       # build + Playwright (Chromium, port 4322) : pages, hero, accueil, SEO, mobile, poids
npm run dev       # http://127.0.0.1:4322/
```

Première vue de l'accueil mesurée le <date> : <N> octets (budget 1 000 000).

## Déployer

Sur cette machine, wrangler a besoin de `NODE_OPTIONS=--use-system-ca`.

```bash
# une seule fois
NODE_OPTIONS=--use-system-ca npx wrangler pages project create jonathan-dubois --production-branch=main
# à chaque livraison
npm run build
NODE_OPTIONS=--use-system-ca npx wrangler pages deploy dist --project-name=jonathan-dubois --branch=main --commit-dirty=true
```

**`--branch=main` est obligatoire** : sans lui, Pages fait une prévisualisation à URL aléatoire, pas la production.

Après déploiement, vérifier en ligne (pas en local) : les quatre pages en 200, zéro erreur console, `/og.png` servi.

## Contenu

- Études de cas : `src/content/realisations/*.md` (frontmatter validé par `src/lib/schema-realisation.ts`).
- Chiffres de l'accueil : `src/data/chiffres.json` — chaque chiffre porte sa source.
- Identité et contact : `src/data/identite.ts`. Les liens LinkedIn/GitHub s'affichent dès qu'ils sont renseignés.
- Mots interdits (aucun nom de tiers, aucun lieu) : `src/lib/verifier-contenu.ts`.

## Hero « Le flux »

Canvas 2D sans librairie : `src/scripts/flux-geometrie.ts` (pur, testé) + `src/scripts/flux.ts` (rendu, boucle arrêtée hors écran, repli reduced-motion). Choisi à égalité parmi trois variantes : `docs/design/trois-moments.html`. Note de recherche : `C:\Dev\lab-effets\docs\recherche-portfolio-2026-09-19.md`.

## Polices

Archivo, IBM Plex Sans, IBM Plex Mono — SIL Open Font License 1.1, auto-hébergées dans `public/fonts/` par `npm run polices` (plage latin).

## Image Open Graph

`npm run og` après `npm run build` : capture du hero en 1200 × 630 → `public/og.png`.

## Reste à faire par Jonathan (spec § 10)

photo · domaine perso + Email Routing · profil LinkedIn · compte GitHub puis `git remote add origin … && git push -u origin main` · relire les chiffres · extrait audio Moonkura (ou aucun)
````

Remplacer `<date>` et `<N>` par la mesure de la tâche 12.

- [ ] **Step 2: Suite complète**

Run: `npm test && npm run e2e`
Expected: tout vert.

- [ ] **Step 3: Créer le projet Pages et déployer**

Run (bash) :
```bash
cd /c/Dev/portfolio && npm run build && NODE_OPTIONS=--use-system-ca npx wrangler pages project create jonathan-dubois --production-branch=main && NODE_OPTIONS=--use-system-ca npx wrangler pages deploy dist --project-name=jonathan-dubois --branch=main --commit-dirty=true
```
Expected: URL `https://jonathan-dubois.pages.dev` affichée. **Si le classificateur refuse la commande** : ne pas insister, ne pas changer d'outil ; rapporter la commande exacte à Jonathan pour qu'il la lance avec `!` (c'est le mode de fonctionnement établi sur cette machine). Si `project create` répond que le projet existe déjà, passer au `deploy`.

- [ ] **Step 4: Vérifier en ligne**

Run :
```bash
for u in / /realisations/pack-btp/ /realisations/hub-sante/ /realisations/studio-moonkura/ /og.png /sitemap-index.xml /robots.txt; do printf '%s ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' --ssl-no-revoke "https://jonathan-dubois.pages.dev$u"; done
```
Expected: sept lignes en `200`. Puis ouvrir `https://jonathan-dubois.pages.dev/` dans le navigateur piloté : graphe animé visible, zéro erreur console, mesure `performance.getEntriesByType` < 1 000 000 **avec la compression de Cloudflare** (le chiffre sera inférieur à la mesure locale).

- [ ] **Step 5: Commit final**

```bash
cd /c/Dev/portfolio && git add -A && git commit -q -F - <<'EOF'
README : construction, tests, déploiement, mesure de la première vue

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
EOF
git log --oneline | head -20
```

---

## Auto-revue du plan (faite le 19/09/2026)

**Couverture de la spec.** § 1 positionnement → T2, T5. § 3.1 accueil (7 sections) → T5, T8, T9. § 3.2 gabarit (6 sections, badge) → T4. § 4 jetons, typographie → T1, T2, T11 (concordance CSS/jetons testée), T12 (auto-hébergement). § 5 hero (libellés réels, apparition, impulsion alternée, boucle arrêtée, repli, mobile sous le texte, HTML lisible sans JS) → T5, T6, T7. § 6 contenu des trois études, règles de confidentialité → T3 (mots interdits, badge, ligne de statut). § 6.4 vignettes → T2, T8. § 7 technique : collection + schéma partagé → T3 ; chiffres sourcés → T2 ; tests vitest et Playwright listés → T1–T12 ; budget < 1 Mo et zéro tiers → T12 ; Pages `--branch main` + `404.html` → T1, T13 ; accessibilité → T11 ; SEO (title, description, OG, sitemap, robots) → T1, T10 ; pas de GSAP/Lenis → contrainte globale. § 8 hors périmètre → rien de prévu, conforme. § 9 definition of done → T12 (poids mesuré), T13 (en ligne, 200, console vide, README) ; **dépôt public GitHub = action de Jonathan** (README). § 10 actions de Jonathan → README. § 11 défauts → `site` dans `astro.config.mjs`, projet `jonathan-dubois`, polices en T12, OG en T10.

**Écarts assumés par rapport à la spec.** (1) Le contenu structuré des études est dans le **frontmatter** plutôt que dans le corps Markdown : c'est ce qui permet de le valider par le même schéma dans vitest. (2) « Polices : ≤ 4 fichiers » : cinq fichiers rapatriés, ≤ 4 **téléchargés à la première vue** (Plex Mono 500 ne sert qu'au canvas) — le test porte sur ce que le navigateur charge. (3) « une dizaine » n'est pas un nombre : la spec le formule ainsi ; la source liste les workflows.

**Placeholders.** Aucun « TBD/TODO ». Les `<date>` et `<N>` du README sont remplis à la tâche 13 par une mesure faite à la tâche 12 (instruction explicite).

**Cohérence des noms.** `identite.titres`, `identite.ligne`, `identite.ville`, `identite.disponibilite`, `identite.email`, `identite.liens`, `identite.descriptionSite` — mêmes clés en T2, T5, T8, T9. `data-hero`, `data-flux`, `data-titres`, `data-meta`, `data-badge`, `data-statut-ligne`, `data-prouve`, `data-carte`, `data-vignette`, `data-chiffre` — posés et lus sous le même nom. `window.__fluxImages` — écrit en T7, lu en T7. `schemaRealisation`/`Realisation` — T3, T4, T8. Fonctions de `flux-geometrie.ts` — signatures identiques en T6 et T7. Port 4322 partout.
