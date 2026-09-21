# Portfolio v3 — « Aussi construit » — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter deux études de cas (éditeur de montage vidéo, L'Atelier), remplacer les deux vignettes par une section « Aussi construit » de sept cartes illustrées, et garder chaque affirmation vraie et testée.

**Architecture:** Une nouvelle collection de contenu `aussi` (un `.md` par carte, schéma zod partagé avec les tests) rendue par `CarteAussi.astro` ; les études suivent le schéma existant. Un quatrième statut `arrete` réservé aux cartes ; une règle « production » testée sur tout le contenu. Le pipeline d'images gagne un second dossier source.

**Tech Stack:** Astro 6 (content collections, `astro:assets`), vitest, Playwright, sharp, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-21-portfolio-v3-design.md` (v1 et v2 restent l'autorité pour le reste).

## Global Constraints

- Français partout. Mots interdits (test) : Revel, Dauzats, Virginie, Teulat, « médecin traitant », compagne, « Maison Aube ». Personas Marc / Camille jamais dans les textes.
- « client » seulement dans « client de démonstration » / « aucun client » / « pas encore de client » (`regleClient`).
- **« production »** (toute forme) admis uniquement dans les études `usage` ; refusé dans les packs, le hub, toutes les cartes, `identite.descriptionSite`.
- Statuts : études ∈ {usage, demo, demonstrateur} ; cartes ∈ {usage, demo, demonstrateur, arrete}.
- Images : `captures-brutes/` git-ignoré ; `npm run captures` produit `src/assets/realisations/<slug>/` et `src/assets/aussi/<slug>/` (1 600 px, ≤ 400 Ko, PNG sinon WebP) ; aucun nom réel, e-mail, téléphone, ville dans les pixels ; alt ≥ 10 ; vignettes de carte décoratives (`alt=""`, 640 × 400 `fit="cover" position="top"`).
- Poids : accueil < 350 000 octets (si dépassé : baisser la qualité des vignettes, jamais relever le seuil) ; page d'étude < 1 200 000.
- Chiffres : jamais devinés — relevés (Atelier 141 tests le 21/09 ; éditeur : 470 rushes, 9 blocs, 84 plans, 18 transitions, aucun test) ou recalculés par un test.
- Commits : `git add` par chemin, jamais `-A` ; trailers `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` et `Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP`.
- Commandes : `npm test` (vitest), `npm run build`, `npm run e2e` (build + Playwright, port 4322, jamais deux en parallèle ; serveur résiduel → `netstat -ano | findstr :4322` puis `taskkill /pid <PID> /t /f`, jamais par nom d'image).

**Prérequis captures (contrôleur, avant T2 et T3)** : `captures-brutes/aussi/{demo-immo,watermark,console,superviseur}/` déposées par Jonathan ; `captures-brutes/aussi/{lab-effets,troisieme-etage,pubs-3d}/` prises en ligne par le contrôleur ; `captures-brutes/{editeur-video,atelier}/` déposées par Jonathan. Si `watermark` manque (disque D: absent), le contrôleur tranche : capture de remplacement (l'interface web n'a pas besoin du GPU) ou carte retirée du plan — jamais une image sans rapport.

---

### Task 1 : Statut « arrêté », règle « production », deux lignes de statut

**Files:**
- Modify: `src/lib/verifier-contenu.ts`, `src/components/Badge.astro`, `src/content/realisations/studio-moonkura.md`, `src/content/realisations/site-sages-femmes.md`, `src/data/identite.ts`
- Test: `tests/verifier-contenu.test.ts` (existant — y ajouter), `tests/realisations.test.ts`

**Interfaces:**
- Produces: `Statut = "usage" | "demo" | "demonstrateur" | "arrete"` ; `STATUTS.arrete = "Arrêté"` ; `export function regleProduction(texte: string): string[]` (fragments contenant « production », vide si aucun) ; `Badge.astro` accepte `arrete` (couleur `var(--doux)`, fond `var(--trait)`).

- [ ] **Step 1 : tests qui échouent** — `tests/verifier-contenu.test.ts`, ajouter :
```ts
import { regleProduction, STATUTS } from "../src/lib/verifier-contenu";
describe("regleProduction", () => {
  it("trouve « en production » et « en prod » quelle que soit la casse", () => {
    expect(regleProduction("Mis EN PRODUCTION hier, en prod depuis.")).toEqual(["Mis EN PRODUCTION hier", "en prod depuis"]);
  });
  it("ne signale rien sans le mot", () => {
    expect(regleProduction("Un produit, une productivité, un producteur.")).toEqual([]);
  });
});
describe("STATUTS", () => {
  it("compte quatre statuts, dont « Arrêté »", () => {
    expect(Object.keys(STATUTS)).toEqual(["usage", "demo", "demonstrateur", "arrete"]);
    expect(STATUTS.arrete).toBe("Arrêté");
  });
});
```
`tests/realisations.test.ts`, ajouter dans `describe("les études de cas")` :
```ts
  it("« production » n'apparaît que dans les études en usage", () => {
    for (const f of fichiers) {
      const texte = readFileSync(join(DOSSIER, f), "utf8");
      const fm = frontmatter(texte) as { statut: string };
      if (fm.statut !== "usage") expect(regleProduction(texte), f).toEqual([]);
    }
  });
  it("le studio et le site sages-femmes se disent en production", () => {
    for (const f of ["studio-moonkura.md", "site-sages-femmes.md"]) {
      const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statutLigne: string };
      expect(fm.statutLigne, f).toMatch(/en production/i);
    }
  });
