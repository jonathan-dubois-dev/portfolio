# Portfolio v2 — « montrer, pas raconter » — spec de conception

Date : 2026-09-19 (soir). Amende la spec v1 (`2026-09-19-portfolio-design.md`),
qui reste l'autorité pour tout ce qui n'est pas repris ici (identité visuelle,
hero, technique, tests existants). Motif : Jonathan juge le site v1 « maigre »
— trois études, une seule automatisation montrée, aucune image — alors que
**100 workflows n8n** existent (93 actifs, export API du 19/09/2026).

## 1. Décisions (19/09/2026, Jonathan)

| Décision | Valeur |
|---|---|
| Approche | **B** — un inventaire séparé `/automatisations/`, l'accueil garde le chiffre et six tuiles par métier |
| Études de cas | **cinq** : pack BTP (réécrite), pack thérapeutes (nouvelle), site sages-femmes (nouvelle), hub santé, studio ; ordre par défaut : BTP, thérapeutes, sages-femmes, hub, studio |
| Images | oui, partout ; captures faites par l'assistant depuis le Chrome connecté de Jonathan (n8n, demo.aelto.fr, studio, hub, a-chaque-etape.fr) ; Telegram par Jonathan (téléphone) |
| Sages-femmes | montré comme étude de cas complète (« en usage quotidien »), sans nom ni ville, lien public |
| Atelier | vignette annotée « accès sur invitation », lien conservé |
| Honnêteté | **aucun client réel à ce jour** : chaque élément porte son statut vrai ; le mot « client » ne désigne jamais un client de Jonathan |

## 2. La ligne d'honnêteté

Statuts, en badge sur chaque carte, chaque page d'étude, chaque ligne de
l'inventaire — jamais omis :

| Code | Libellé affiché | S'applique à |
|---|---|---|
| `usage` | En usage quotidien | site sages-femmes, studio, outillage interne d'Aelto |
| `demo` | Pack de démonstration, en service | packs BTP, thérapeutes, immo |
| `demonstrateur` | Démonstrateur, en construction | hub santé |

