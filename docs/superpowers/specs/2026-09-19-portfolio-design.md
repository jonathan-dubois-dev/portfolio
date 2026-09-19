# Portfolio de Jonathan Dubois — spec de conception

Date : 2026-09-19. Issue d'un brainstorming du 19/09 (marque, projets, design,
hero, technique). Chaque décision porte sa date ; ce qui reste à trancher est
en § 11 avec sa valeur par défaut.

## 1. Objet, audience, job de la page

- **Site personnel de Jonathan Dubois** — pas Aelto. Aelto devient une ligne
  (« fondateur d'Aelto ») et aelto.fr reste le site des clients directs.
- **Cibles** : agences web et ESN (sous-traitance), recruteurs (poste salarié).
  Les deux embauchent une personne.
- **Job unique de la page** : qu'un inconnu comprenne en 30 secondes ce que
  Jonathan sait construire, et le contacte.
- **Langue** : français. Version anglaise hors périmètre v1.
- **Positionnement** (les deux titres côte à côte sont le différenciateur, on
  n'en choisit pas un) :
  > **Jonathan Dubois** — Ingénieur automatisation IA · Creative technologist
  > Je construis des systèmes IA qui tournent en production : agents,
  > workflows, applications, génératif.
  > Toulouse · Disponible en mission ou en poste

## 2. Décisions prises (toutes du 19/09/2026)

| Décision | Valeur |
|---|---|
| Marque | Site perso, nouveau dépôt, nouveau site |
| Projets | 3 études de cas : Pack BTP, Hub santé (démonstrateur), Studio Moonkura + 2 vignettes : L'Atelier, Troisième Étage |
| Design | Un moment signature, puis sobre |
| Hero | **A — « Le flux »**, choisi à égalité parmi trois (planche `docs/design/trois-moments.html`, artefact `UgQTFY1qSXbFU2uHD4T6uX`) |
| Technique | Astro statique (approche A, non contestée) |
| Contact affiché | Adresse sur domaine perso via Cloudflare Email Routing ; en attendant `duboisjonathan@orange.fr` |
| Localisation | « Toulouse » |
| Photo | Oui — à fournir par Jonathan |
| LinkedIn, GitHub | À créer par Jonathan ; le dépôt du portfolio sera publié en public sur GitHub |

## 3. Structure

### 3.1 Accueil — une page longue

1. **Hero** — le moment signature (§ 5) + le bloc de positionnement (§ 1).
   Deux appels : « Voir les réalisations » (ancre) · « Me contacter » (mailto).
2. **Trois chiffres** — bande courte. Ordres de grandeur à **vérifier avant
   publication** (un test refuse un chiffre non sourcé dans `chiffres.json`) :
   « une dizaine de workflows IA en production », « 1 500+ tests
   automatisés », « 7 applications déployées ».
3. **Trois études de cas** — cartes vers les pages, titres du § 6.
4. **Aussi** — deux vignettes courtes (§ 6.4).
5. **Comment je travaille** — quatre lignes : spec → plan → tests → revue →
   production ; tests de mutation ; « un test vert sans intégration ne prouve
   rien ». Ce qu'une agence veut lire : quelqu'un qui livre sans qu'on relise
   derrière.
6. **Stack** — n8n · Cloudflare Workers / Pages / D1 / R2 / Workers AI ·
   OpenAI & Anthropic · Notion · Astro · Three.js · Python · ComfyUI ·
   Demucs · Playwright / vitest. Liste textuelle, pas de logos.
7. **Contact** — adresse, LinkedIn, GitHub, disponibilité, Toulouse.

### 3.2 Gabarit d'étude de cas — trois pages

Dans cet ordre, sections nommées ainsi :

1. Titre + **une ligne « Ce que ça prouve »**
2. **Contexte** — le problème, trois lignes
3. **Ce que j'ai construit** — six à huit puces + un schéma simple (SVG
   inline, tokens du § 4)
4. **Preuves** — chiffres, captures, lien public s'il existe
5. **Un incident réel, et comment je l'ai réglé** — montrer qu'on mesure et
   qu'on dit non
6. **Stack**

Un badge de statut en tête quand il s'impose (« Démonstrateur, en
construction » pour le hub).

## 4. Identité visuelle

Celle de la planche, validée implicitement par le choix du hero (Jonathan a
été invité à signaler séparément si la typographie ou la couleur le gênaient).

### 4.1 Couleurs (thème clair uniquement en v1, fond peint explicitement)

