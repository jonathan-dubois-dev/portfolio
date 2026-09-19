# Portfolio de Jonathan Dubois

Site personnel statique — Astro 6, Cloudflare Pages. Spec : `docs/superpowers/specs/2026-09-19-portfolio-design.md`.

## Construire et tester

```bash
npm install
npx playwright install chromium   # une fois : le navigateur des tests
npm test          # vitest : contenu, chiffres sourcés, mots interdits, géométrie du hero, contrastes
npm run e2e       # build + Playwright (Chromium, port 4322) : pages, hero, accueil, SEO, mobile, poids
npm run dev       # http://127.0.0.1:4322/
```

Première vue de l'accueil mesurée le 19/09/2026 : 174 180 octets (budget 1 000 000).

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

Après déploiement, vérifier en ligne (pas en local) : les quatre pages en 200, zéro erreur console, `/og.png` servi.

## Contenu

- Études de cas : `src/content/realisations/*.md` (frontmatter validé par `src/lib/schema-realisation.ts`).
- Chiffres de l'accueil : `src/data/chiffres.json` — chaque chiffre porte sa source.
- Identité et contact : `src/data/identite.ts`. Les liens LinkedIn/GitHub s'affichent dès qu'ils sont renseignés.
- Mots interdits (aucun nom de tiers, aucun lieu) : `src/lib/verifier-contenu.ts`.

## Hero « Le flux »

Canvas 2D sans librairie : `src/scripts/flux-geometrie.ts` (pur, testé) + `src/scripts/flux.ts` (rendu, boucle arrêtée hors écran, repli reduced-motion). Choisi à égalité parmi trois variantes : `docs/design/trois-moments.html`. Note de recherche : `C:\Dev\lab-effets\docs\recherche-portfolio-2026-09-19.md`.

## Polices

Archivo, IBM Plex Sans, IBM Plex Mono — SIL Open Font License 1.1, auto-hébergées dans `public/fonts/` par `npm run polices` (plage latin). Quatre fichiers : `archivo-400-900.woff2` (variable), `ibm-plex-sans-400-600.woff2` (variable, un seul fichier pour les deux graisses), `ibm-plex-mono-400.woff2`, `ibm-plex-mono-500.woff2`. Le script refuse tout doublon d'octets entre deux fichiers.

## Image Open Graph

`npm run og` après `npm run build` : capture du hero en 1200 × 630 → `public/og.png`. Le script lance son propre `astro preview` puis le termine (sur Windows, l'arbre de processus entier) une fois la capture faite.

## Reste à faire par Jonathan (spec § 10)

photo · domaine perso + Email Routing · profil LinkedIn · compte GitHub puis `git remote add origin … && git push -u origin main` · relire les chiffres · extrait audio Moonkura (ou aucun)