```
et remplacer le test « ne prétend jamais qu'un pack… » par `expect(regleProduction(identite.descriptionSite)).toEqual([]);` (importer `regleProduction`).

- [ ] **Step 2 : voir l'échec** — `npm test` : rouge (`regleProduction` absent, `STATUTS` à trois clés, studio sans « production »).

- [ ] **Step 3 : `verifier-contenu.ts`** :
```ts
export type Statut = "usage" | "demo" | "demonstrateur" | "arrete";
/** Les quatre statuts affichés partout (spec v3 § 2). `arrete` est réservé aux cartes « Aussi construit ». */
export const STATUTS: Record<Statut, string> = {
  usage: "En usage quotidien",
  demo: "Pack de démonstration, en service",
  demonstrateur: "Démonstrateur, en construction",
  arrete: "Arrêté",
};

/** Fragments qui disent « en production » / « en prod » — admis seulement dans les études en usage (spec v3 § 2). */
export function regleProduction(texte: string): string[] {
  const re = /(\S+\s+)?\ben prod(?:uction)?\b(\s+\S+)?/giu;
  return [...texte.matchAll(re)].map((m) => m[0].trim().replace(/[.,;:!?…»)]+$/, ""));
}
```
`Badge.astro` : ajouter `.badge-arrete{color:var(--doux);background:var(--trait);border-color:transparent}`.
`studio-moonkura.md` : `statutLigne: "En production : utilisé au quotidien par deux groupes de musique, depuis un PC, une tablette et un téléphone."`
`site-sages-femmes.md` : `statutLigne: "En production et en usage quotidien par un cabinet de sages-femmes depuis juin 2026 ; construit comme la vitrine de ce que je sais faire pour un praticien."`
`identite.ts` : `descriptionSite` inchangée pour l'instant (« Cinq » → T4).

- [ ] **Step 4 : vérifier** — `npm test` vert. **Mutation** : écrire « en production » dans `statutLigne` de `pack-btp.md` → rouge ; restaurer. `npm run build` puis `npx playwright test e2e/pages.spec.ts` (badges inchangés).

- [ ] **Step 5 : commit** — `Statuts : « Arrêté », règle « production », studio et sages-femmes en production`.

---

### Task 2 : Collection « Aussi construit » — schéma, sept cartes, composant, tests

**Prérequis** : les sept dossiers `captures-brutes/aussi/<slug>/` contiennent au moins une image.

**Files:**
- Create: `src/lib/schema-aussi.ts`, `src/content/aussi/{demo-immo,watermark,console,superviseur,lab-effets,troisieme-etage,pubs-3d}.md`, `src/components/CarteAussi.astro`, `src/components/AussiConstruit.astro`, `tests/aussi.test.ts`, `src/assets/aussi/<slug>/…` (sorties du script)
- Modify: `src/content.config.ts`, `src/lib/images.ts`, `scripts/preparer-captures.mjs`, `src/pages/index.astro`, `tests/realisations.test.ts` (liste scannée), `tests/liens-externes.test.ts`, `e2e/accueil.spec.ts`
- Delete: `src/data/vignettes.ts`, `src/components/Vignettes.astro`

**Interfaces:**
- Produces: `schemaAussi`, type `Aussi` ; collection `aussi` ; `imageAussi(slug, fichier): ImageMetadata` ; `<AussiConstruit />` rend `<section id="aussi">` avec `article[data-aussi]` ; `npm run captures` traite `captures-brutes/aussi/*`.

- [ ] **Step 1 : tests qui échouent** — `tests/aussi.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { schemaAussi } from "../src/lib/schema-aussi";
import { INTERDITS, PERSONAS, motsInterdits, regleClient, regleProduction } from "../src/lib/verifier-contenu";
import { frontmatter } from "./lib/frontmatter";

const DOSSIER = join(process.cwd(), "src/content/aussi");
const ASSETS = join(process.cwd(), "src/assets/aussi");
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md")).sort();
type Carte = { statut: string; ordre: number; image: { fichier: string; alt: string }; lien?: { url: string; libelle: string } };

describe("les cartes « Aussi construit »", () => {
  it("sont exactement sept", () => {
    expect(fichiers).toEqual(["console.md", "demo-immo.md", "lab-effets.md", "pubs-3d.md", "superviseur.md", "troisieme-etage.md", "watermark.md"]);
  });
  for (const f of fichiers) {
    const slug = f.replace(/\.md$/, ""), texte = readFileSync(join(DOSSIER, f), "utf8"), fm = frontmatter(texte) as Carte;
    it(`${f} respecte le schéma`, () => {
      const r = schemaAussi.safeParse(fm);
      expect(r.success, JSON.stringify(r.success ? null : r.error.issues, null, 1)).toBe(true);
    });
    it(`${f} : aucun mot interdit, aucune persona, règle client, jamais « production »`, () => {
      expect(motsInterdits(texte, [...INTERDITS, ...PERSONAS])).toEqual([]);
      expect(regleClient(texte)).toEqual([]);
      expect(regleProduction(texte)).toEqual([]);
    });
    it(`${f} : son image existe, ≤ 400 Ko, seule dans son dossier`, () => {
      const p = join(ASSETS, slug, fm.image.fichier);
      expect(existsSync(p), p).toBe(true);
      expect(statSync(p).size).toBeLessThanOrEqual(400_000);
      expect(readdirSync(join(ASSETS, slug))).toEqual([fm.image.fichier]);
    });
  }
  it("les ordres sont 1..7 sans doublon", () => {
    const ordres = fichiers.map((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as Carte).ordre).sort((a, b) => a - b);
    expect(ordres).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("exactement deux cartes sont arrêtées : la démo immo et le watermark", () => {
    const arretees = fichiers.filter((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as Carte).statut === "arrete");
    expect(arretees).toEqual(["demo-immo.md", "watermark.md"]);
  });
  it("aucun dossier d'assets sans carte", () => {
    expect(readdirSync(ASSETS).sort()).toEqual(fichiers.map((f) => f.replace(/\.md$/, "")));
  });
});
```
`e2e/accueil.spec.ts` : remplacer « deux vignettes » et « l'atelier est annoté » par :
```ts
test("sept cartes « Aussi construit », illustrées, deux arrêtées, trois liens externes", async ({ page }) => {
  await page.goto("/");
  const cartes = page.locator("#aussi article[data-aussi]");
  await expect(cartes).toHaveCount(7);
  await expect(page.locator("#aussi h2")).toHaveText("Aussi construit");
  await expect(page.locator("#aussi [data-vignette]")).toHaveCount(0);
  await expect(page.locator("#aussi [data-badge][data-statut='arrete']")).toHaveCount(2);
  await expect(page.locator("#aussi a[href^='http'][target='_blank'][rel='noopener']")).toHaveCount(3);
  await expect(cartes.nth(0).locator("a[href='/automatisations/#immo']")).toHaveCount(1);
  const img = cartes.nth(0).locator("img");
  await expect(img).toHaveAttribute("loading", "lazy");
  await expect(img).toHaveAttribute("alt", "");
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
```

- [ ] **Step 2 : voir l'échec** — `npm test` rouge (`schema-aussi` absent).

- [ ] **Step 3 : schéma et collection** — `src/lib/schema-aussi.ts` :
```ts
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
```
`src/content.config.ts` : ajouter
```ts
import { schemaAussi } from "./lib/schema-aussi";
const aussi = defineCollection({ loader: glob({ pattern: "*.md", base: "./src/content/aussi" }), schema: schemaAussi });
export const collections = { realisations, aussi };
```
`src/lib/images.ts` : ajouter un second glob et `imageAussi` :
```ts
const fichiersAussi = import.meta.glob<{ default: ImageMetadata }>("/src/assets/aussi/*/*.{png,webp}", { eager: true });
export function imageAussi(slug: string, fichier: string): ImageMetadata {
  const m = fichiersAussi[`/src/assets/aussi/${slug}/${fichier}`];
  if (!m) throw new Error(`Image absente : aussi/${slug}/${fichier}`);
  return m.default;
}
```
`scripts/preparer-captures.mjs` : remplacer la boucle par une fonction appelée deux fois — `traiter("captures-brutes", "src/assets/realisations", ["telegram", "aussi"])` puis `traiter("captures-brutes/aussi", "src/assets/aussi", [])` (le paramètre = dossiers à ignorer) ; même traitement sharp ; le message final additionne les deux comptes.

- [ ] **Step 4 : `npm run captures`** — puis relire chaque image produite dans `src/assets/aussi/` (Read) : aucun nom réel, e-mail, téléphone, ville ; noms de prospects masqués sur le superviseur. Si une image en montre : la signaler dans le rapport, ne pas la committer.

- [ ] **Step 5 : les sept cartes** — un fichier par ligne du tableau spec § 4, fichier image = celui produit à l'étape 4. Modèle (`demo-immo.md`) :
```yaml
---
titre: "Démo agence immobilière"
phrase: "Douze workflows et un cockpit pour une agence immobilière ; démonstrateur arrêté faute de pilote."
statut: arrete
ordre: 1
lien: { libelle: "Les 12 workflows dans l'inventaire", url: "/automatisations/#immo" }
image: { fichier: "cockpit-immo.png", alt: "Cockpit de la démo immobilière : agenda des visites et biens en cours." }
---
```
Les six autres : `watermark` (arrete, 2, sans lien, phrase « Suppression de filigrane vidéo par inpainting sur un GPU de 6 Go, interface web, 31 tests ; dormant depuis juillet 2026 »), `console` (usage, 3, sans lien), `superviseur` (usage, 4, sans lien), `lab-effets` (usage, 5, lien « La planche des effets » → `https://lab-effets.expertia059.workers.dev`), `troisieme-etage` (usage, 6, lien « Le site » → `https://troisieme-etage-v2.pages.dev`, phrase avec « 93 tests unitaires et 116 tests navigateur » repris de la vignette v2), `pubs-3d` (usage, 7, lien « La pub thérapeutes » → `https://aelto.fr/p/therapeutes`). Les `alt` décrivent ce qui est visible sur l'image produite.