| Jeton | Valeur | Rôle |
|---|---|---|
| `--fond` | `#f7f5f2` | os, ground |
| `--encre` | `#14161c` | texte, traits forts |
| `--doux` | `#5d6270` | texte secondaire |
| `--trait` | `#dcd7d0` | filets |
| `--trait-fort` | `#a39d94` | bordures d'objets |
| `--accent` | `#2447e0` | **le seul accent** : impulsion, liens, séparateur |

Quatre teintes de schéma, réservées aux diagrammes des études de cas (jamais
au texte ni aux boutons) : encre `#14161c`, cobalt `#2447e0`, rose `#c8506e`,
teal `#1f8a7a`.

**L'accent est rare** : mesuré sur la capture de l'accueil, il occupe moins de
5 % de la surface (voir `feedback_mesurer-l-image-pas-la-charte`).

### 4.2 Typographie

| Rôle | Police | Réglage |
|---|---|---|
| Display (nom, titres) | Archivo, variable | `wdth` 100–125, graisse 600–900, `letter-spacing` négatif, `text-wrap: balance` |
| Texte | IBM Plex Sans | 400 / 500 / 600, 16 px, ~65 caractères par ligne |
| Libellés, chiffres, nœuds | IBM Plex Mono | 400 / 500, `tabular-nums` |

Chargées depuis Google Fonts en v1 (`display=swap`, piles de repli déclarées).
**Auto-hébergement** = tâche du plan (les polices sont le dernier tiers de la
page ; le hub a eu la même question).

### 4.3 Mise en page

Une colonne de lecture (max ~72 rem), gouttière latérale ≥ 16 px à toute
largeur, `gap` plutôt que marges, rien de plus large que l'écran. Cartes
uniquement pour les trois études de cas ; le reste est typographique. Pas de
numérotation décorative.

## 5. Le hero « Le flux »

**Ressenti** : on voit un système qui tourne — les briques réelles de
l'estimateur BTP apparaissent une à une, les liens se tirent, puis une
impulsion y circule sans fin.

**Source** : variante A de `docs/design/trois-moments.html` (canvas 2D,
0 ko de librairie), à reprendre en composant Astro `Flux.astro` + script
`flux.js`. Note de recherche :
`C:\Dev\lab-effets\docs\recherche-portfolio-2026-09-19.md`.

**Contenu du graphe** — libellés réels du workflow n8n `VPE9l7koecmNMvms`
(à revérifier contre le workflow au moment de publier, notamment « 53 ») :

```
Webhook /btp-estimation
  → Catalogue Notion · 53 prestations
  → Compactage
  → LLM · T = 0,2
  → Garde-fous G1–G4
  → Notion · Telegram        (trajet 1)
  → Réponse au client        (trajet 2)
```

**Comportement** : apparition séquentielle des nœuds (190 ms d'écart, ~1,3 s
au total), arêtes tracées progressivement, puis une impulsion cobalt qui
alterne les deux trajets, période 3,4 s, sans fin. Boucle `requestAnimationFrame`
**arrêtée hors écran** (IntersectionObserver). `devicePixelRatio` plafonné à 2.

**Mise en page** : bureau — texte à gauche (≤ 36 rem), graphe dans les 53 %
de droite ; téléphone (< 760 px) — graphe **sous** le texte, hauteur 52 vh.

**Repli, décidé avec l'effet** :
- `prefers-reduced-motion: reduce` → graphe fini, immobile, sans impulsion ;
- canvas indisponible ou JS absent → **le texte seul**, intact : le bloc de
  positionnement est du HTML, le canvas est `aria-hidden`.

**Ce que ça fait subir, assumé** : le motif « graphe de workflow animé » existe
en bloc de template ; ce qui l'en distingue ici, ce sont les libellés réels et
la typographie. Ces deux choses ne se négocient pas.

## 6. Contenu des études de cas

Règle générale : **aucune donnée client, aucun nom de tiers**. Les captures
montrent des données de démonstration ou de seed. Chaque chiffre publié est
recopié depuis une source nommée (dépôt, workflow, journal de tests), jamais
depuis un souvenir.

### 6.1 Pack BTP

- **Titre** : Agent d'estimation de devis pour artisans — LLM + garde-fous
  déterministes
- **Ce que ça prouve** : un LLM en production, encadré, testé, corrigé sur
  incident réel.
- **Contexte** : un artisan reçoit une demande floue ; il faut une fourchette
  crédible en quelques minutes, ou un refus honnête — jamais un prix inventé.
