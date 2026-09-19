# Portfolio v2 « montrer, pas raconter » — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire du portfolio un site qui montre : un inventaire vérifié des 100 workflows, cinq études de cas avec images et un statut honnête sur chaque élément, sans jamais laisser croire à un client qui n'existe pas.

**Architecture:** Même site Astro 6 ; la collection `realisations` gagne `images` et un `statut` à trois valeurs dont dérive un badge partagé ; une page `/automatisations/` rend une liste typée dont le métier commande le statut ; les images passent par `astro:assets` (WebP, lazy) depuis `src/assets/realisations/<slug>/`, préparées par un script `sharp` à partir de captures brutes git-ignorées.

**Tech Stack:** Astro ^6.4 · `astro:assets` (`sharp` 0.34.5 déjà installé) · vitest · Playwright · `yaml` (tests) · Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md` (autorité) ; la v1 `docs/superpowers/specs/2026-09-19-portfolio-design.md` reste valable pour tout le reste.

## Global Constraints

- **Dépôt** `C:\Dev\portfolio`, branche **`v2-montrer`** (part de `main` = 16eab9a). Commit après chaque tâche ; **chaque message se termine par** :
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Y1pgYfq7LfJdiK22Gvx5wP
  ```
- Toute exécution e2e après une modification de source : `npm run e2e`, ou `npm run build && npx playwright test <fichier>`. Port 4322 ; PID, jamais nom d'image. Une mutation par test nouveau.
- **Mots interdits** (contenu publié, inventaire compris) : `Revel`, `Dauzats`, `Virginie`, `Teulat`, `médecin traitant`, **`compagne`**, **`Maison Aube`**. Personas jamais nommées dans l'inventaire (« Marc », « Camille » → « l'artisan », « la praticienne »). **Règle « client »** (BTP, thérapeutes, immo, hub, inventaire) : chaque occurrence de `client`/`cliente` est immédiatement suivie de ` de démonstration` ou précédée de `aucun ` / `pas encore de ` — sinon test rouge.
- **Statuts** : `usage` = « En usage quotidien », `demo` = « Pack de démonstration, en service », `demonstrateur` = « Démonstrateur, en construction ». Libellés définis **une fois** (`STATUTS` dans `verifier-contenu.ts`), rendus par `Badge.astro` partout.
- **Comptes du 19/09/2026** (export API n8n, non committé) : 100 workflows, 93 actifs ; par métier : btp 29, therapeutes 37, immo 12, sagesfemmes 6, hub 5, interne 11. Les 7 inactifs : digest IA, agent sub Notion, standard ×3 (SMS entrant, réponse vocale, message manqué), outil e-mail manuel, veille Fable.
- **Images** : PNG 1 600 px de large, ≤ 400 000 octets, `alt` et `legende` obligatoires, ≥ 2 par étude ; accueil < 1 000 000 o, page d'étude < 1 200 000 o mesurés. Captures brutes dans `captures-brutes/` (git-ignoré), relues à l'œil ; toute donnée réelle (e-mail, téléphone, nom hors persona) = capture recadrée ou écartée.
- Copie en français, sans anglicisme évitable. Le site ne dit jamais « en production » d'un pack de démonstration.

---

## Structure des fichiers

```
src/lib/verifier-contenu.ts        — + STATUTS, INTERDITS étendus, regleClient(), PERSONAS       (T1)
src/lib/schema-realisation.ts      — statut à 3 valeurs, statutLigne obligatoire, images[]       (T1, T4)
src/components/Badge.astro         — badge de statut partagé                                     (T1)
src/pages/realisations/[slug].astro — badge pour tous, Galerie, lien inventaire                  (T1, T4)
src/components/CarteRealisation.astro — badge pour tous, vignette image                          (T1, T4)
src/data/automatisations.ts        — 100 lignes typées + METIERS                                 (T2)
src/pages/automatisations.astro    — la page inventaire                                          (T2)
src/components/Tuiles.astro        — six tuiles par métier (accueil)                             (T3)
src/components/Chiffres.astro      — inchangé ; chiffres.json réécrit                             (T3)
src/data/chiffres.json · vignettes.ts — 100·93, 8 applications ; atelier annoté                 (T3)
src/pages/index.astro              — « Cinq réalisations », Tuiles                               (T3)
scripts/preparer-captures.mjs      — captures-brutes → src/assets (1 600 px, ≤ 400 Ko)           (T4)
src/components/Galerie.astro       — figures d'une étude (astro:assets)                          (T4)
src/assets/realisations/<slug>/    — images préparées (committées)                               (T4-T8)
src/content/realisations/pack-btp.md (réécrite), pack-therapeutes.md, site-sages-femmes.md       (T5-T7)
src/content/realisations/hub-sante.md, studio-moonkura.md — + images, statut                     (T8)
tests/statuts.test.ts, automatisations.test.ts, images.test.ts ; realisations.test.ts, liens-externes.test.ts modifiés (T1, T2, T4, T9)
e2e/inventaire.spec.ts, images.spec.ts ; accueil.spec.ts, poids.spec.ts, mobile.spec.ts modifiés (T2, T3, T4, T9)
README.md                                                                                       (T10)
```

**Prérequis hors tâche (contrôleur, avant T4)** : captures brutes déposées dans `captures-brutes/<slug>/` :
`pack-btp/canvas-agent-terrain.png` (n8n, 35 nœuds) · `pack-btp/cockpit-demandes.png` · `pack-btp/telegram-visite.png` (Jonathan) · `pack-therapeutes/canvas-routeur.png` (56 nœuds) · `pack-therapeutes/cockpit-planning.png` · `pack-therapeutes/telegram-rappel.png` (Jonathan) · `site-sages-femmes/accueil.png` · `site-sages-femmes/contractions.png` · `site-sages-femmes/assistante.png` · `site-sages-femmes/vrai-faux.png` · `hub-sante/batiment.png` · `hub-sante/reunion.png` · `hub-sante/cockpit.png` · `studio-moonkura/editeur.png` · `studio-moonkura/pistes.png`. Les captures Telegram sont facultatives (chaque étude en a déjà deux sans elles).

---

### Task 1: Statuts à trois valeurs, badge partagé, règles de contenu

**Files:**
- Modify: `src/lib/verifier-contenu.ts`, `src/lib/schema-realisation.ts`, `src/pages/realisations/[slug].astro`, `src/components/CarteRealisation.astro`, `src/content/realisations/{pack-btp,hub-sante,studio-moonkura}.md` (frontmatter seulement)
- Create: `src/components/Badge.astro`
- Test: `tests/statuts.test.ts`, modify `tests/realisations.test.ts`

**Interfaces:**
- Produces: `STATUTS: Record<Statut, string>`, type `Statut = "usage" | "demo" | "demonstrateur"`, `PERSONAS: string[]`, `regleClient(texte: string): string[]` (les occurrences fautives), `INTERDITS` étendu ; `Badge.astro` `Props { statut: Statut }` rendant `<p class="badge" data-badge>{STATUTS[statut]}</p>` ; schéma : `statut: z.enum(["usage","demo","demonstrateur"])`, `statutLigne: z.string().min(20)` obligatoire, `badge` **supprimé**.

- [ ] **Step 1: Tests qui échouent**

`tests/statuts.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { STATUTS, PERSONAS, INTERDITS, regleClient } from "../src/lib/verifier-contenu";

describe("statuts", () => {
  it("a exactement trois libellés, dans les mots de la spec", () => {
    expect(STATUTS).toEqual({
      usage: "En usage quotidien",
      demo: "Pack de démonstration, en service",
      demonstrateur: "Démonstrateur, en construction",
    });
  });
  it("interdit aussi « compagne » et « Maison Aube »", () => {
    expect(INTERDITS).toContain("compagne");
    expect(INTERDITS).toContain("Maison Aube");
  });
  it("PERSONAS nomme les personas de démonstration", () => {
    expect(PERSONAS).toEqual(["Marc", "Camille"]);
  });
});

describe("regleClient", () => {
  it("accepte « client de démonstration » et « aucun client »", () => {
    expect(regleClient("Un client de démonstration. Aucun client réel. Pas encore de cliente.")).toEqual([]);
  });
  it("refuse un client nu", () => {
    expect(regleClient("Le client reçoit un e-mail.")).toEqual(["Le client reçoit"]);
  });
  it("est insensible à la casse et voit « cliente »", () => {
    expect(regleClient("La Cliente confirme.")).toEqual(["La Cliente confirme"]);
  });
});
```