- [ ] **Step 6 : composants** — `src/components/CarteAussi.astro` :
```astro
---
import { Image } from "astro:assets";
import type { Aussi } from "../lib/schema-aussi";
import { imageAussi } from "../lib/images";
import Badge from "./Badge.astro";
interface Props { slug: string; d: Aussi }
const { slug, d } = Astro.props;
const externe = d.lien && /^https?:/.test(d.lien.url);
---
<article class="carte" data-aussi>
  <Image src={imageAussi(slug, d.image.fichier)} alt="" width={640} height={400} fit="cover" position="top" format="webp" loading="lazy" decoding="async" class="vignette" />
  <Badge statut={d.statut} />
  <h3>{d.titre}</h3>
  <p>{d.phrase}</p>
  {d.lien && (externe
    ? <a class="lien" href={d.lien.url} target="_blank" rel="noopener">{d.lien.libelle} ↗</a>
    : <a class="lien" href={d.lien.url}>{d.lien.libelle} →</a>)}
</article>
<style>
  .carte{border:1px solid var(--trait);border-radius:6px;padding:1.2rem;display:grid;gap:.7rem;align-content:start}
  .vignette{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;border-radius:4px}
  h3{font-family:var(--display);font-variation-settings:'wdth' 106;font-weight:700;font-size:1.1rem;line-height:1.2;margin:0;text-wrap:balance}
  p{margin:0;font-size:.92rem;color:var(--doux)}
  .lien{font-size:.9rem;color:var(--encre);text-decoration:none;border-bottom:1px solid var(--accent);width:max-content}
</style>
```
`src/components/AussiConstruit.astro` :
```astro
---
import { getCollection } from "astro:content";
import CarteAussi from "./CarteAussi.astro";
const cartes = (await getCollection("aussi")).sort((a, b) => a.data.ordre - b.data.ordre);
---
<section class="section" id="aussi">
  <h2>Aussi construit</h2>
  <p class="intro">Ce qui n'a pas sa page mais a tourné — avec son statut vrai.</p>
  <div class="grille">{cartes.map((c) => <CarteAussi slug={c.id} d={c.data} />)}</div>
</section>
<style>
  .intro{margin:0 0 1.4rem;color:var(--doux)}
  .grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1.2rem}
</style>
```
`index.astro` : `import AussiConstruit from "../components/AussiConstruit.astro";` à la place de `Vignettes`, `<AussiConstruit />` à la place de `<Vignettes />`. Supprimer `src/data/vignettes.ts` et `src/components/Vignettes.astro` (`git rm`).

