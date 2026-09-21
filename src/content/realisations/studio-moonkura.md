---
titre: "Station audio collaborative en ligne — séparation de pistes par IA, tempo variable"
prouve: "Creative technologist et rigueur à la fois : audio temps réel dans le navigateur, GPU local, 1 256 tests et des mutations pour les prouver."
statut: usage
statutLigne: "En production : utilisé au quotidien par deux groupes de musique, depuis un PC, une tablette et un téléphone."
ordre: 5
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
images:
  - fichier: "editeur-le-nuage.png"
    alt: "Éditeur multipiste du studio avec sept pistes (voix, basse, beat, FX, guitare, cuivres) et l'inspecteur ouvert sur un clip de basse."
    legende: "L'inspecteur d'un clip de basse montre le réglage « Tempo & hauteur » : étirement temporel de 175 à 160 BPM, hauteur préservée."
  - fichier: "historique-versions.png"
    alt: "Menu Historique ouvert dans l'éditeur, listant les versions horodatées successives du morceau."
    legende: "Chaque modification du morceau garde une version horodatée, consultable depuis le menu Historique."
---
