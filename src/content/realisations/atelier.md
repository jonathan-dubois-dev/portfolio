---
titre: "Un atelier de génération d'images et de vidéos à zéro euro par mois"
prouve: "Deux moteurs très différents — nuage plafonné, GPU maison — derrière un seul contrat, sans mentir sur ce que chacun sait faire."
statut: usage
statutLigne: "En service depuis août 2026, utilisé depuis le téléphone ; accès sur invitation (Cloudflare Access)."
ordre: 6
resume: "Générer des images et des vidéos sans jamais payer d'abonnement : un moteur cloud plafonné et un moteur maison sur GPU, choisis à chaque lancement, une seule console accessible depuis le téléphone."
contexte: "Les générateurs d'images et de vidéos grand public sont devenus payants. Contrainte posée : aucun coût récurrent, utilisable depuis un téléphone, et des images de personnes présentables — sans jamais mentir sur ce qu'un moteur limité sait vraiment faire."
construit:
  - "Console web sur Cloudflare (Worker, D1, R2) derrière Cloudflare Access, utilisable depuis un téléphone."
  - "Moteur cloud sur Workers AI, modèle retenu après comparaison de 48 images sur l'anatomie et le format."
  - "Moteur maison : ComfyUI sur une RTX 3060, exposé par un tunnel fermé par Service Auth — sans quota, sans filtre, graine honorée."
  - "Six recettes (vidéo libre, plan vidéo, plan du clip, personnes, visuel, libre) ; le moteur se choisit au lancement."
  - "Un contrat unique entre les deux moteurs : chacun déclare son déterminisme et son code d'indisponibilité, la console ne devine jamais."
  - "Ménage nocturne qui efface des fichiers, jamais des lignes de la base."
  - "Deux tâches planifiées Windows qui relancent ComfyUI et le tunnel automatiquement."
schema: ["Recette", "Contrat unique", "Moteur cloud", "Moteur maison", "Registre D1", "Galerie"]
preuves:
  - "141 tests (17 fichiers), relancés le 21/09."
  - "Mesures froid/chaud du moteur maison publiées dans le dépôt."
  - "Aucun chiffre de quota inventé : `reste: null` veut dire « je ne sais pas », jamais zéro."
incident:
  titre: "Workers AI n'honore pas la graine"
  constat: "La console promettait de pouvoir « refaire à l'identique » une génération en repassant la même graine ; mesuré sur le moteur cloud, deux générations avec la même graine donnaient deux images différentes."
  cause: "Workers AI n'honore pas la graine transmise : une limite du service, pas un bug de la console — le moteur maison, lui, l'honore correctement."
  correctif: "La console a cessé de promettre « refaire à l'identique » partout : chaque moteur déclare son déterminisme et son code d'indisponibilité, elle ne devine jamais et ne bascule jamais de moteur en silence."
stack: ["Cloudflare Workers", "D1", "R2", "Workers AI", "Access", "ComfyUI", "LTX-Video", "Python"]
liens:
  - { libelle: "L'Atelier (accès sur invitation)", url: "https://atelier.aelto.fr" }
images:
  - fichier: "console-galerie.png"
    alt: "Console de l'Atelier : une image de lapin dans la galerie, compteur « cloud 0 images cloud aujourd'hui », panneau de droite avec Prompt, Recette Libre, Moteur cloud, Format carré, Nombre 1, bouton Générer."
    legende: "La galerie affiche une génération déjà produite pendant que le panneau de droite prépare la suivante, moteur cloud sélectionné."
  - fichier: "moteur-maison-indisponible.png"
    alt: "Recette Personnes, moteur « maison (indisponible) », réglages ouverts (graine, étapes), message rouge « Moteur maison indisponible : ton PC ne répond pas (tunnel fermé ou machine éteinte) », bouton Générer grisé."
    legende: "Quand le PC de la maison est éteint ou le tunnel fermé, la console le dit en clair et grise le bouton Générer plutôt que de basculer de moteur en silence."
  - fichier: "preparation-generation-cloud.png"
    alt: "Prompt saisi « Un petit lapin blanc sous un arbre mort, ciel gris, style manga noir et blanc, plan large », recette Libre, moteur cloud, réglages ouverts, image du lapin déjà en galerie."
    legende: "Le prompt et la recette Libre sont prêts, moteur cloud choisi, avant de lancer une nouvelle génération."
---