- [ ] **Step 7 : tests qui dépendaient des vignettes** — `tests/realisations.test.ts` : retirer `"src/data/vignettes.ts"` de `FICHIERS_DONNEES_SCANNES`. `tests/liens-externes.test.ts` : remplacer l'import et la boucle `vignettes` par la collecte des cartes :
```ts
const DOSSIER_AUSSI = join(process.cwd(), "src/content/aussi");
for (const f of readdirSync(DOSSIER_AUSSI).filter((n) => n.endsWith(".md"))) {
  const fm = frontmatter(readFileSync(join(DOSSIER_AUSSI, f), "utf8")) as { lien?: { url: string; libelle: string } };
  if (fm.lien && /^https?:/.test(fm.lien.url)) urls.push({ url: fm.lien.url, origine: `aussi/${f}`, texte: fm.lien.libelle });
}
```
(mettre à jour le commentaire « Toutes les URL publiées »).

- [ ] **Step 8 : vérifier** — `npm test`, `npm run build`, `npm run e2e` verts. **Regarder** l'accueil à 1280 et 390 px (capture dans le scratchpad de la session, jamais dans le dépôt) : sept cartes alignées, badges lisibles, « Arrêté » gris. **Mutation** : `ordre: 3` sur `watermark.md` → « sans doublon » rouge ; restaurer. Poids de l'accueil mesuré (`e2e/poids.spec.ts`) noté dans le rapport.

