# Portfolio de Jonathan Dubois

Site personnel statique — Astro 6, Cloudflare Pages. Spec v1 : `docs/superpowers/specs/2026-09-19-portfolio-design.md`. Spec v2 : `docs/superpowers/specs/2026-09-19-portfolio-v2-design.md`.

## Construire et tester

```bash
npm install
npx playwright install chromium   # une fois : le navigateur des tests
npm test          # vitest : contenu, chiffres sourcés, mots interdits, géométrie du hero, contrastes
npm run e2e       # build + Playwright (Chromium, port 4322) : pages, hero, accueil, SEO, mobile, poids
npm run dev       # http://127.0.0.1:4322/
```

Première vue de l'accueil mesurée le 20/09/2026, vignettes de carte recadrées (voir « Images ») : 245 116 octets (budget 350 000).

## Tests

Totaux relevés le 20/09/2026 (`npm test` puis `npm run e2e`) : **103 tests vitest** (10 fichiers) et **58 tests e2e Playwright**, tous verts.

## Déployer

Sur cette machine, wrangler a besoin de `NODE_OPTIONS=--use-system-ca`.

Au premier usage, wrangler demande une connexion au compte Cloudflare (`npx wrangler login`, dans un vrai terminal).

```bash
# une seule fois
NODE_OPTIONS=--use-system-ca npx wrangler pages project create jonathan-dubois --production-branch=main
# à chaque livraison
npm run build
NODE_OPTIONS=--use-system-ca npx wrangler pages deploy dist --project-name=jonathan-dubois --branch=main --commit-dirty=true
```

**`--branch=main` est obligatoire** : sans lui, Pages fait une prévisualisation à URL aléatoire, pas la production.

Après déploiement, vérifier en ligne (pas en local) : l'accueil, `/automatisations/`, les cinq études, `/sitemap-index.xml`, `/robots.txt` et `/og.png` en 200 sur les deux hôtes (`jonathan-dubois.pages.dev` et `jonathan-dubois.dev`), zéro erreur console.

## Contenu