Dans `tests/realisations.test.ts`, remplacer le test « le hub porte le badge de démonstrateur » par :
```ts
  it("chaque étude porte un statut et une ligne de statut", () => {
    for (const f of fichiers) {
      const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statut: string; statutLigne?: string; badge?: string };
      expect(["usage", "demo", "demonstrateur"], f).toContain(fm.statut);
      expect(fm.statutLigne?.length ?? 0, f).toBeGreaterThanOrEqual(20);
      expect(fm.badge, `${f} : badge est dérivé, plus écrit`).toBeUndefined();
    }
  });
  it("le hub est un démonstrateur, le studio est en usage, le BTP une démo", () => {
    const statut = (f: string) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statut: string }).statut;
    expect(statut("hub-sante.md")).toBe("demonstrateur");
    expect(statut("studio-moonkura.md")).toBe("usage");
    expect(statut("pack-btp.md")).toBe("demo");
  });
  it("la règle « client » tient sur BTP, hub et l'inventaire", () => {
    for (const f of ["pack-btp.md", "hub-sante.md"]) {
      expect(regleClient(readFileSync(join(DOSSIER, f), "utf8")), f).toEqual([]);
    }
  });
```
et ajouter `regleClient` à l'import. Le test « le hub ne parle jamais de client ni de signature » reste (INTERDITS_HUB garde `signé`, `signée` ; retirer `client` de INTERDITS_HUB puisque la règle générale le couvre).

- [ ] **Step 2: Voir l'échec** — `npm test` → rouge (exports absents, `badge` encore présent).

- [ ] **Step 3: `verifier-contenu.ts`** — ajouter :
```ts
export type Statut = "usage" | "demo" | "demonstrateur";
/** Les trois statuts affichés partout (spec v2 § 2). Définis ici, rendus par Badge.astro. */
export const STATUTS: Record<Statut, string> = {
  usage: "En usage quotidien",
  demo: "Pack de démonstration, en service",
  demonstrateur: "Démonstrateur, en construction",
};
/** Personas de démonstration : jamais nommées dans l'inventaire. */
export const PERSONAS: string[] = ["Marc", "Camille"];

/** Occurrences de « client(e) » qui ne sont ni « client de démonstration » ni précédées de « aucun » / « pas encore de ». */
export function regleClient(texte: string): string[] {
  const fautes: string[] = [];
  const re = /(\S+\s+)?\bclientes?\b(\s+\S+)?/gi;
  for (const m of texte.matchAll(re)) {
    const avant = (m[1] ?? "").toLowerCase(), apres = (m[2] ?? "").toLowerCase();
    const debut = texte.slice(Math.max(0, m.index! - 16), m.index!).toLowerCase();
    if (apres.startsWith(" de") && /\bde démonstration/i.test(texte.slice(m.index!, m.index! + 40))) continue;
    if (/\baucun\s*$/.test(avant) || /pas encore de\s*$/.test(debut + avant)) continue;
    fautes.push(m[0].trim());
  }
  return fautes;
}
```
et `INTERDITS` devient `["Revel", "Dauzats", "Virginie", "Teulat", "médecin traitant", "compagne", "Maison Aube"]`, `INTERDITS_HUB` devient `["signé", "signée"]`.

- [ ] **Step 4: Schéma** — dans `schema-realisation.ts` : `statut: z.enum(["usage", "demo", "demonstrateur"])`, supprimer `badge`, `statutLigne: z.string().min(20)` (obligatoire).