- [ ] **Step 9 : commit** — `Aussi construit : sept cartes illustrées, collection et schéma, vignettes retirées` (assets `src/assets/aussi/` inclus, par chemin).

---

### Task 3 : Deux études — éditeur vidéo, L'Atelier — et l'ordre des sept

**Prérequis** : `captures-brutes/editeur-video/` (≥ 3) et `captures-brutes/atelier/` (≥ 3) déposées ; `npm run captures` relancé ; images relues (aucune personne réelle reconnaissable dans l'Atelier).

**Files:**
- Create: `src/content/realisations/editeur-video.md`, `src/content/realisations/atelier.md`, `src/assets/realisations/{editeur-video,atelier}/…`
- Modify: `src/content/realisations/studio-moonkura.md` (`ordre: 4`), `hub-sante.md` (`ordre: 7`), `tests/realisations.test.ts`, `e2e/pages.spec.ts`, `e2e/mobile.spec.ts`, `e2e/seo.spec.ts`

- [ ] **Step 1 : tests** — `tests/realisations.test.ts` : liste attendue `["atelier.md","editeur-video.md","hub-sante.md","pack-btp.md","pack-therapeutes.md","site-sages-femmes.md","studio-moonkura.md"]`, ordres `[1,2,3,4,5,6,7]`, titres « sont exactement sept » ; ajouter :
```ts
  it("l'ordre de l'accueil est celui de la spec v3", () => {
    const ordre = (f: string) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { ordre: number }).ordre;
    expect(["pack-btp.md", "pack-therapeutes.md", "site-sages-femmes.md", "studio-moonkura.md", "editeur-video.md", "atelier.md", "hub-sante.md"].map(ordre)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("l'Atelier annonce ses 141 tests et l'éditeur vidéo dit n'en avoir aucun", () => {
    const preuves = (f: string) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { preuves: string[] }).preuves.join(" ");
    expect(preuves("atelier.md")).toContain("141 tests");
    expect(preuves("editeur-video.md")).toMatch(/aucune suite de tests/i);
  });
```
`e2e/pages.spec.ts` : boucle des slugs → les sept ; table des badges + `atelier: "En usage quotidien"`, `"editeur-video": "En usage quotidien"` ; test des liens d'inventaire : les cinq sans `metier` (hub, sages-femmes, studio, editeur-video, atelier) → 0 ; ajouter :
```ts
test("l'Atelier publie son lien annoté « accès sur invitation »", async ({ page }) => {
  await page.goto("/realisations/atelier/");
  const a = page.locator('a[href^="https://atelier.aelto.fr"]');
  await expect(a).toHaveCount(1);
  await expect(a).toContainText("accès sur invitation");
});
```
`e2e/mobile.spec.ts` `PAGES` et `e2e/seo.spec.ts` : ajouter `/realisations/editeur-video/` et `/realisations/atelier/` ; titre du test seo → « l'accueil et les sept réalisations ».

- [ ] **Step 2 : voir l'échec** — `npm test` rouge.

- [ ] **Step 3 : contenu** — `editeur-video.md` et `atelier.md` d'après la spec v3 § 3.1 et § 3.2 (titre, prouve, statut `usage`, statutLigne, ordre 5 / 6, resume ≤ 240, contexte, `construit` 6-8 puces, schema, preuves, incident, stack, liens : `[]` pour l'éditeur, `[{ libelle: "L'Atelier (accès sur invitation)", url: "https://atelier.aelto.fr" }]` pour l'Atelier, `images` ≥ 3 = fichiers produits, alt décrivant les pixels, légende d'une phrase). Chiffres tels que relevés (470 rushes, 9 blocs, 84 plans, 18 transitions, 141 tests) — si le dossier dit autre chose à la rédaction, écrire ce que dit le dossier. `studio-moonkura.md` → `ordre: 4` ; `hub-sante.md` → `ordre: 7`.