- Cinq études de cas, dans l'ordre de l'accueil : pack BTP, pack thérapeutes, site sages-femmes, hub santé, Studio Moonkura — `src/content/realisations/*.md` (frontmatter validé par `src/lib/schema-realisation.ts`).
- Inventaire des automatisations : `src/data/automatisations.ts` — 100 workflows n8n relevés le 19/09/2026 (93 actifs), répartis par métier. Les comptes de l'accueil et de la page `/automatisations/` sont **recalculés depuis ce fichier**, jamais recopiés à la main : `comptes()` et `parMetier()` sont lus par `tests/chiffres.test.ts` et `tests/automatisations.test.ts`, qui échouent si les totaux divergent.
- Statuts affichés partout (badge sur chaque tuile, chaque étude, chaque ligne d'inventaire) : `usage` (en usage quotidien), `demo` (pack de démonstration, en service) ou `demonstrateur` (démonstrateur, en construction). Le libellé de chaque statut et le fait qu'un métier n'en porte qu'un seul sont définis une fois dans `src/lib/verifier-contenu.ts` (`STATUTS`), rendus par `Badge.astro`.
- Règle « client » : le mot ne peut s'écrire que comme « client de démonstration » ou dans une tournure « aucun client » / « pas encore de client » — jamais comme s'il désignait une personne réelle. Vérifiée automatiquement par `regleClient()` dans `src/lib/verifier-contenu.ts`, et par `motsInterdits()` pour les mots de tiers (`INTERDITS`). Fichiers scannés par `tests/realisations.test.ts` (plus `automatisations.ts` ligne par ligne dans `tests/automatisations.test.ts`) : les cinq études (`src/content/realisations/*.md`), `src/data/identite.ts`, `src/data/chiffres.json`, `src/data/vignettes.ts`, `src/data/stack.ts`, `src/data/automatisations.ts` et `src/scripts/flux-geometrie.ts` (d'où le renommage du nœud de hero « Réponse au client » → « Réponse au demandeur »).
- Chiffres de l'accueil : `src/data/chiffres.json` — chaque chiffre porte sa source.
- Identité et contact : `src/data/identite.ts`. Les liens LinkedIn/GitHub s'affichent dès qu'ils sont renseignés (fait le 20/09/2026).
- Mots interdits (aucun nom de tiers, aucun lieu) : `src/lib/verifier-contenu.ts` (`INTERDITS`, `INTERDITS_HUB`).

## Images

- Les captures d'écran brutes vivent dans `captures-brutes/<slug>/` — dossier **ignoré par git** (`.gitignore`), jamais commité.
- `npm run captures` (`scripts/preparer-captures.mjs`) les redimensionne à 1 600 px de large, tente un PNG ≤ 400 Ko puis, si le poids dépasse, bascule en WebP (qualité 82), et écrit le résultat dans `src/assets/realisations/<slug>/`. C'est ce dossier, versionné, que les études référencent via `astro:assets` (chargement paresseux, `<Image>` optimisée).
- Chaque image du frontmatter porte un `alt` et une `légende` d'au moins dix caractères ; `tests/images.test.ts` vérifie la présence du fichier, son poids (≤ 400 Ko) et l'absence de fichier orphelin dans `src/assets/realisations/`.
- Règle de confidentialité, valable pour toute capture : **aucun nom réel, aucune ville, aucune adresse e-mail ni numéro de téléphone** ne doit apparaître à l'écran. Seules des personæ de démonstration (« Marc », « Camille » — `PERSONAS` dans `src/lib/verifier-contenu.ts`) sont visibles dans les vignettes.

## Domaine

Le site est servi sur son domaine perso **`jonathan-dubois.dev`** (alias `www.jonathan-dubois.dev`), rattaché le 20/09/2026 au projet Cloudflare Pages `jonathan-dubois` (domaines personnalisés, DNS configuré automatiquement par Pages). `https://jonathan-dubois.pages.dev` reste joignable et sert le même contenu. `astro.config.mjs` (`site:`) et `e2e/seo.spec.ts` (`SITE`) pointent sur `jonathan-dubois.dev`. Le déploiement reste `--branch=main` (voir « Déployer » ci-dessus) : le domaine perso ne change rien à la commande.

## Hero « Le flux »

Canvas 2D sans librairie : `src/scripts/flux-geometrie.ts` (pur, testé) + `src/scripts/flux.ts` (rendu, boucle arrêtée hors écran, repli reduced-motion). Choisi à égalité parmi trois variantes : `docs/design/trois-moments.html`. Note de recherche : `C:\Dev\lab-effets\docs\recherche-portfolio-2026-09-19.md`.

## Polices

Archivo, IBM Plex Sans, IBM Plex Mono — SIL Open Font License 1.1, auto-hébergées dans `public/fonts/` par `npm run polices` (plage latin). Quatre fichiers : `archivo-400-900.woff2` (variable), `ibm-plex-sans-400-600.woff2` (variable, un seul fichier pour les deux graisses), `ibm-plex-mono-400.woff2`, `ibm-plex-mono-500.woff2`. Le script refuse tout doublon d'octets entre deux fichiers.

## Image Open Graph

`npm run og` après `npm run build` : capture du hero en 1200 × 630 → `public/og.png`. Le script lance son propre `astro preview` puis le termine (sur Windows, l'arbre de processus entier) une fois la capture faite.

## Sécurité des dépendances

`npm audit` (19/09/2026) signale 5 vulnérabilités — 1 critique, 1 haute, 2 modérées, 1 basse —
réparties sur quatre paquets :

| Paquet | Sévérité | Nature |
|---|---|---|
| `astro` ≤ 7.2.7 | critique | XSS (attributs spread, directives `transition:*`, View Transitions), exécution de code via l'optimisation d'images AVIF, contournement d'autorisation sur `base` |
| `sharp` ≤ 0.35.4-rc.0 | haute | vulnérabilités héritées de libvips et libheif |
| `@vitest/mocker` / `vitest` | modérée | traversée de chemin via le mock de redirection |
| `esbuild` 0.27.3 – 0.28.0 | basse | lecture de fichier arbitraire via le serveur de développement, sous Windows |

Aucune n'est atteignable ici : le site est **entièrement prérendu** (aucune route serveur, aucune
île hydratée — donc ni attribut spread ni directive `transition:*` au moment de l'exécution),
`base` n'est pas configuré, et `esbuild` comme `vitest` ne tournent qu'en développement — jamais
sur la machine qui sert les pages. Depuis v2, 21 images *sont* optimisées par Astro (`astro:assets`
+ `sharp`, composants `<Image>` dans `CarteRealisation.astro`, `Galerie.astro`, `Contact.astro`) :
la faille visée par la CVE sharp/AVIF suppose un flux d'entrée non maîtrisé (image téléversée par
un tiers, traitée à la volée) ; ici, toutes les sources sont des fichiers locaux versionnés dans
`src/assets/`, transformées une seule fois **au build**, sur cette machine — jamais à partir d'une
entrée externe ni sur la machine qui sert les pages. Le risque reste donc faible, mais pour une
raison différente de celle écrite jusqu'ici.

La montée vers Astro 7 est prévue **sur une branche dédiée**, avec rejeu des deux suites : c'est un
changement de version majeur (`npm audit fix --force` installerait `astro@7.3.3` et `vitest@5.0.1`)
qui n'a pas sa place dans une vague de correction.

## Reste à faire par Jonathan (spec § 10)

- Photo : faite (`src/assets/portrait.jpg`). LinkedIn et GitHub : faits, liens en place dans `src/data/identite.ts`.
- Domaine perso : `jonathan-dubois.dev` acheté et rattaché au projet Pages (20/09/2026). Email Routing : `contact@jonathan-dubois.dev` → boîte Gmail (Orange refuse les relais Cloudflare : « 550 5.1.0 Émetteur bloqué… Abusix/SpamHaus »), prouvé par un envoi réel le 20/09 ; `identite.email` basculée. Obfuscation d'e-mail Cloudflare désactivée sur la zone (le mailto reste un lien propre).
- Compte GitHub puis `git remote add origin … && git push -u origin main` (le dépôt n'a toujours aucun distant).
- Revérifier « 53 prestations » et « T = 0,2 » dans le prompt du workflow BTP `VPE9l7koecmNMvms`.
- Recompter le pytest du studio (1 256 cité dans `src/data/chiffres.json` vient du journal du dépôt, pas d'une exécution relancée le 19/09).
- Montée Astro 7 (voir « Sécurité des dépendances » ci-dessus) : sur une branche dédiée, avec rejeu de `npm test` et `npm run e2e`.
- Extrait audio Moonkura pour l'étude Studio Moonkura (ou assumer qu'il n'y en aura aucun).