- [ ] **Step 5: `Badge.astro`**
```astro
---
import { STATUTS, type Statut } from "../lib/verifier-contenu";
interface Props { statut: Statut }
const { statut } = Astro.props;
---
<p class={`badge badge-${statut}`} data-badge data-statut={statut}>{STATUTS[statut]}</p>
<style>
  .badge{display:inline-block;margin:0;font-family:var(--mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;border:1px solid currentColor;border-radius:999px;padding:.3rem .7rem}
  .badge-usage{color:#1f7a4f}
  .badge-demo{color:var(--accent)}
  .badge-demonstrateur{color:var(--doux)}
</style>
```
(le vert `#1f7a4f` sur `--fond` fait 4,6:1 — ajouter l'assertion `contraste("#1f7a4f", JETONS.fond) ≥ 4.5` dans `tests/couleurs.test.ts`.)

- [ ] **Step 6: Gabarit et carte** — dans `[slug].astro` : `import Badge from "../../components/Badge.astro";`, remplacer `{d.badge && <p class="badge" data-badge>{d.badge}</p>}` par `<Badge statut={d.statut} />` et `{d.statutLigne && …}` par `<p class="statut-ligne" data-statut-ligne>{d.statutLigne}</p>` ; retirer la règle `.badge` du `<style>`. Dans `CarteRealisation.astro` : même remplacement (`<Badge statut={d.statut} />`), retirer `.badge` du style.

- [ ] **Step 7: Frontmatters** — `pack-btp.md` : `statut: demo`, ajouter `statutLigne: "Pack complet en service depuis juin 2026 sur un artisan de démonstration : le pipeline tourne pour de vrai, les données sont de démo — aucun client réel à ce jour."` ; `preuves[0]` devient « En service depuis juin 2026 sur un client de démonstration (accès sur demande). ». `hub-sante.md` : retirer `badge:` (statut et statutLigne existent). `studio-moonkura.md` : `statut: usage`, ajouter `statutLigne: "En usage quotidien par les trois membres du groupe, depuis un PC, une tablette et un téléphone."`.

- [ ] **Step 8: Vérifier** — `npm test` vert ; `npm run build && npx playwright test e2e/pages.spec.ts e2e/accueil.spec.ts` : adapter dans `pages.spec.ts` le test badge → « chaque page d'étude porte un badge » (`[data-badge]` count 1 sur les trois pages, texte = libellé attendu) ; dans `accueil.spec.ts`, la carte 1 (hub) porte « Démonstrateur, en construction » et la carte 0 « Pack de démonstration, en service ».

- [ ] **Step 9: Mutation** — dans `pack-btp.md`, écrire « le client reçoit » dans une puce → `npm test` rouge sur la règle client ; restaurer → vert.

- [ ] **Step 10: Commit** — `Statuts à trois valeurs : badge partagé, ligne de statut obligatoire, règle « client »`.

---

### Task 2: L'inventaire — données et page `/automatisations/`

**Files:**
- Create: `src/data/automatisations.ts`, `src/pages/automatisations.astro`
- Test: `tests/automatisations.test.ts`, `e2e/inventaire.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export type Metier = "btp" | "therapeutes" | "immo" | "sagesfemmes" | "hub" | "interne";
  export type Declencheur = "cron" | "webhook" | "telegram" | "formulaire" | "cockpit" | "sous-workflow";
  export type Automatisation = { id: string; nom: string; metier: Metier; declencheur: Declencheur; action: string; actif: boolean };
  export const METIERS: Record<Metier, { titre: string; statut: Statut; ordre: number }>;
  export const automatisations: Automatisation[];
  export function parMetier(): Record<Metier, Automatisation[]>;
  export function comptes(): { total: number; actifs: number; parMetier: Record<Metier, number> };
  ```

- [ ] **Step 1: Test qui échoue** — `tests/automatisations.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { automatisations, METIERS, comptes, parMetier } from "../src/data/automatisations";
import { INTERDITS, PERSONAS, motsInterdits, regleClient } from "../src/lib/verifier-contenu";

const ATTENDU = { total: 100, actifs: 93, parMetier: { btp: 29, therapeutes: 37, immo: 12, sagesfemmes: 6, hub: 5, interne: 11 } };

describe("l'inventaire des automatisations", () => {
  it("compte 100 workflows dont 93 actifs, répartis comme l'export du 19/09/2026", () => {
    expect(comptes()).toEqual(ATTENDU);
  });
  it("a des identifiants n8n uniques et bien formés", () => {
    const ids = automatisations.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9]{16}$/);
  });
  it("chaque ligne est complète, française, sans persona ni mot interdit, et respecte la règle client", () => {
    for (const a of automatisations) {
      expect(["btp", "therapeutes", "immo", "sagesfemmes", "hub", "interne"], a.id).toContain(a.metier);
      expect(["cron", "webhook", "telegram", "formulaire", "cockpit", "sous-workflow"], a.id).toContain(a.declencheur);
      expect(a.nom.length, a.id).toBeGreaterThanOrEqual(6);
      expect(a.nom, a.id).not.toMatch(/^Aelto|^Camille —|^Immo —|^À chaque étape —|^Hub santé —/);
      expect(a.action.length, a.id).toBeGreaterThanOrEqual(20);
      expect(a.action.length, a.id).toBeLessThanOrEqual(140);
      const texte = `${a.nom} ${a.action}`;
      expect(motsInterdits(texte, [...INTERDITS, ...PERSONAS]), a.id).toEqual([]);
      expect(regleClient(texte), a.id).toEqual([]);
    }
  });
  it("METIERS porte un titre, un statut et un ordre unique par métier", () => {
    const ordres = Object.values(METIERS).map((m) => m.ordre).sort();
    expect(ordres).toEqual([1, 2, 3, 4, 5, 6]);
    expect(METIERS.btp.statut).toBe("demo");
    expect(METIERS.sagesfemmes.statut).toBe("usage");
    expect(METIERS.interne.statut).toBe("usage");
    expect(METIERS.hub.statut).toBe("demonstrateur");
  });
  it("parMetier regroupe sans perdre une ligne", () => {
    const groupes = parMetier();
    expect(Object.values(groupes).reduce((n, g) => n + g.length, 0)).toBe(100);
  });
});
```

- [ ] **Step 2: Voir l'échec** — `npm test` → module absent.

- [ ] **Step 3: Relever la liste réelle** — avec l'outil `n8n_list_workflows` (limit 100), noter pour chaque workflow `id`, `name`, `active`. **Ne pas écrire l'export brut dans le dépôt** (il contient un prénom réel). Classer par préfixe du nom : `Aelto BTP —` → `btp` · `Camille —` / `Aelto Camille —` → `therapeutes` · `Immo —` et « Agent terrain immo » → `immo` · `À chaque étape —` → `sagesfemmes` · `Hub santé —` → `hub` · tout le reste (`Aelto —`, `Aelto Site —`, `Agent —`, `Aelto Prospection —`) → `interne`. Déclencheur d'après le nom et les nœuds : « (cron … ) », « quotidien », « hebdo », « mensuel », « J-1 », « matinal », « nocturne », « détection » → `cron` ; « bouton Telegram », « Telegram routeur », « validation … Telegram » → `telegram` ; « formulaire », « (form) », « demande entrante » → `formulaire` ; « depuis cockpit », « (cockpit) » → `cockpit` ; « sub-workflow », « relais … (worker) » → `sous-workflow` ; sinon `webhook`.

- [ ] **Step 4: `src/data/automatisations.ts`** — en-tête et six exemples à recopier, puis les 94 autres sur le même modèle :
```ts
import type { Statut } from "../lib/verifier-contenu";

export type Metier = "btp" | "therapeutes" | "immo" | "sagesfemmes" | "hub" | "interne";
export type Declencheur = "cron" | "webhook" | "telegram" | "formulaire" | "cockpit" | "sous-workflow";
export type Automatisation = { id: string; nom: string; metier: Metier; declencheur: Declencheur; action: string; actif: boolean };

/** Le statut d'une ligne dérive de son métier : on ne l'écrit jamais ligne par ligne. */
export const METIERS: Record<Metier, { titre: string; statut: Statut; ordre: number }> = {
  btp: { titre: "Bâtiment — le pack artisan", statut: "demo", ordre: 1 },
  therapeutes: { titre: "Thérapeutes — le pack cabinet", statut: "demo", ordre: 2 },
  immo: { titre: "Immobilier — l'agent terrain", statut: "demo", ordre: 3 },
  sagesfemmes: { titre: "Sages-femmes — le site et ses lettres", statut: "usage", ordre: 4 },
  hub: { titre: "Maison de santé — le hub", statut: "demonstrateur", ordre: 5 },
  interne: { titre: "Outillage interne", statut: "usage", ordre: 6 },
};

/** 100 workflows n8n, relevés par l'API le 19/09/2026 ; noms réécrits (sans préfixe, sans persona). */
export const automatisations: Automatisation[] = [
  { id: "VPE9l7koecmNMvms", nom: "Estimation IA d'une demande", metier: "btp", declencheur: "webhook", action: "Lit le catalogue, fait chiffrer une fourchette par le modèle, applique quatre garde-fous, répond au formulaire.", actif: true },
  { id: "TX0FD1OtHbpFX5u8", nom: "Réception du verdict et e-mail", metier: "btp", declencheur: "telegram", action: "Reçoit la décision de l'artisan, route les boutons Telegram, envoie l'e-mail nominatif au demandeur.", actif: true },
  { id: "7vphGP54wGCAEJM3", nom: "Routeur de validation Telegram", metier: "therapeutes", declencheur: "telegram", action: "Cinquante-six nœuds : chaque bouton de la praticienne déclenche la bonne branche et confirme in-app.", actif: true },
  { id: "OLNsxm5Z0utGm7NP", nom: "Réception et qualification d'un lead", metier: "immo", declencheur: "webhook", action: "Crée le contact, qualifie la demande, prévient l'agent sur Telegram.", actif: true },
  { id: "jmHjMNB2OyJVBu7q", nom: "Suivi post-partum hebdomadaire", metier: "sagesfemmes", declencheur: "cron", action: "Envoie chaque semaine la lettre adaptée à la date d'accouchement déclarée.", actif: true },
  { id: "CKygNi1uzQRwyjAf", nom: "Sentinelle d'erreurs", metier: "interne", declencheur: "sous-workflow", action: "Attrape toute erreur d'un workflow et l'envoie en alerte temps réel.", actif: true },
  // … 94 lignes de plus, même forme, une par workflow de l'export.
];

export function parMetier(): Record<Metier, Automatisation[]> {
  const g = { btp: [], therapeutes: [], immo: [], sagesfemmes: [], hub: [], interne: [] } as Record<Metier, Automatisation[]>;
  for (const a of automatisations) g[a.metier].push(a);
  return g;
}

export function comptes() {
  const g = parMetier();
  return {
    total: automatisations.length,
    actifs: automatisations.filter((a) => a.actif).length,
    parMetier: Object.fromEntries(Object.entries(g).map(([m, l]) => [m, l.length])) as Record<Metier, number>,
  };
}
```
Le workflow « Note d'appel (guide <prénom>) » s'appelle `Note d'appel de prospection (guide)`. Les sept inactifs portent `actif: false`.

- [ ] **Step 5: `src/pages/automatisations.astro`**
```astro
---
import Base from "../layouts/Base.astro";
import Badge from "../components/Badge.astro";
import { automatisations, METIERS, parMetier, comptes, type Metier } from "../data/automatisations";
import { identite } from "../data/identite";
const g = parMetier(), c = comptes();
const metiers = (Object.keys(METIERS) as Metier[]).sort((a, b) => METIERS[a].ordre - METIERS[b].ordre);
---
<Base title={`Ce qui tourne — ${identite.nom}`} description={`${c.total} workflows n8n construits, ${c.actifs} actifs, classés par métier avec leur statut réel.`}>
  <header class="colonne entete">
    <p><a href="/" class="mono retour">← {identite.nom}</a></p>
    <h1>Ce qui tourne</h1>
    <p class="chapo">{c.total} workflows n8n construits depuis mai 2026, {c.actifs} actifs. Les packs tournent sur des données de démonstration, l'outillage interne et le site sages-femmes sont en usage réel — le statut est indiqué sur chaque bloc.</p>
  </header>
  <main id="contenu" class="colonne" tabindex="-1">
    {metiers.map((m) => (
      <section class="section" id={m}>
        <div class="tete"><h2>{METIERS[m].titre} <span class="mono compte">{g[m].length}</span></h2><Badge statut={METIERS[m].statut} /></div>
        <ul class="lignes">
          {g[m].map((a) => (
            <li data-ligne>
              <span class="mono decl">{a.declencheur}</span>
              <span class="nom">{a.nom}{!a.actif && <span class="mono inactif"> — inactif</span>}</span>
              <span class="action">{a.action}</span>
            </li>
          ))}
        </ul>
      </section>
    ))}
    <p class="retour-liste"><a class="bouton creux" href="/#tourne">← Retour à l'accueil</a></p>
  </main>
  <footer class="pied colonne">{identite.nom} · {identite.ville}</footer>
</Base>
<style>
  .entete{padding-block:2rem 1rem}
  .retour{font-size:.8rem;text-decoration:none;color:var(--doux)}
  h1{font-family:var(--display);font-variation-settings:'wdth' 112;font-weight:800;font-size:clamp(1.9rem,4vw,3.2rem);letter-spacing:-.02em;margin:.8rem 0 1rem}
  .chapo{max-width:65ch;font-size:1.05rem;margin:0}
  .tete{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem}
  .tete h2{margin:0}
  .compte{font-size:1rem;color:var(--doux);font-weight:400;margin-left:.4em}
  .lignes{list-style:none;padding:0;margin:0;display:grid;gap:.55rem}
  .lignes li{display:grid;grid-template-columns:7.5rem minmax(12rem,20rem) 1fr;gap:.5rem 1rem;align-items:baseline;border-top:1px solid var(--trait);padding-top:.55rem}
  .decl{font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--doux)}
  .nom{font-weight:600}
  .inactif{font-weight:400;color:var(--doux);font-size:.8rem}
  .action{color:var(--doux);font-size:.95rem}
  @media (max-width:760px){ .lignes li{grid-template-columns:1fr} }
  .retour-liste{padding-block:2rem 0;margin:0}
</style>
```

- [ ] **Step 6: e2e** — `e2e/inventaire.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("/automatisations/ : six métiers, cent lignes, un badge par bloc", async ({ page }) => {
  const r = await page.goto("/automatisations/");
  expect(r?.status()).toBe(200);
  await expect(page.locator("main h2")).toHaveCount(6);
  await expect(page.locator("[data-ligne]")).toHaveCount(100);
  await expect(page.locator("main [data-badge]")).toHaveCount(6);
  await expect(page.locator("#btp [data-ligne]")).toHaveCount(29);
});

test("téléphone : l'inventaire ne défile pas horizontalement", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/automatisations/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
```
Ajouter `/automatisations/` à la liste du test sitemap dans `e2e/seo.spec.ts`.

- [ ] **Step 7: Vérifier** — `npm test` ; `npm run e2e`. **Mutation** : retirer une ligne du tableau → « compte 100 » rouge ; restaurer.

- [ ] **Step 8: Commit** — `Inventaire : 100 workflows typés, page /automatisations/ par métier avec statut`.

---

### Task 3: Accueil — chiffres vrais, cinq réalisations, tuiles par métier, atelier annoté

**Files:**
- Create: `src/components/Tuiles.astro`
- Modify: `src/data/chiffres.json`, `src/data/vignettes.ts`, `src/pages/index.astro`, `tests/chiffres.test.ts`, `e2e/accueil.spec.ts`

- [ ] **Step 1: Tests qui échouent** — dans `tests/chiffres.test.ts` ajouter :
```ts
import { comptes } from "../src/data/automatisations";
it("le chiffre des workflows dit exactement les comptes de l'inventaire", () => {
  const c = comptes();
  expect(chiffres[0].valeur).toBe(`${c.total} · ${c.actifs} actifs`);
  expect(chiffres[0].libelle).toBe("workflows n8n construits");
});
it("le chiffre des applications liste huit noms", () => {
  expect(chiffres[2].valeur).toBe("8");
  expect(chiffres[2].source.split("·").length).toBe(8);
});
```
Dans `e2e/accueil.spec.ts` : la carte count passe à **5** (toujours `pack-btp` en 0 ; les cartes 1-4 sont vérifiées après T5-T7 : à cette tâche, `toHaveCount(3)` reste et sera mis à 5 en T7) ; ajouter :
```ts
test("six tuiles par métier avec leurs comptes, et le lien vers l'inventaire", async ({ page }) => {
  await page.goto("/");
  const tuiles = page.locator("#tourne [data-tuile]");
  await expect(tuiles).toHaveCount(6);
  await expect(tuiles.nth(0)).toContainText("29");
  await expect(tuiles.nth(0).locator("a")).toHaveAttribute("href", "/automatisations/#btp");
  await expect(page.locator("#tourne a[href='/automatisations/']")).toHaveText(/Voir les 100/);
});
test("l'atelier est annoté « accès sur invitation »", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#aussi [data-vignette]").nth(0)).toContainText("accès sur invitation");
});
```

- [ ] **Step 2: Voir l'échec** — `npm test` rouge ; e2e rouge.

- [ ] **Step 3: `chiffres.json`** :
```json
[
  { "valeur": "100 · 93 actifs", "libelle": "workflows n8n construits", "source": "API n8n relevée le 19/09/2026 (n8n_list_workflows, 100 entrées, hasMore=false) ; comptes recalculés depuis src/data/automatisations.ts par tests/chiffres.test.ts" },
  { "valeur": "1 900+", "libelle": "tests automatisés", "source": "<inchangée>" },
  { "valeur": "8", "libelle": "applications en service", "source": "aelto.fr · demo.aelto.fr · studio.aelto.fr · atelier.aelto.fr · hub-sante-demo.pages.dev · hub-sante-cour.expertia059.workers.dev · a-chaque-etape.fr · jonathan-dubois.pages.dev — relevé le 19/09/2026" }
]
```
(recopier la source existante du 2ᵉ chiffre.)

- [ ] **Step 4: `vignettes.ts`** — titre de l'atelier : `"L'Atelier — images et vidéos générées en local (accès sur invitation)"`.

- [ ] **Step 5: `Tuiles.astro`**
```astro
---
import { METIERS, parMetier, comptes, type Metier } from "../data/automatisations";
const g = parMetier(), c = comptes();
const metiers = (Object.keys(METIERS) as Metier[]).sort((a, b) => METIERS[a].ordre - METIERS[b].ordre);
---
<section class="section" id="tourne">
  <h2>Ce qui tourne</h2>
  <p>{c.total} workflows n8n construits, {c.actifs} actifs — sur des données de démonstration pour les packs, en usage réel pour le reste.</p>
  <ul class="tuiles">
    {metiers.map((m) => (
      <li data-tuile>
        <a href={`/automatisations/#${m}`}>
          <strong>{g[m].length}</strong>
          <span>{METIERS[m].titre}</span>
        </a>
      </li>
    ))}
  </ul>
  <p class="voir"><a href="/automatisations/">Voir les {c.total} →</a></p>