- [ ] **Step 4 : vérifier** — `npm test`, `npm run build`, `npm run e2e` verts. **Mutation** : `ordre: 5` sur `atelier.md` → rouge ; restaurer. Regarder les deux nouvelles pages (capture scratchpad) : galeries nettes, légendes lisibles.

- [ ] **Step 5 : commit** — `Études : l'éditeur de montage vidéo et L'Atelier ; sept réalisations dans l'ordre`.

---

### Task 4 : Accueil — « Sept réalisations », description, chiffres 9 et 2 000+

**Files:**
- Modify: `src/pages/index.astro`, `src/data/identite.ts`, `src/data/chiffres.json`, `tests/chiffres.test.ts`, `e2e/accueil.spec.ts`, `e2e/images.spec.ts`

- [ ] **Step 1 : tests** — `tests/chiffres.test.ts` : remplacer « liste huit noms » par :
```ts
  it("le chiffre des applications est le nombre de noms de sa source", () => {
    expect(chiffres[2].valeur).toBe(String(chiffres[2].source.split("·").length));
    expect(chiffres[2].source).toContain("lab-effets.expertia059.workers.dev");
  });
  it("le chiffre des tests est la somme écrite dans sa source, arrondie vers le bas", () => {
    const nombres = [...chiffres[1].source.matchAll(/(\d[\d ]*\d|\d) (?:vitest|e2e|pytest)/g)].map((m) => Number(m[1].replace(/ /g, "")));
    const somme = nombres.reduce((s, n) => s + n, 0);
    expect(chiffres[1].source).toContain(`somme ${somme.toLocaleString("fr-FR")}`);
    expect(chiffres[1].valeur).toBe(`${Math.floor(somme / 1000)} 000+`);
  });
```
(pour 2 067 : `Math.floor(2067 / 1000) = 2` → « 2 000+ » ; `toLocaleString("fr-FR")` rend « 2 067 » avec une espace insécable étroite — écrire la source avec exactement ce caractère, ou comparer après normalisation `.replace(/\s/g, " ")` des deux côtés.)
`e2e/accueil.spec.ts` : « cinq cartes » → « sept cartes » : count 7, nth(3) « Station audio » badge « En usage quotidien », nth(4) h3 contient « montage », nth(5) h3 contient « Atelier », nth(6) badge « Démonstrateur, en construction ». `e2e/images.spec.ts` : `toHaveCount(5)` → 7, titre du test « les sept cartes… ».

