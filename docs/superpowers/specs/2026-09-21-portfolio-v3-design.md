# Portfolio v3 — « Aussi construit » — spec de conception

Date : 2026-09-21. Amende les specs v1 (`2026-09-19-portfolio-design.md`) et v2
(`2026-09-19-portfolio-v2-design.md`), qui restent l'autorité pour tout ce qui
n'est pas repris ici. Motif : un inventaire des dossiers (21/09) montre que le
site v2 tait la moitié de ce qui a été construit — un éditeur de montage vidéo,
l'Atelier de génération, une démo immobilière, des outils d'exploitation.

## 1. Décisions (21/09/2026, Jonathan)

| Décision | Valeur |
|---|---|
| Études de cas | **sept** : les cinq de v2 + **éditeur de montage vidéo** + **L'Atelier** |
| Ordre de l'accueil | BTP, thérapeutes, sages-femmes, **studio**, éditeur vidéo, Atelier, **hub** (ce qui tourne pour de vrai d'abord, les démonstrateurs à la fin) |
| Section « Aussi construit » | remplace la section « Aussi » (deux vignettes) : **sept cartes** avec vignette, une phrase, badge, lien s'il existe ; **sans page de détail** |
| Cartes | démo agence immobilière, watermark remover, console de pilotage, agent superviseur, bibliothèque d'effets 3D, Troisième Étage, pubs animées 3D |
| Exclus | Al'Tarba « Le Cabinet » (le prospect n'a jamais répondu : pas de référence) ; le rapprochement ortho (données de l'employeur — cité seulement dans l'expérience LinkedIn) |
| Captures | **faites par Jonathan** pour l'éditeur vidéo, l'Atelier, la démo immo, le watermark remover, la console, le superviseur ; par l'assistant en ligne pour lab-effets, Troisième Étage, pubs |
| « En production » | autorisé pour le studio (deux groupes) et le site sages-femmes (accord de sa compagne) ; toujours interdit aux packs, au hub, aux cartes `demo`/`arrete` et à la description du site |
| Nouveau statut | **`arrete`** — « Arrêté », badge gris ; porté par la démo immo et le watermark remover ; **réservé aux cartes** (aucune étude n'est arrêtée) |

## 2. La ligne d'honnêteté (complément v2 § 2)

| Code | Libellé | S'applique à |
|---|---|---|
| `usage` | En usage quotidien | sages-femmes, studio, éditeur vidéo, Atelier, console, superviseur, lab-effets, Troisième Étage, pubs |
| `demo` | Pack de démonstration, en service | packs BTP, thérapeutes |
| `demonstrateur` | Démonstrateur, en construction | hub santé |
| `arrete` | Arrêté | démo immo, watermark remover (cartes seulement) |

`STATUTS` gagne `arrete` ; le schéma des études garde `["usage","demo","demonstrateur"]`,
celui des cartes accepte les quatre. Le mot **« production »** (toute forme :
« en production », « en prod ») n'est admis que dans les études `usage` ; un test
le refuse ailleurs — packs, hub, cartes `demo`/`arrete`, `identite.descriptionSite`.
La phrase générale `identite.ligne` (« des systèmes IA qui tournent en production »)
reste : elle décrit la pratique, pas une réalisation, et deux réalisations sont en
production.

Deux `statutLigne` retouchées : studio → « En production : utilisé au quotidien par
deux groupes de musique, depuis un PC, une tablette et un téléphone » ; sages-femmes
→ « En production et en usage quotidien par un cabinet de sages-femmes depuis juin
2026 ; construit comme la vitrine de ce que je sais faire pour un praticien ».

Règles inchangées : mots interdits, règle « client », personas jamais dans les
textes, aucun nom réel / ville / e-mail / téléphone dans les images. Le clip peut
être nommé (**GOLD3N RABBIT**, œuvre de Jonathan) ; ses rushes peuvent apparaître ;
leur origine est dite « générés par IA », sans nommer d'outil grand public.

## 3. Les deux nouvelles études

Même gabarit que les cinq autres (`src/content/realisations/*.md`, schéma inchangé).
Chiffres relevés le 21/09 dans les dossiers ; les recompter à la rédaction.

### 3.1 Éditeur de montage vidéo — `editeur-video` (`usage`, ordre 5, pas de lien)

- Titre : « Un éditeur de montage piloté par la musique, construit pour un clip ».
- Prouve : un outil créatif complet — timeline, effets, rendu — écrit sur mesure quand
  l'outil du commerce ne fait pas ce qu'on veut.
- statutLigne : « En usage sur le montage du clip GOLD3N RABBIT, en local, sur le PC de
  montage ; outil personnel, pas un produit ».
- Contexte : un clip de 6 min 36 (396 s) à monter à partir de rushes de 9 s générés par
  IA (832 × 464), calé sur les temps forts du morceau — les logiciels de montage ne
  connaissent pas les beats.
- Construit : carte du rythme calculée depuis l'audio (numpy) ; timeline avec forme
  d'onde et beats, coupes aimantées sur le beat, glisser-déposer des plans, undo/redo ;
  18 transitions (xfade) et une piste d'effets minutés — flou, glitch, N&B, tremblement,
  zoom, vignette ; **aperçu WebGL en temps réel** (deux textures vidéo, shader unique)
  qui reproduit l'étalonnage, les effets et les transitions du rendu ffmpeg sans
  rendre ; trimmer de rushes avec rescan incrémental du catalogue ; catalogue de
  **470** rushes vignettés, dont 243 décrits par douze agents en parallèle
  (type, cadre, mouvement, qualité, plans compatibles) ; projet en JSON édité à deux
  mains (Jonathan à l'oreille, l'assistant aux données) ; 9 blocs, 84 plans.
- Schéma : Rushes → Catalogue → Timeline → Aperçu WebGL → Rendu ffmpeg → Clip.
- Preuves : 13 scripts Python + un serveur en bibliothèque standard (port local),
  aucune dépendance lourde hors ffmpeg ; le clip entier rendu et assemblé ; **aucune
  suite de tests automatisés** — outil personnel vérifié à l'œil et à l'oreille, dit
  tel quel.
- Incident : « Les effets étaient ignorés au rendu » — l'aperçu les montrait, le mp4
  ne les avait pas : la conversion projet → manifeste ne recopiait pas le champ `fx`
  avec ses fenêtres de temps. Correctif d'une ligne ; règle retenue : l'aperçu et le
  rendu lisent la même structure, jamais deux copies.
- Stack : Python, ffmpeg, WebGL, Web Audio, numpy.
- Images (Jonathan, 3-4) : timeline avec forme d'onde et beats · panneau effets ou
  transitions ouvert · navigateur de rushes · aperçu WebGL en lecture.

### 3.2 L'Atelier — `atelier` (`usage`, ordre 6, lien `https://atelier.aelto.fr` annoté « accès sur invitation »)

- Titre : « Un atelier de génération d'images et de vidéos à zéro euro par mois ».
- Prouve : deux moteurs très différents — nuage plafonné, GPU maison — derrière un
  seul contrat, sans mentir sur ce que chacun sait faire.
- statutLigne : « En service depuis août 2026, utilisé depuis le téléphone ; accès sur
  invitation (Cloudflare Access) ».
- Contexte : les générateurs grand public sont devenus payants ; contrainte posée :
  aucun coût récurrent, utilisable depuis un téléphone, et des images de personnes
  présentables.
- Construit : console web sur Cloudflare (Worker, D1, R2) derrière Access ; moteur
  `cloud` sur Workers AI (modèle retenu après comparaison de 48 images sur l'anatomie
  et le format) ; moteur `maison` : ComfyUI sur une RTX 3060, exposé par un tunnel
  fermé par Service Auth — sans quota, sans filtre, graine honorée ; six recettes
  (vidéo libre, plan vidéo, plan du clip, personnes, visuel, libre), le moteur se
  choisit au lancement ; ménage nocturne qui efface des fichiers, jamais des lignes ;
  deux tâches planifiées Windows qui relancent ComfyUI et le tunnel.
- Schéma : Recette → Contrat unique → Moteur cloud | Moteur maison → Registre D1 → Galerie.
- Preuves : **141 tests** (17 fichiers, relancés le 21/09) ; mesures froid/chaud
  publiées dans le dépôt ; « aucun chiffre de quota inventé : `reste: null` veut dire
  je ne sais pas, jamais zéro ».
- Incident : « Workers AI n'honore pas la graine » — mesuré ; la console a cessé de
  promettre « refaire à l'identique » : chaque moteur déclare son déterminisme et son
  code d'indisponibilité, la console ne devine jamais et ne bascule jamais de moteur
  en silence.
- Stack : Cloudflare Workers / D1 / R2 / Workers AI / Access, ComfyUI, LTX-Video, Python.
- Images (Jonathan, 3) : la console sur téléphone (recette + moteur) · une galerie de
  résultats · une génération en cours ou terminée sur écran. Aucune image de personne
  réelle reconnaissable.

## 4. La section « Aussi construit »

Nouvelle collection `src/content/aussi/*.md`, schéma :

```
titre: string (≤ 70)
phrase: string (20..160)
statut: "usage" | "demo" | "demonstrateur" | "arrete"
ordre: number (1..7, unique)
lien?: { libelle: string, url: string }     // public ou annoté « accès sur invitation »
image: { fichier: /^[a-z0-9-]+\.(png|webp)$/, alt: string (≥ 10) }
```

Assets : `src/assets/aussi/<slug>/<fichier>`, produits par `npm run captures` depuis
`captures-brutes/aussi/<slug>/` (le script gagne un second dossier source). Rendu :
grille de cartes (vignette 16/10 recadrée 640 × 400, `alt` décoratif vide comme les
cartes d'études — le titre porte le sens), titre, phrase, badge, lien. Composant
`CarteAussi.astro` ; section `#aussi` conservée comme ancre, `<h2>` « Aussi construit ».
`src/data/vignettes.ts` et `Vignettes.astro` disparaissent.

| ordre | slug | statut | phrase (à rédiger dans cet esprit) | lien |
|---|---|---|---|---|
| 1 | `demo-immo` | arrete | Douze workflows et un cockpit pour une agence immobilière ; démonstrateur arrêté faute de pilote | `/automatisations/#immo` (interne) |
| 2 | `watermark` | arrete | Suppression de filigrane vidéo par inpainting (ProPainter) sur un GPU de 6 Go, interface web, 31 tests ; dormant depuis juillet 2026 | — |
| 3 | `console` | usage | Console de pilotage de l'assistant de code depuis le téléphone : Worker-pont, tunnel, chien de garde | — (privé) |
| 4 | `superviseur` | usage | Agent qui relit chaque jour l'exploitation — rapports, anomalies, propositions | — (privé) |
| 5 | `lab-effets` | usage | Treize effets 3D et CSS documentés, mesurés, avec leur licence ; d'où vient le hero de ce site | `https://lab-effets.expertia059.workers.dev` |
| 6 | `troisieme-etage` | usage | Site du second groupe : un ascenseur en CSS 3D, sept effets, 209 tests | `https://troisieme-etage-v2.pages.dev` |
| 7 | `pubs-3d` | usage | Pubs animées en Three.js pour aelto.fr, format portrait, un duo par métier | `https://aelto.fr/p/therapeutes` |

Les chiffres des phrases (31, 13, 209…) sont recomptés à la rédaction ou retirés.
`console.aelto.fr` et `atelier` restent hors des liens de cartes ; `lab-effets` est
public (noindex) : lien strict.

## 5. Accueil et chiffres

- `<h2>` « Sept réalisations » ; `identite.descriptionSite` → « Sept réalisations
  documentées, testées et pesées. » ; cartes d'études dans l'ordre § 1.
- `chiffres.json` : « 100 · 93 actifs » inchangé ; « applications en ligne » → **9**
  (source + `lab-effets.expertia059.workers.dev` ; console et cabinet-demo exclus :
  privé / hors portfolio) ; « tests automatisés » recalculé : somme v2 (1 926) +
  Atelier 141 = **2 067** → affiché « 2 000+ », source détaillée.
- Ordres : pack-btp 1, pack-therapeutes 2, site-sages-femmes 3, studio-moonkura 4,
  editeur-video 5, atelier 6, hub-sante 7.

## 6. Images

Pipeline v2 inchangé (1 600 px, ≤ 400 Ko, WebP par astro:assets, alt + légende) ;
`preparer-captures.mjs` traite aussi `captures-brutes/aussi/<slug>/` →
`src/assets/aussi/<slug>/`. Captures de Jonathan : PNG/JPG ≥ 1 400 px de large pour
les écrans, téléphone tel quel pour le mobile ; relecture pixel par pixel avant
commit (aucun nom réel, e-mail, téléphone, ville ; noms de prospects du superviseur
masqués). Captures de l'assistant : lab-effets, Troisième Étage, pubs (en ligne).

## 7. Tests

- Collection `aussi` : sept fichiers, ordres 1..7 uniques, statuts valides, image
  présente ≤ 400 Ko, aucun orphelin dans `src/assets/aussi/`, alt ≥ 10.
- Règle « production » : refusée hors études `usage` (packs, hub, cartes, description).
- Mots interdits + règle « client » : les cartes rejoignent la liste scannée.
- Liens externes : liens des cartes ajoutés (origine stricte ; atelier via la liste
  « sur invitation », inchangée).
- Études : sept fichiers, ordres 1..7, titres des packs toujours comparés à
  `comptes()`, « au moins deux images » sur les sept.
- Chiffres : « 9 » = nombre de segments de la source ; « 2 000+ » cohérent avec la
  somme écrite dans la source (test qui recalcule la somme).
- e2e accueil : 7 cartes d'études dans l'ordre avec leurs badges ; 7 cartes « Aussi
  construit », chacune avec une image chargée (`naturalWidth > 0` après scroll),
  exactement 2 badges « Arrêté », 3 liens externes en `_blank rel=noopener` ;
  `#aussi [data-vignette]` disparaît.
- e2e pages : les deux nouvelles études (badge, galerie ≥ 3 figures, schéma, incident,
  lien Atelier annoté) ; mobile 390 px sur les sept études ; poids : accueil
  < 350 000 (recadrage 640 × 400 ; si dépassé, baisser la qualité, pas le seuil),
  pages d'étude < 1,2 Mo ; SEO : sitemap avec les sept études.
- Déploiement : dix-sept URL en 200 sur `jonathan-dubois.dev` (accueil, inventaire,
  sept études, sitemap, robots, og, + les six autres déjà vérifiées), console vide.

## 8. Ce que Jonathan fait

1. Déposer les captures dans `C:\Dev\portfolio\captures-brutes\` : `editeur-video\`
   (3-4), `atelier\` (3), `aussi\demo-immo\` (1), `aussi\watermark\` (1, si le disque
   D: est branché), `aussi\console\` (1), `aussi\superviseur\` (1).
2. Relire les sept phrases de cartes et les deux études avant déploiement.

## 9. Hors périmètre

Pages de détail pour les cartes ; Al'Tarba ; rapprochement ortho ; montée Astro 7 ;
LinkedIn (finitions notées à part).