</section>
<style>
  .tuiles{list-style:none;padding:0;margin:1.5rem 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.8rem}
  .tuiles a{display:grid;gap:.3rem;border:1px solid var(--trait-fort);border-radius:6px;padding:1rem 1.1rem;text-decoration:none;color:var(--encre);min-height:44px}
  .tuiles a:hover{border-color:var(--encre)}
  strong{font-family:var(--display);font-variation-settings:'wdth' 112;font-weight:800;font-size:1.9rem;line-height:1;font-variant-numeric:tabular-nums}
  span{font-size:.9rem;color:var(--doux)}
  .voir{margin:1.2rem 0 0}
</style>
```

- [ ] **Step 6: `index.astro`** — `<h2>Trois réalisations</h2>` → `<h2>Cinq réalisations</h2>` (le nombre est vrai après T7 ; d'ici là le titre annonce plus que la page ne montre : **acceptable sur la branche, pas en production** — T10 déploie après T7) ; importer `Tuiles` et l'insérer entre la section `#realisations` et `<Vignettes />`.

- [ ] **Step 7: Vérifier** — `npm test`, `npm run e2e` verts. **Mutation** : dans `chiffres.json`, `"100 · 93 actifs"` → `"100 · 92 actifs"` → test rouge ; restaurer.