- [ ] **Step 2 : voir l'échec** — rouge.

- [ ] **Step 3 : contenu** — `index.astro` : `<h2>Sept réalisations</h2>`. `identite.ts` : « Sept réalisations documentées, testées et pesées. ». `chiffres.json` : `[1]` → `valeur "2 000+"`, source « suites relancées le 19/09/2026 : hub 177 vitest + 56 e2e, vitrine 61 vitest + 70 e2e, moteur de séparation 97 pytest, Troisième Étage 93 vitest + 116 e2e ; studio 1 256 pytest (journal du dépôt) ; L'Atelier 141 vitest (relancés le 21/09/2026) — somme 2 067 » ; `[2]` → `valeur "9"`, source + « · lab-effets.expertia059.workers.dev » avant « — relevé le 21/09/2026 ».

- [ ] **Step 4 : vérifier** — `npm test`, `npm run build`, `npm run e2e` verts ; poids de l'accueil noté (< 350 000 ; sinon baisser `quality` des vignettes dans `CarteAussi`/`CarteRealisation` via l'attribut `quality={70}` d'`<Image>`, et le dire). **Mutation** : `"valeur": "2 100+"` → rouge ; restaurer.

- [ ] **Step 5 : commit** — `Accueil : sept réalisations, neuf applications, 2 000+ tests`.

---

### Task 5 : README, déploiement, vérification en ligne

- [ ] **Step 1 : README** — « Contenu » : sept études, la collection `aussi` (sept cartes, pas de page, statut `arrete`), la règle « production » ; « Images » : second dossier `captures-brutes/aussi/`, captures de Jonathan ; « Tests » : totaux réels de `npm test` et `npm run e2e` ; en-tête : spec v3 citée ; « Reste à faire » : retirer ce qui est fait.
- [ ] **Step 2 : déployer** — `npm test && npm run e2e` verts ; `npm run build && npm run og` (`git status` : commit l'og s'il a changé) ; `$env:NODE_OPTIONS="--use-system-ca"; npx wrangler pages deploy dist --project-name=jonathan-dubois --branch=main --commit-dirty=true` ; curl 200 sur `https://jonathan-dubois.dev` : `/`, `/automatisations/`, les sept `/realisations/<slug>/`, `/sitemap-index.xml`, `/robots.txt`, `/og.png` ; navigateur : `/` sans erreur console, section `#aussi` avec ses sept images chargées.
- [ ] **Step 3 : commit** — `README v3 : aussi construit, sept études, déploiement`.

---

## Auto-revue du plan

**Couverture de la spec v3.** § 1 décisions → T3 (sept études, ordre), T2 (sept cartes, exclusions respectées : pas d'Al'Tarba, pas d'ortho), T1 (`arrete`, « production »). § 2 honnêteté → T1 (STATUTS, `regleProduction`, deux statutLigne, description en T4), T2 (cartes scannées). § 3 études → T3 (contenu, images ≥ 3, chiffres relevés). § 4 cartes → T2 (schéma, assets, composant, table). § 5 accueil et chiffres → T4. § 6 images → T2/T3 (script, relecture). § 7 tests → T1-T4 ; déploiement → T5. § 8 actions de Jonathan → prérequis T2/T3.

**Placeholders.** Aucun ; les textes des études viennent de la spec § 3, ceux des cartes de la table § 4.

**Cohérence des noms.** `Statut`/`STATUTS`/`regleProduction` (T1) lus par T2 (`tests/aussi`), T3, T4 ; `schemaAussi`/`Aussi`/`imageAussi`/`data-aussi`/`AussiConstruit` (T2) lus par T2 e2e et T5 ; `imageDe` inchangé ; `poidsPremiereVue` réutilisé ; `frontmatter` partagé.