Le schéma `statut` de la collection passe à `z.enum(["usage", "demo", "demonstrateur"])`
(l'ancien `production` disparaît). Le badge est rendu **pour tous**, pas
seulement le hub. Une phrase de statut (`statutLigne`) devient obligatoire.

Mots interdits : liste v1 + **`compagne`** + **`Maison Aube`** (nom provisoire du
site sages-femmes). Dans les fichiers BTP, thérapeutes, immo et hub : `client`
ne peut apparaître que dans « client de démonstration » ou « aucun client » —
testé par une règle : toute occurrence de `client` doit être suivie de
« de démonstration » ou précédée de « aucun » / « pas encore de ».

## 3. Accueil v2

Ordre des sections (l'ancien `#realisations` change de titre) :

1. Hero — inchangé.
2. Chiffres — **« 100 workflows n8n construits · 93 actifs »** (source : API
   n8n relevée le 19/09/2026 ; un test vérifie que `automatisations.ts` compte
   exactement 100 entrées et 93 actives), « 1 900+ tests
   automatisés » (inchangé), **« 8 applications en service »** (source : liste
   nominative dans `chiffres.json` : aelto.fr, demo.aelto.fr, studio.aelto.fr,
   atelier.aelto.fr, hub vitrine, hub privé, a-chaque-etape.fr,
   jonathan-dubois.pages.dev).
3. **« Cinq réalisations »** — cartes avec une **vignette image** (première
   image de l'étude, WebP 640 px, `loading="lazy"`), badge de statut, titre,
   résumé, « ce que ça prouve ».
4. **« Ce qui tourne »** — six tuiles : BTP · Thérapeutes · Immobilier ·
   Sages-femmes · Hub santé · Outillage interne, chacune avec son nombre de
   workflows (calculé depuis `automatisations.ts`, jamais écrit en dur) et un
   lien `/automatisations/#<metier>` ; sous la grille, un lien « Voir les 100 ».
5. Aussi — Atelier (**« L'Atelier — images et vidéos générées en local (accès
   sur invitation) »**), Troisième Étage.
6. Méthode, stack, contact — inchangés.

## 4. Page `/automatisations/`

- Titre « Ce qui tourne » ; une phrase : « 100 workflows n8n construits depuis
  mai 2026, 93 actifs. Les packs tournent sur des données de démonstration,
  l'outillage interne et le site sages-femmes sont en usage réel — le statut
  est indiqué sur chaque ligne. »
- Six blocs `h2` (métiers, dans l'ordre de l'accueil), chacun avec son compte
  et sa liste. Une ligne = `nom` (court, sans préfixe « Aelto BTP — »),
  `declencheur` en pastille mono (`cron` · `webhook` · `telegram` ·
  `formulaire` · `cockpit` · `sous-workflow`), `action` (une phrase, ce que ça
  fait pour qui), `statut` (badge), et `actif: false` affiché « — inactif »
  (sept cas : standard téléphonique ×3, digest IA, agent sub Notion, outil
  e-mail, veille).
- Données : `src/data/automatisations.ts` exporte `automatisations: Automatisation[]`
  avec `{ id, nom, metier, declencheur, action, statut, actif }` — **`id` = l'id
  n8n** (16 caractères alphanumériques) relevé par l'API. `metier ∈ {btp,
  therapeutes, immo, sagesfemmes, hub, interne}`.
- **L'export brut de l'API n'est pas committé** (provenance sensible : il
  contient des noms de workflows avec des prénoms réels). L'implémenteur
  construit la liste depuis `n8n_list_workflows` pendant sa tâche, réécrit
  chaque nom, et le test épingle les comptes relevés le 19/09/2026 : **100
  entrées, 93 actives**, identifiants uniques et au bon format. Une
  revérification ultérieure se fait à la main contre l'API.
- Aucun nom de persona ni de personne dans les lignes (« Marc », « Camille »
  → « l'artisan », « la praticienne » ; le workflow de prospection « guide
  <prénom> » devient « Note d'appel de prospection (guide) »). Aucune donnée ni
  identifiant tiers.

## 5. Les cinq études de cas

Gabarit v1 conservé (six sections), avec deux ajouts : **`images`**
(frontmatter, ≥ 2 par étude) rendues dans « Ce que j'ai construit » (après les
puces, avant le schéma) et dans « Preuves » ; et un lien « Voir les N workflows
de ce pack → `/automatisations/#<metier>` » pour BTP, thérapeutes.

### 5.1 Pack BTP — `pack-btp` (réécrite, `statut: demo`, ordre 1)
- Titre : « Le pack BTP : 30 workflows autour d'un artisan »
- Prouve : un système complet en production — de la demande à l'avis client —
  avec un LLM encadré, un cockpit, et des incidents réels corrigés.
- Contexte : un artisan de démonstration (plombier) ; le pack couvre tout son
  cycle : demande, estimation, visite, devis, chantier, facture, relances, avis.
- Construit (8 puces) : estimation IA + garde-fous ; validation Telegram par
  l'artisan (boutons, callbacks) ; visite — proposition de créneau, confirmation
  par le client, validation, annulation ; devis pré-rempli depuis les briques
  de l'estimation, catalogue, remise ; acceptation → chantier ; facture
  acompte / solde, bascule en retard, relances ; avis Google ; cockpit avec
  feeder quotidien, briefing matinal Telegram, agent terrain.
- Schéma : Demande → Estimation → Visite → Devis → Chantier → Facture → Avis.
- Preuves : 30 workflows listés (lien) ; cockpit sur données de démo ;
  batterie de tests du prompt ; A-007.
- Incident : A-007 (v1, inchangé).
- Images : canvas n8n de B' (26 nœuds, routeur de callbacks) ou de l'agent
  terrain (35) ; cockpit — page Demandes ; conversation Telegram (bouton
  « Confirmer la visite »).
- Stack v1 + « Cloudflare Workers (cockpit) ».

### 5.2 Pack thérapeutes — `pack-therapeutes` (nouvelle, `statut: demo`, ordre 2)
- Titre : « Le pack thérapeutes : 35 workflows et un cockpit pour un cabinet »
- Prouve : la même rigueur appliquée à un second métier, avec une logique de
  produit (deux paliers) et un routeur Telegram de 56 nœuds.
- Contexte : une praticienne de démonstration ; tout ce qu'un cabinet gère à
  la main : demandes, rappels, absences, honoraires, avis, parrainage.
- Construit : demande entrante et confirmation ; rappel J-1 et report en
  self-service ; créneau libéré, liste d'attente, dernière minute ; anamnèse
  (invitation, réception), plan de soins ; note d'honoraires, acompte, impayés
  (détection, action, relance douce) ; no-show ; absence praticienne
  (détection + proposition + traitement) ; satisfaction et avis Google ;
  parrainage ; briefing matinal, récap quotidien, bilan mensuel ; cockpit avec
  feeder CRM ; deux paliers : outil (69 €) / automatisations (109 €).
- Schéma : Demande → Confirmation → Rappel J-1 → Séance → Honoraires → Avis.
- Preuves : 35 workflows (lien) ; cockpit ; routeur Telegram 56 nœuds.
- **Incident** : dans le routeur Telegram, un nœud aval lisait
  `$('Nœud').first()` d'une branche que le Switch n'avait pas exécutée → n8n
  lève « Node hasn't been executed », même avec l'optional chaining. Cause :
  n8n lève avant que JS n'évalue. Correctif : un nœud « pack body » dans
  chaque branche ré-injecte les champs dans `$json`, le Merge sort un item
  unifié. Règle apprise : ne lire en aval que ce que **toutes** les branches
  produisent.
- Images : canvas du routeur (56 nœuds) ; cockpit — planning ; Telegram.
- Stack : n8n, OpenAI, Notion, Telegram, Cloudflare Workers, Astro.

### 5.3 Site sages-femmes — `site-sages-femmes` (nouvelle, `statut: usage`, ordre 3)
- Titre : « Un site de cabinet qui est une plateforme : 51 pages, 8 outils,
  une assistante IA »
- Prouve : un produit complet **en usage quotidien** par un cabinet, où chaque
  brique (outils hors-ligne, IA, modération, PWA) est réelle.
- Contexte : un cabinet de sages-femmes ; les sites du secteur sont des
  plaquettes ; celui-ci est une ressource — et sa vitrine.
- Construit : 8 outils client (contractions hors-ligne, mouvements de bébé,
  calendrier de grossesse avec agenda `.ics` et rappels, questionnaire
  bien-être sans stockage, Vrai/Faux 21 fiches sourcées, quand consulter,
  sources officielles, recherche interne) ; assistante IA sur une base de
  connaissances **générée depuis les données du site** (jamais de réponse
  écrite à la main), garde-fous santé ; boîte à idées et avis patientes avec
  modération avant publication (Workers + KV) ; PWA hors-ligne ; lecture audio
  des articles ; confort de lecture ; blog en collections ; 4 newsletters n8n ;
  données structurées, sitemap.
- Schéma : Données du site → Base de connaissances → Assistante · Outils →
  localStorage · Avis → Modération → Publication.
- Preuves : en ligne (lien public) ; 51 pages ; 5 workflows n8n ; **chiffres à
  recopier depuis `C:\Dev\site-sages-femmes\site\ETAT-DU-SITE.md`** avant
  publication.
- **Incident** : le service worker servait JS et CSS en *stale-while-
  revalidate* → une version de retard à chaque déploiement, la liste des
  consultations cassée en ligne alors que le fichier corrigé était déployé.
  Correctif : scripts et styles même-origine en *network-first*, version de
  cache incrémentée pour purger. Règle : on vérifie un déploiement en
  contournant le SW, jamais à travers lui.
- Aucun nom, aucune ville, aucun prénom de patiente ; captures sur les pages
  publiques sans avis réel visible.
- Images : accueil ; compteur de contractions ; l'assistante ouverte ; Vrai/Faux.
- Stack : Astro, Cloudflare Pages, Workers, KV, OpenAI, n8n, PWA.

### 5.4 Hub santé — `hub-sante` (v1, `statut: demonstrateur`, ordre 4)
Images : le bâtiment (accueil de la vitrine) ; une réunion avec compte-rendu
(seed) ; le cockpit. Rien d'autre ne change.

### 5.5 Studio — `studio-moonkura` (v1, `statut: usage`, ordre 5)
Images : l'éditeur avec un morceau ; les quatre pistes séparées. Rien d'autre
ne change.

## 6. Images

- Sources : `src/assets/realisations/<slug>/<nom>.png`, **1 600 px de large**,
  ≤ 400 Ko chacune (compression PNG au dépôt, `pngquant`-like via `sharp` dans
  un script `scripts/preparer-captures.mjs` : redimensionne à 1 600, écrit en
  PNG palette ou WebP source si le PNG dépasse 400 Ko).
- Frontmatter : `images: [{ fichier, alt, legende }]` (≥ 2) ; `fichier` relatif
  au dossier de l'étude. Le gabarit rend `<Image>` d'`astro:assets`, largeurs
  `[640, 1280]`, format WebP, `loading="lazy"`, `decoding="async"`, `alt`
  obligatoire, légende en `<figcaption>` mono. La première image sert de
  vignette à la carte de l'accueil (640 px).
- Captures brutes : `C:\Dev\portfolio\captures-brutes\<slug>\` (git-ignoré),
  Telegram déposé par Jonathan dans `captures-brutes\telegram\`.
- **Règle de confidentialité des captures** : relues à l'œil une par une ;
  aucune vraie adresse e-mail, aucun vrai téléphone, aucun nom de tiers hors
  personas ; une capture douteuse est recadrée ou écartée.
- Budgets mesurés : accueil **< 1 000 000 o** (vignettes lazy), page d'étude
  **< 1 200 000 o** à la première vue ; les images sous la ligne de flottaison
  ne comptent pas dans la première vue si elles sont lazy — le test mesure ce
  que le navigateur charge réellement.

## 7. Tests (en plus de la v1)

- vitest : (a) `automatisations.ts` compte **100** entrées dont **93**
  actives, identifiants uniques au format n8n ; chaque ligne a `metier`,
  `declencheur`, `statut` valides, une `action` de 20 à 140 caractères, aucun
  mot interdit, aucun nom de persona ni de personne ; (b) le chiffre « 100 ·
  93 » de `chiffres.json` égale les comptes calculés depuis
  `automatisations.ts` ; (c) chaque étude a ≥ 2 images, chaque fichier existe et
  ≤ 400 Ko ; (d) `statut` et `statutLigne` présents sur les cinq ; (e) règle
  « client » du § 2 ; (f) test des liens externes **corrigé** : l'origine
  finale après redirection doit être l'origine demandée (un mur Access est un
  échec).
- e2e : `/automatisations/` en 200 avec six `h2` et ≥ 95 lignes ; cinq cartes
  sur l'accueil avec vignette ; badge présent sur chaque page d'étude ; poids
  de l'accueil et d'une page d'étude sous budget ; 390 px sans défilement
  horizontal sur les nouvelles pages ; liens externes en onglet neuf sur les
  pages d'étude aussi.

## 8. Technique

Inchangée (Astro 6, Pages). `astro:assets` déjà disponible (dépendance
`sharp` présente). Nouvelle page `src/pages/automatisations.astro`, composants
`Tuiles.astro` (accueil), `Galerie.astro` (images d'une étude), `Badge.astro`
(statut, partagé carte / page / inventaire). Sitemap : la nouvelle page y entre.

## 9. Hors périmètre v2

Make (scénarios migrés, pas de double compte) · vidéos · version anglaise ·
mode sombre · formulaire de contact · reprise du hero (v1 acquise).

## 10. Definition of done

Cinq études avec images ; inventaire à 100 lignes vérifié contre l'export ;
badges partout ; captures relues ; budgets mesurés ; suites vertes avec une
mutation par test nouveau ; déployé ; sept URL + `/automatisations/` en 200 ;
README à jour (captures, script, page).

## 11. Actions de Jonathan

1. Déposer 2-3 captures Telegram (bot BTP : menu, confirmation de visite ; bot
   Camille : rappel) dans `C:\Dev\portfolio\captures-brutes\telegram\`.
2. Relire les cinq études avant publication (chiffres, ton).
3. Toujours en attente : « 53 », « T = 0,2 », pytest studio, photo, domaine,
   LinkedIn, GitHub, montée Astro 7.

## 12. Décisions par défaut

| Question | Défaut |
|---|---|
| Ordre des études | BTP, thérapeutes, sages-femmes, hub, studio |
| Vignette de carte | première image de l'étude |
| Comptes par métier | calculés depuis les données, jamais écrits |
| Chiffre sages-femmes « 51 pages, 8 outils » | à confirmer dans `ETAT-DU-SITE.md`, corrigé si différent |