- [ ] **Step 8: Commit** — `Accueil : 100 · 93 workflows, tuiles par métier, huit applications, atelier annoté`.

---

### Task 4: Pipeline d'images — script de préparation, schéma `images`, Galerie, vignette de carte

**Prérequis** : `captures-brutes/<slug>/*.png` déposées par le contrôleur (au moins deux par étude existante : hub, studio, BTP).

**Files:**
- Create: `scripts/preparer-captures.mjs`, `src/components/Galerie.astro`, `src/assets/realisations/` (sorties du script)
- Modify: `src/lib/schema-realisation.ts`, `src/pages/realisations/[slug].astro`, `src/components/CarteRealisation.astro`, `.gitignore` (+ `captures-brutes/`), `package.json` (script `captures`), les trois `.md` existants (bloc `images`)
- Test: `tests/images.test.ts`, `e2e/images.spec.ts`

**Interfaces:**
- Produces: schéma `images: z.array(z.object({ fichier: z.string().regex(/^[a-z0-9-]+\.(png|webp)$/), alt: z.string().min(10), legende: z.string().min(10) })).min(2)` ; `Galerie.astro` `Props { slug: string; images: Realisation["images"] }` ; `CarteRealisation` rend la première image en vignette 640 px ; `npm run captures` = `node scripts/preparer-captures.mjs`.

- [ ] **Step 1: Tests qui échouent** — `tests/images.test.ts` :
```ts
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const DOSSIER = join(process.cwd(), "src/content/realisations");
const ASSETS = join(process.cwd(), "src/assets/realisations");
const frontmatter = (t: string) => parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(t)![1]) as { images: { fichier: string; alt: string; legende: string }[] };

describe("les images des études", () => {
  for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, ""), fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8"));
    it(`${slug} : au moins deux images, chacune présente, ≤ 400 Ko, avec alt et légende`, () => {
      expect(fm.images.length).toBeGreaterThanOrEqual(2);
      for (const im of fm.images) {
        const p = join(ASSETS, slug, im.fichier);
        expect(existsSync(p), p).toBe(true);
        expect(statSync(p).size, p).toBeLessThanOrEqual(400_000);
        expect(im.alt.length).toBeGreaterThanOrEqual(10);
        expect(im.legende.length).toBeGreaterThanOrEqual(10);
      }
    });
    it(`${slug} : aucun fichier orphelin dans src/assets`, () => {
      const presents = existsSync(join(ASSETS, slug)) ? readdirSync(join(ASSETS, slug)) : [];
      expect(presents.sort()).toEqual(fm.images.map((i) => i.fichier).sort());
    });
  }
});
```
`e2e/images.spec.ts` :
```ts
import { test, expect } from "@playwright/test";

test("une page d'étude rend ses figures en WebP, lazy, avec alt et légende", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  const figs = page.locator("figure[data-figure]");
  expect(await figs.count()).toBeGreaterThanOrEqual(2);
  const img = figs.first().locator("img");
  await expect(img).toHaveAttribute("loading", "lazy");
  expect(await img.getAttribute("src")).toMatch(/\.webp/);
  expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(10);
  await expect(figs.first().locator("figcaption")).not.toBeEmpty();
});

test("les cartes de l'accueil portent une vignette", async ({ page }) => {
  await page.goto("/");
  const vignettes = page.locator("#realisations article[data-carte] img");
  expect(await vignettes.count()).toBe(await page.locator("#realisations article[data-carte]").count());
  await expect(vignettes.first()).toHaveAttribute("loading", "lazy");
});

test("page d'étude : première vue < 1,2 Mo", async ({ page }) => {
  await page.goto("/realisations/pack-btp/");
  await page.waitForLoadState("networkidle");
  const total = await page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return nav.transferSize + rs.reduce((s, r) => s + r.transferSize, 0);
  });
  expect(total).toBeLessThan(1_200_000);
});
```

- [ ] **Step 2: Voir l'échec** — `npm test` rouge (`images` absent des frontmatters).

- [ ] **Step 3: `scripts/preparer-captures.mjs`**
```js
// captures-brutes/<slug>/<nom>.png  →  src/assets/realisations/<slug>/<nom>.png (1 600 px, ≤ 400 Ko, sinon .webp)
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { join, parse } from "node:path";

const SRC = "captures-brutes", DST = "src/assets/realisations", LARGEUR = 1600, MAX = 400_000;
if (!existsSync(SRC)) { console.error(`${SRC}/ absent`); process.exit(2); }
let n = 0;
for (const slug of readdirSync(SRC).filter((d) => d !== "telegram" && statSync(join(SRC, d)).isDirectory())) {
  mkdirSync(join(DST, slug), { recursive: true });
  for (const f of readdirSync(join(SRC, slug)).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
    const nom = parse(f).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const base = sharp(join(SRC, slug, f)).resize({ width: LARGEUR, withoutEnlargement: true });
    const png = join(DST, slug, `${nom}.png`), webp = join(DST, slug, `${nom}.webp`);
    await base.clone().png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(png);
    if (statSync(png).size > MAX) { unlinkSync(png); await base.clone().webp({ quality: 82 }).toFile(webp); }
    n++;
  }
}
console.log(`${n} capture(s) préparée(s) dans ${DST}/`);
```
`package.json` : `"captures": "node scripts/preparer-captures.mjs"`. `.gitignore` : ajouter `captures-brutes/`. Les captures Telegram (dossier `telegram/`) sont copiées à la main dans le dossier de l'étude concernée par le contrôleur.

- [ ] **Step 4: Schéma** — ajouter `images` (interface ci-dessus) à `schemaRealisation`.

- [ ] **Step 5: `Galerie.astro`**
```astro
---
import { Image } from "astro:assets";
import type { Realisation } from "../lib/schema-realisation";
interface Props { slug: string; images: Realisation["images"] }
const { slug, images } = Astro.props;
const fichiers = import.meta.glob<{ default: ImageMetadata }>("/src/assets/realisations/*/*.{png,webp}", { eager: true });
const source = (f: string) => {
  const m = fichiers[`/src/assets/realisations/${slug}/${f}`];
  if (!m) throw new Error(`Image absente : ${slug}/${f}`);
  return m.default;
};
---
<div class="galerie">
  {images.map((im) => (
    <figure data-figure>
      <Image src={source(im.fichier)} alt={im.alt} widths={[640, 1280]} sizes="(max-width: 760px) 100vw, 1152px" format="webp" loading="lazy" decoding="async" />
      <figcaption class="mono">{im.legende}</figcaption>
    </figure>
  ))}
</div>
<style>
  .galerie{display:grid;gap:1.6rem;margin:1.6rem 0 0}
  figure{margin:0;border:1px solid var(--trait);border-radius:6px;overflow:hidden;background:#fff}
  img{display:block;width:100%;height:auto}
  figcaption{font-size:.78rem;color:var(--doux);padding:.7rem .9rem;border-top:1px solid var(--trait)}
</style>
```