- **Construit** : webhook → catalogue Notion (53 prestations) → compactage →
  LLM (JSON, température 0,2) → garde-fous G1–G4 (plancher, plafond,
  cohérence, repli) → fiche Notion + alerte Telegram pour l'artisan → e-mail
  au client (workflows B/B'). Prompt versionné (v1.6). Batterie de tests
  (5 cas nets + 5 replis) rejouée après chaque modification.
- **Preuves** : actif depuis juin 2026 ; démo publique `demo.aelto.fr/btp` ;
  batterie `scripts/btp_estimation_tests.py`.
- **Incident** : A-007 (04/08/2026) — une même demande donnait 130–391 €,
  110–181 €, puis un refus ; 181 € pour un réseau de plomberie complet.
  Cause : le modèle mobilisait des briques en quantité unitaire et le
  garde-fou G4 écrasait la borne haute sur cette somme. Correctif
  `RATIO_UNITAIRE = 2` → repli explicite au lieu d'un prix faux. Vérifié
  contre le code réellement déployé, 4/4.
- **Stack** : n8n, OpenAI, Notion, Telegram, Cloudflare Pages, Python.

### 6.2 Hub santé — démonstrateur, en construction

- **Titre** : Plateforme de coordination pour maison de santé —
  compte-rendu de réunion automatique
- **Badge** : Démonstrateur, en construction.
- **Ce que ça prouve** : une application IA complète — de l'authentification
  aux automatisations — sous une contrainte réglementaire forte.
- **Contexte** : une quarantaine de praticiens à coordonner, **sans aucune
  donnée patient** (sinon hébergeur HDS obligatoire).
- **Construit** : site public (Astro, Pages) + hub privé (Astro serveur sur
  Workers, D1, sessions maison, PBKDF2, invitations) ; réunions avec
  compte-rendu automatique (Workers AI : whisper-large-v3-turbo +
  llama-3.3-70b ; audio jamais persisté, transcription effacée à la
  validation) ; documents versionnés ; forum modéré ; messagerie ; cinq
  automatisations n8n (relais mail, entretien, sauvegarde R2, digest,
  rappels) ; assistant public à débit limité ; charte « plaques émaillées ».
- **Preuves** (à recopier depuis le dépôt `C:\Dev\hub-sante` au moment de
  publier) : ordre de grandeur 174 vitest + 55 Playwright côté hub, 61 + 70
  côté vitrine ; Workers AI vérifié en réel (13 s de transcription).
- **Incident** : PBKDF2 à 210 000 itérations > plafond Workers de 100 000 →
  500 en production, invisible en local. Leçon : tester la connexion réelle
  après chaque déploiement.
- **Une ligne de statut, honnête** : construit pour un projet réel de maison
  de santé ; non signé — recouvrement avec les outils déjà en place chez les
  praticiens.
- **Confidentialité** : aucun nom de porteur, aucun praticien réel, aucune
  adresse ; captures sur données de seed uniquement (un test refuse une liste
  de noms interdits dans le contenu).
- **Stack** : Astro, Cloudflare Workers / Pages / D1 / R2 / Workers AI, n8n,
  vitest, Playwright.

### 6.3 Studio Moonkura

- **Titre** : Station audio collaborative en ligne — séparation de pistes par
  IA, tempo variable
- **Ce que ça prouve** : creative technologist **et** rigueur — audio temps
  réel, GPU, tests de mutation.
- **Contexte** : un groupe de trois qui compose à distance ; les outils grand
  public ne réunissent pas séparation de pistes, tempo variable et espaces
  cloisonnés.
- **Construit** : éditeur multipiste dans le navigateur (Web Audio, canvas) ;
  serveur Python ; séparation Demucs sur GPU local via un worker derrière
  Cloudflare Access ; étiquetage automatique de la tonalité ; carte de tempo
  (time-stretch, hauteur préservée) ; lecture par tranches (169 Mo → 23 Mo
  téléchargés) ; espaces cloisonnés et partage.
- **Preuves** (à recopier depuis `C:\Dev\moteur-separation` et le dépôt du
  studio) : ordre de grandeur 1 256 tests Python + 3 270 sous-tests, ~98 e2e,
  97 tests du moteur ; en ligne sur `studio.aelto.fr` ; utilisé par trois
  personnes.
- **Incident / décision** : le détecteur de tempo mesuré à 40,4 % de justes
  sur 250 boucles réelles → **livré volontairement muet** ; le pré-remplissage
  automatique du nombre de mesures à 6,4 % de justes → abandonné. Mesurer, et
  dire non.
- **Confidentialité** : pas de prénoms des membres ; extrait audio à choisir
  par Jonathan (§ 10).
- **Stack** : Python, Web Audio API, canvas, Demucs / PyTorch, ffmpeg,
  Cloudflare Access, pytest, Playwright.

### 6.4 Vignettes

- **L'Atelier** — génération d'images et de vidéos en local (ComfyUI sur une
  RTX 3060, exposé sur `atelier.aelto.fr`), mesures documentées (démarrage
  froid / chaud, pièges de la vidéo locale).
- **Troisième Étage** — site du groupe : ascenseur en Three.js, cabine
  octogonale, repli CSS 3D sans WebGL, première vue 1,54 Mo, 93 tests
  unitaires + 116 e2e.

## 7. Technique

- **Astro statique**, dépôt `C:\Dev\portfolio` (hors OneDrive : `node_modules`),
  pattern repris de `C:\Dev\hub-sante\rue` (structure, tests, script de
  déploiement, images).
- **Contenu** : collection `src/content/realisations/*.md` avec schéma
  (titre, prouve, statut, contexte, construit[], preuves[], incident, stack[],
  liens[], ordre) ; un gabarit `Realisation.astro` les met en page. Les
  chiffres de l'accueil dans `src/data/chiffres.json` avec, pour chacun, sa
  source.
- **Images** : captures en WebP via `astro:assets`, dimensions déclarées,
  `loading="lazy"` sous la ligne de flottaison.
- **Budget** : première vue **< 1 Mo**, hero compris (le hero pèse le
  document + `flux.js`, pas d'image). Polices : ≤ 4 fichiers.
- **Tests** :
  - vitest — schéma de contenu respecté ; **liste de mots interdits** (noms
    des porteurs du hub, « client » à propos du hub, données de tiers) ;
    chaque chiffre de `chiffres.json` a une source ; aucun lien interne mort ;
  - Playwright — chaque page en 200 ; zéro erreur console ; poids de la
    première vue sous budget ; repli `prefers-reduced-motion` réel (graphe
    immobile, aucune image dessinée après 2 s) ; largeur 390 px sans
    défilement horizontal ; hero lisible sans JavaScript.
  - Une mutation par test : chaque test doit rougir quand on retire ce qu'il
    protège (`feedback_un-test-vert-sans-integration-ne-prouve-rien`).
- **Déploiement** : Cloudflare Pages, projet `jonathan-dubois` (§ 11),
  `--branch main` (sinon prévisualisation), `404.html` présent,
  `NODE_OPTIONS=--use-system-ca` sur cette machine. URL `.pages.dev` d'abord,
  domaine ensuite.
- **Accessibilité** : contrastes AA sur `--fond`, cibles ≥ 44 px, focus
  visible, `prefers-reduced-motion` respecté, hero en HTML.
- **SEO minimal** : `title` et `description` par page, image Open Graph
  (capture du hero à l'état final), `sitemap`, `robots` ouvert.
- **Pas de GSAP ni de Lenis** : la page est sobre. Les révélations de
  sections, si elles s'imposent, viennent du CSS natif (lab
  `#revelation-masque-scroll`, 0 ko).

## 8. Hors périmètre v1

Mode sombre · version anglaise · blog · formulaire de contact (un `mailto`
suffit) · statistiques de visite · page « à propos » séparée (le hero et
« comment je travaille » la remplacent).

## 9. Definition of done

- Les trois études de cas et les deux vignettes publiées, chiffres sourcés.
- Tests verts avec la mutation faite au moins une fois par test.
- Première vue mesurée < 1 Mo dans le navigateur, pas estimée.
- Repli reduced-motion et largeur 390 px vérifiés pour de vrai.
- En ligne sur `.pages.dev`, chaque page en 200, zéro erreur console.
- Dépôt public sur GitHub, README qui explique comment construire et
  déployer.

## 10. Actions de Jonathan (ne bloquent pas la construction)

1. Une photo (portrait net, fond calme).
2. Domaine perso chez Cloudflare Registrar + Email Routing vers sa boîte.
3. Créer le profil LinkedIn (texte fourni depuis le portfolio).
4. Créer le compte GitHub (le dépôt y sera poussé).
5. Choisir un extrait audio pour l'étude Moonkura (ou aucun).
6. Relire les chiffres avant publication.

## 11. Décisions restantes, avec leur valeur par défaut

| Question | Défaut retenu tant que Jonathan ne dit rien |
|---|---|
| Nom du projet Pages | `jonathan-dubois` |
| Domaine | aucun en v1 ; `.pages.dev` |
| Auto-hébergement des polices | tâche du plan, faite si le budget le permet |
| Image Open Graph | capture du hero à l'état final, 1200 × 630 |