- [ ] **Step 6: Gabarit et carte** — `[slug].astro` : importer `Galerie`, l'insérer dans « Ce que j'ai construit » **entre** les puces et `<Schema>` : `<Galerie slug={r.id} images={d.images} />`. `CarteRealisation.astro` : importer `Image` d'`astro:assets` et le même `import.meta.glob` ; rendre en tête de carte `<Image src={source(d.images[0].fichier)} alt={d.images[0].alt} width={640} format="webp" loading="lazy" decoding="async" class="vignette" />` avec `.vignette{width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;border-radius:4px}` — le glob est dupliqué entre les deux composants : l'extraire dans `src/lib/images.ts` (`export function imageDe(slug, fichier): ImageMetadata`) et l'importer des deux côtés.

- [ ] **Step 7: Frontmatters existants** — après `npm run captures`, ajouter à `hub-sante.md`, `studio-moonkura.md`, `pack-btp.md` un bloc `images:` (deux entrées minimum, `alt` descriptif, `legende` en une phrase ; les fichiers = ceux produits par le script).

- [ ] **Step 8: Vérifier** — `npm test`, `npm run build` (astro:assets génère les WebP), `npm run e2e` ; **regarder** `dist/realisations/pack-btp/index.html` dans le navigateur de test (une capture) : figures nettes, légendes lisibles. **Mutation** : retirer une entrée `images` du hub → « au moins deux images » rouge ; restaurer.

- [ ] **Step 9: Commit** — `Images : préparation sharp, galerie astro:assets, vignettes de cartes` (les PNG/WebP de `src/assets` sont committés).

---

### Task 5: Étude « Le pack BTP : 29 workflows autour d'un artisan » (réécriture)

**Files:** Modify `src/content/realisations/pack-btp.md` ; modify `tests/realisations.test.ts` (test du nombre dans le titre).

- [ ] **Step 1: Test** — ajouter à `tests/realisations.test.ts` :
```ts
import { comptes } from "../src/data/automatisations";
it("le nombre annoncé dans le titre du pack BTP est celui de l'inventaire", () => {
  const fm = frontmatter(readFileSync(join(DOSSIER, "pack-btp.md"), "utf8")) as { titre: string };
  expect(fm.titre).toContain(`${comptes().parMetier.btp} workflows`);
});
```
→ rouge (titre v1).

- [ ] **Step 2: Réécrire le frontmatter** (conserver `images` de T4, `liens: []`) :
```yaml
titre: "Le pack BTP : 29 workflows autour d'un artisan"
prouve: "Un système complet — de la demande à l'avis — avec un LLM encadré, un cockpit, des relances, et des incidents réels corrigés."
statut: demo
statutLigne: "Pack complet en service depuis juin 2026 sur un artisan de démonstration : le pipeline tourne pour de vrai, les données sont de démo — aucun client réel à ce jour."
ordre: 1
resume: "Vingt-neuf workflows qui se tiennent : estimation, visite, devis, chantier, facture, relances, avis. Un artisan de démonstration, un cockpit, un bot Telegram."
contexte: "Un plombier de démonstration reçoit des demandes imprécises. Le pack couvre tout son cycle sans qu'il touche un logiciel : il valide depuis Telegram, le reste part tout seul — estimation, créneaux de visite, devis, facture, relances, demande d'avis."
construit:
  - "Estimation IA d'une demande : catalogue de 53 prestations, modèle en sortie JSON, quatre garde-fous déterministes, repli explicite quand la nature des travaux n'est pas reconnaissable."
  - "Validation par l'artisan depuis Telegram : boutons à retour instantané, routeur de callbacks, e-mail nominatif au demandeur au nom de l'artisan."
  - "Visite : proposition de créneau, confirmation par le demandeur d'un clic, validation de l'artisan, annulation possible jusqu'au bout — chaque étape trace une activité."
  - "Devis pré-rempli depuis les briques de l'estimation, catalogue avec autocomplétion, remise, conditions, envoi et acceptation en ligne."
  - "Acceptation → chantier lancé d'un bouton Telegram ; chantier terminé depuis le cockpit ; facture acompte puis solde, bascule automatique en retard, relances."
  - "Avis Google demandé au bon moment, réception simulée pour la démo, relances dues chaque semaine sur Telegram."
  - "Un cockpit (Worker Cloudflare : lecture, écriture, calcul) alimenté chaque matin par un feeder, un briefing matinal Telegram, un agent terrain de 35 nœuds."
  - "Un prompt versionné et une batterie de dix cas rejouée après chaque modification — parce qu'un modèle varie d'une exécution à l'autre."
schema: ["Demande", "Estimation IA", "Visite", "Devis", "Chantier", "Facture", "Avis"]
preuves:
  - "En service depuis juin 2026 sur un client de démonstration (accès sur demande)."
  - "Les 29 workflows sont listés, avec leur déclencheur et leur rôle, dans l'inventaire."
  - "Incident A-007 détecté par un contrôle qualité hebdomadaire automatique, corrigé, vérifié contre le code déployé."
```
(`incident`, `stack` + `"Cloudflare Workers"`, `images`, `liens: []` conservés.) Dans le gabarit, pour les études dont le métier a un inventaire, ajouter un lien : `[slug].astro` reçoit un nouveau champ optionnel du schéma `metier: z.enum([...]).optional()` ; si présent, dans « Preuves » : `<p><a href={`/automatisations/#${d.metier}`}>Voir les workflows de ce pack →</a></p>`. Ajouter `metier: btp` ici.

- [ ] **Step 3: Vérifier** — `npm test` vert (règle client, titre) ; `npm run build && npx playwright test e2e/pages.spec.ts e2e/accueil.spec.ts`. **Mutation** : titre « 30 workflows » → rouge ; restaurer.

- [ ] **Step 4: Commit** — `Étude BTP : le pack entier, 29 workflows, lien vers l'inventaire`.

---

### Task 6: Étude « Le pack thérapeutes : 37 workflows et un cockpit pour un cabinet » (nouvelle)

**Files:** Create `src/content/realisations/pack-therapeutes.md` ; modify `tests/realisations.test.ts` (liste des fichiers, ordres 1..4, test du titre thérapeutes).

- [ ] **Step 1: Tests** — la liste attendue devient `["hub-sante.md", "pack-btp.md", "pack-therapeutes.md", "studio-moonkura.md"]`, ordres `[1,2,3,4]` **provisoirement** (hub 3, studio 4 — réordonnés en T7), et le même test de titre que T5 pour `therapeutes` (37). → rouge.

- [ ] **Step 2: Contenu**
```yaml
---
titre: "Le pack thérapeutes : 37 workflows et un cockpit pour un cabinet"
prouve: "La même rigueur sur un second métier, avec une logique de produit à deux paliers et un routeur Telegram de 56 nœuds."
statut: demo
statutLigne: "Pack complet en service depuis juin 2026 sur une praticienne de démonstration : tout tourne, sur des données de démo — aucun client réel à ce jour."
metier: therapeutes
ordre: 2
resume: "Tout ce qu'un cabinet gère à la main — demandes, rappels, absences, honoraires, avis, parrainage — automatisé autour d'un cockpit, pour une praticienne de démonstration."
contexte: "Une praticienne indépendante perd ses soirées en relances, rappels et notes d'honoraires. Le pack prend chaque geste répétitif : le patient confirme d'un clic, la praticienne valide depuis Telegram, le cockpit reflète tout. Deux paliers : l'outil seul, ou l'outil avec les automatisations."
construit:
  - "Demande entrante, confirmation de la candidate, inscription en liste d'attente, créneau libéré proposé au premier de la liste, créneau de dernière minute en express."
  - "Rappel J-1 avec report en self-service, préparation du patient, détection des silencieux, relance no-show avec proposition de créneau."
  - "Anamnèse : invitation depuis le cockpit, réception du formulaire, plan de soins envoyé ; note d'honoraires, demande et réception d'acompte."
  - "Impayés : détection quotidienne, relance douce depuis le cockpit, action de relance ; absence de la praticienne : détection, proposition, traitement par e-mail et report."
  - "Satisfaction : demande d'avis, réception, demande d'avis Google ; parrainage en deux temps (invitation du parrain, filleul inscrit) ; petit mot d'anniversaire."
  - "Un routeur de validation Telegram de 56 nœuds : chaque bouton de la praticienne déclenche la bonne branche et répond in-app."
  - "Briefing matinal, récap quotidien, débrief du soir, bilan mensuel ; un feeder CRM quotidien alimente le cockpit."
  - "Deux paliers décidés et testés : outil (69 €, cockpit en lecture et liens ciblés) ou cabinet complet (109 €, édition en place et toutes les automatisations)."
schema: ["Demande", "Confirmation", "Rappel J-1", "Séance", "Honoraires", "Avis"]
preuves:
  - "Les 37 workflows sont listés, avec leur déclencheur et leur rôle, dans l'inventaire."
  - "Cockpit sur données de démonstration ; routeur Telegram de 56 nœuds visible sur la capture."
  - "Migration Make → n8n de 24 workflows en une matinée le 10/06/2026, horodatages à l'appui."
incident:
  titre: "« Node hasn't been executed » dans le routeur Telegram"
  constat: "Un bouton sur trois faisait planter le routeur : n8n levait « Node 'X' hasn't been executed » sur la branche prise, alors que le nœud incriminé existait bien — dans une autre branche."
  cause: "Après un Switch, une seule branche s'exécute. Un nœud aval lisait `$('Nœud').first()` d'une branche non prise ; n8n lève avant même que JavaScript n'évalue, l'optional chaining ne protège de rien."
  correctif: "Un nœud « pack body » dans chaque branche ré-injecte dans `$json` les champs dont l'aval a besoin ; le Merge sort un item unifié, l'aval ne lit plus que `$json`. Règle retenue : en aval d'un Switch, ne lire que ce que toutes les branches produisent."
stack: ["n8n", "OpenAI", "Notion", "Telegram", "Cloudflare Workers", "Astro"]
liens: []
images:
  - { fichier: "canvas-routeur.png", alt: "Canvas n8n du routeur de validation Telegram : 56 nœuds répartis en branches depuis un Switch.", legende: "Le routeur de validation : un Switch, une branche par bouton, un « pack body » avant chaque Merge." }
  - { fichier: "cockpit-planning.png", alt: "Le cockpit du cabinet : planning de la semaine sur données de démonstration.", legende: "Le cockpit, alimenté chaque matin par le feeder CRM." }
---
```
(Ajouter la capture Telegram en troisième si elle existe.) La date « 10/06/2026 » et le nombre « 24 » viennent des horodatages `createdAt` de l'export (workflows « migré Make » créés le 10/06 entre 07:38 et 12:12) — **recompter** dans la liste relevée en T2 et corriger si différent.

- [ ] **Step 3: Vérifier** — `npm test` (schéma, règle client, interdits, titre) ; `npm run build && npx playwright test e2e/pages.spec.ts` (ajouter `pack-therapeutes` à la boucle des slugs). **Mutation** : écrire « Camille » dans `contexte` → rouge (PERSONAS ne s'applique pas aux études : c'est `INTERDITS` qui compte — donc muter plutôt avec « compagne ») ; restaurer.

- [ ] **Step 4: Commit** — `Étude thérapeutes : 37 workflows, deux paliers, l'incident du routeur`.

---

### Task 7: Étude « Un site de cabinet qui est une plateforme » (nouvelle) et ordre final

**Files:** Create `src/content/realisations/site-sages-femmes.md` ; modify `hub-sante.md` (`ordre: 4`), `studio-moonkura.md` (`ordre: 5`), `tests/realisations.test.ts` (cinq fichiers, ordres 1..5), `e2e/accueil.spec.ts` (5 cartes ; carte 2 = sages-femmes « En usage quotidien »), `e2e/pages.spec.ts` (5 slugs).

- [ ] **Step 1: Tests** → rouge.

- [ ] **Step 2: Relever les comptes** — `cd /c/Dev/site-sages-femmes/site && find src/pages -name '*.astro' | wc -l`, `ls src/pages/outils | grep -v index | wc -l`, `ls src/content/blog | wc -l`, `ls -d ../worker-* | wc -l`, et le nombre de pages générées `npm run build 2>&1 | grep -o '[0-9]* page(s)'` (ou `find dist -name index.html | wc -l` si le build est trop long). Valeurs relevées le 19/09 : 102 pages générées, 13 outils, 16 articles, 6 Workers — corriger le contenu si différent.

- [ ] **Step 3: Contenu**
```yaml
---
titre: "Un site de cabinet qui est une plateforme : une centaine de pages, 13 outils, une assistante IA"
prouve: "Un produit complet en usage quotidien par un cabinet, où chaque brique — outils hors-ligne, assistante, modération, PWA — est réelle et testée."
statut: usage
statutLigne: "En ligne et en usage quotidien par un cabinet de sages-femmes depuis juin 2026 ; construit comme la vitrine de ce que je sais faire pour un praticien."
ordre: 3
resume: "Les sites de cabinet sont des plaquettes. Celui-ci a treize outils qui marchent hors-ligne, une assistante qui répond depuis les données du site, des avis modérés, quatre lettres automatisées."
contexte: "Un cabinet de sages-femmes voulait plus qu'une plaquette : une ressource pour les patientes, entre deux consultations. Contrainte : aucune donnée de santé stockée, une déontologie stricte sur les avis, un site qui tienne sur un téléphone en 4G."
construit:
  - "Treize outils côté patiente, sans compte ni serveur : compteur de contractions hors-ligne, mouvements de bébé, calendrier de grossesse avec agenda .ics et rappels, questionnaire bien-être sans stockage, projet de naissance, checklists, fertilité, prise de poids…"
  - "Une assistante IA dont la base de connaissances est générée depuis les données du site — jamais une réponse écrite à la main — avec des garde-fous santé et un renvoi systématique vers la consultation."
  - "Vrai/Faux à 21 fiches sourcées, « quand consulter » par situation, « sage-femme, pour quoi faire » par âge de la vie, annuaire de sources officielles vérifiées, recherche interne."
  - "Boîte à idées d'articles et recueil d'avis avec modération avant publication (Workers Cloudflare + KV), parce qu'un avis de patiente ne se publie pas sans relecture."
  - "PWA installable qui marche hors-ligne, lecture audio des articles, confort de lecture (taille, contraste), données structurées et sitemap."
  - "Un blog en collections (16 articles) et quatre lettres automatisées par n8n : suivi de grossesse, post-partum, prévention, veille hebdomadaire."
  - "Six Workers Cloudflare autour du site : assistante, idées, avis, lettres, veille, relais e-mail."
schema: ["Données du site", "Base de connaissances", "Assistante", "Outils hors-ligne", "Avis modérés", "Lettres n8n"]
preuves:
  - "En ligne et en usage quotidien : le site public est lié ci-dessous."
  - "Une centaine de pages générées, 13 outils, 16 articles, 6 Workers, 5 workflows n8n — comptés dans le dépôt le 19/09/2026."
  - "Tests Playwright sur le site en ligne à chaque lot livré, sur ordinateur et téléphone."
incident:
  titre: "Le site servait une version de retard à chaque déploiement"
  constat: "Après un déploiement, la liste des consultations restait cassée en ligne, alors que le fichier corrigé était bien servi par l'hébergeur — et le lendemain, tout marchait."
  cause: "Le service worker de la PWA servait scripts et styles en stale-while-revalidate : il rendait la version en cache et ne téléchargeait la nouvelle qu'en arrière-plan. Chaque visite voyait le déploiement précédent."
  correctif: "Scripts et styles de même origine passés en network-first, version de cache incrémentée pour purger à l'activation. Et une règle : on vérifie un déploiement en contournant le service worker, jamais à travers lui."
stack: ["Astro", "Cloudflare Pages", "Cloudflare Workers", "KV", "OpenAI", "n8n", "PWA"]
liens:
  - { libelle: "Le site public", url: "https://a-chaque-etape.fr" }
images:
  - { fichier: "accueil.png", alt: "Page d'accueil du site du cabinet : photo plein cadre, titre, boutons de rendez-vous.", legende: "L'accueil — une ressource, pas une plaquette." }
  - { fichier: "contractions.png", alt: "Le compteur de contractions : chronomètre, historique, repère pour contacter la maternité.", legende: "Le compteur de contractions, utilisable hors-ligne, sans compte." }
  - { fichier: "assistante.png", alt: "L'assistante IA ouverte, répondant à une question sur les horaires depuis les données du site.", legende: "L'assistante répond depuis une base de connaissances générée — jamais écrite à la main." }
  - { fichier: "vrai-faux.png", alt: "Cartes Vrai/Faux retournables, avec la source de chaque réponse.", legende: "Vrai ou faux : 21 fiches, chacune sourcée." }
---
```
Aucun nom, aucune ville. « Une centaine de pages » plutôt qu'un nombre exact : les pages générées varient avec le blog.

- [ ] **Step 4: Ordre** — `hub-sante.md` → `ordre: 4`, `studio-moonkura.md` → `ordre: 5`. Tests : cinq fichiers, ordres `[1,2,3,4,5]`, accueil : 5 cartes, carte 2 « En usage quotidien » et titre contenant « plateforme », `h2` « Cinq réalisations ».

- [ ] **Step 5: Vérifier** — `npm test`, `npm run e2e` (la boucle des slugs de `pages.spec.ts` couvre les cinq). **Mutation** : `ordre: 3` sur le hub aussi → « sans doublon » rouge ; restaurer.

- [ ] **Step 6: Commit** — `Étude sages-femmes : la plateforme en usage quotidien ; cinq réalisations dans l'ordre`.

---

### Task 8: Images du hub et du studio, relecture des cinq galeries

**Files:** Modify `hub-sante.md`, `studio-moonkura.md` (bloc `images` complet à 3 et 2 entrées), `src/assets/realisations/{hub-sante,studio-moonkura}/`.

- [ ] **Step 1** — Vérifier que `npm run captures` a produit `hub-sante/{batiment,reunion,cockpit}` et `studio-moonkura/{editeur,pistes}` ; compléter les blocs `images` (alt descriptif, légende d'une phrase — pour le hub : « données de seed, aucun patient » dans une légende).
- [ ] **Step 2** — `npm test` (images.test) ; `npm run build` ; ouvrir les cinq pages d'étude dans le navigateur de test et **regarder** chaque galerie (une capture par page, dans le scratchpad) : netteté, cadrage, aucune donnée réelle visible. Si une capture montre une adresse e-mail, un téléphone ou un nom hors persona : la recadrer avec `sharp` (`extract`) dans le script ou l'écarter.
- [ ] **Step 3** — **Mutation** : renommer un fichier d'image du studio → « aucun fichier orphelin » rouge ; restaurer. Commit — `Images du hub et du studio ; cinq galeries relues`.

---

### Task 9: Tests de garde — liens externes stricts, poids, mobile, liens en onglet neuf

**Files:** Modify `tests/liens-externes.test.ts`, `e2e/poids.spec.ts`, `e2e/mobile.spec.ts`.

- [ ] **Step 1: Liens externes** — dans `statut()`, retourner `{ code, origineFinale: new URL(r.url).origin }` et asserter `origineFinale === new URL(url).origin` (« un mur de connexion est un échec ») ; le message d'erreur nomme l'origine finale. Avec `atelier.aelto.fr` annoté mais toujours lié, ce test **sera rouge** : la vignette garde son lien ? **Non** — spec v2 § 1 : « lien conservé, annoté ». Ruling à appliquer : le test exclut explicitement les URL listées dans `src/data/liens-sur-invitation.ts` (`["https://atelier.aelto.fr", "https://studio.aelto.fr"]`), et un test vérifie que chaque URL de cette liste est **annotée « accès sur invitation »** là où elle est publiée (titre de vignette ou libellé de lien). Mutation : retirer l'annotation de l'atelier → rouge.
- [ ] **Step 2: Poids** — dans `e2e/poids.spec.ts`, ajouter la même mesure pour `/automatisations/` (< 1 000 000) ; l'accueil garde son seuil (les vignettes sont lazy : vérifier que `total` n'a pas bougé de plus de 50 Ko, sinon rendre la première carte `loading="eager"` uniquement et re-mesurer).
- [ ] **Step 3: Mobile et liens** — dans `e2e/mobile.spec.ts`, la boucle 390 px couvre les cinq études et `/automatisations/` ; le test « liens externes en onglet neuf » tourne aussi sur `/realisations/site-sages-femmes/`.
- [ ] **Step 4** — `npm test`, `npm run e2e` verts. Commit — `Gardes : liens externes stricts sauf accès sur invitation, poids de l'inventaire, mobile sur cinq études`.

---

### Task 10: README, déploiement, vérification en ligne

- [ ] **Step 1: README** — sections : « Contenu » (+ inventaire `automatisations.ts`, règle des statuts, règle « client »), « Images » (captures brutes → `npm run captures`, règle de confidentialité), tests mis à jour (compter : `npm test` et `npm run e2e` affichent leurs totaux), « Reste à faire par Jonathan » (photo, domaine, LinkedIn, GitHub, « 53 », « T = 0,2 », pytest studio, Astro 7).
- [ ] **Step 2** — `npm test && npm run e2e` ; `npm run build && npm run og` (l'og ne change pas : hero inchangé — vérifier `git status`) ; déploiement `NODE_OPTIONS=--use-system-ca npx wrangler pages deploy dist --project-name=jonathan-dubois --branch=main --commit-dirty=true` ; curl des huit URL (les sept + `/automatisations/` + les deux nouvelles études) ; navigateur : `/` et `/realisations/site-sages-femmes/` — console vide, poids, vignettes chargées.
- [ ] **Step 3** — Commit `README v2 : inventaire, images, statuts` ; `git log --oneline | head -15`.

---

## Auto-revue du plan

**Couverture de la spec v2.** § 1 décisions → T3 (atelier), T5-T7 (cinq études, ordre), T4 (images). § 2 honnêteté → T1 (statuts, badge partout, `compagne`/`Maison Aube`, règle client), T2 (inventaire sans persona). § 3 accueil → T3 (chiffres 100·93 vérifiés, huit applications, « Cinq réalisations », tuiles calculées, vignettes en T4). § 4 inventaire → T2 (données, page, comptes du 19/09, export non committé, prospection anonymisée). § 5 études → T5 (BTP 29, lien inventaire, `metier`), T6 (thérapeutes 37, incident routeur), T7 (sages-femmes, incident SW, comptes revérifiés), T8 (hub, studio). § 6 images → T4 (script 1 600 px ≤ 400 Ko, `astro:assets` WebP lazy, alt+légende, vignette 640, budgets, `captures-brutes` ignoré, relecture), T8 (relecture des galeries). § 7 tests → T1-T4, T9 (liens stricts avec liste « sur invitation », poids inventaire, mobile). § 8-10 → T10.

**Écarts assumés.** Spec § 1 « atelier : lien conservé » et § 7 « un mur Access est un échec » se contredisent : résolu en T9 par une liste explicite d'URL « sur invitation », exclues du test d'origine mais dont l'annotation est testée. Spec § 5.3 « 51 pages, 8 outils » : chiffres périmés, remplacés par les comptes du 19/09 (102 pages générées, 13 outils, 16 articles, 6 Workers) — T7 les recompte.

**Placeholders.** Aucun ; les 94 lignes d'inventaire non écrites ici sont produites par T2 depuis l'API avec la règle de classement donnée, et le test épingle les comptes.

**Cohérence des noms.** `STATUTS`/`Statut`/`Badge` (T1) lus par T2, T4, T5-T8 ; `comptes()`/`parMetier()`/`METIERS` (T2) lus par T3, T5, T6 ; `images[]`/`Galerie`/`imageDe` (T4) lus par T5-T8 ; `metier` optionnel du schéma (T5) lu par le gabarit et T6 ; `data-tuile`, `data-ligne`, `data-figure`, `data-badge`, `data-statut` posés et testés sous les mêmes noms.
