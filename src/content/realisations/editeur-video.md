---
titre: "Un éditeur de montage piloté par la musique, construit pour un clip"
prouve: "Un outil créatif complet — timeline, effets, rendu — écrit sur mesure quand l'outil du commerce ne fait pas ce qu'on veut."
statut: usage
statutLigne: "En usage sur le montage du clip GOLD3N RABBIT, en local, sur le PC de montage ; outil personnel, pas un produit."
ordre: 5
resume: "Un clip de 6 min 36 à monter sur les beats d'un morceau, à partir de 470 rushes générés par IA : timeline aimantée au tempo, effets minutés, aperçu WebGL qui prévoit le rendu ffmpeg avant de le lancer."
contexte: "Un clip de 6 min 36 (396 s) à monter à partir de rushes de 9 s générés par IA (832 × 464), calé sur les temps forts du morceau — les logiciels de montage du commerce ne connaissent pas les beats."
construit:
  - "Carte du rythme calculée depuis l'audio (numpy) : beats et temps forts détectés pour aimanter les coupes."
  - "Timeline avec forme d'onde et beats, coupes aimantées au beat, glisser-déposer des plans, undo/redo."
  - "18 transitions (fondus enchaînés type xfade) et une piste d'effets minutés — flou, glitch, noir et blanc, tremblement, zoom, vignette."
  - "Aperçu WebGL en temps réel (deux textures vidéo, un shader unique) qui reproduit l'étalonnage, les effets et les transitions du rendu ffmpeg, sans jamais rendre pour prévisualiser."
  - "Trimmer de rushes avec rescan incrémental du catalogue, pour ajouter des plans sans tout redécrire."
  - "Catalogue de 470 rushes vignettés, dont 243 décrits par douze agents en parallèle (type, cadre, mouvement, qualité, plans compatibles)."
  - "Un projet en JSON édité à deux mains : Jonathan cale à l'oreille, l'assistant renseigne les données."
  - "9 blocs narratifs et 84 plans au total, organisés dans un navigateur de rushes par dossier."
schema: ["Rushes", "Catalogue", "Timeline", "Aperçu WebGL", "Rendu ffmpeg", "Clip"]
preuves:
  - "13 scripts Python et un serveur en bibliothèque standard (port local), aucune dépendance lourde hors ffmpeg."
  - "Le clip entier (6 min 36) a été rendu et assemblé avec cet outil."
  - "Aucune suite de tests automatisés : outil personnel vérifié à l'œil et à l'oreille, dit tel quel."
incident:
  titre: "Les effets étaient ignorés au rendu"
  constat: "L'aperçu WebGL montrait les effets appliqués sur chaque plan, mais le mp4 rendu par ffmpeg ne les avait pas : le résultat final paraissait plat."
  cause: "La conversion du projet JSON vers le manifeste de rendu ne recopiait pas le champ `fx` avec ses fenêtres de temps ; l'aperçu et le rendu lisaient deux structures différentes."
  correctif: "Correctif d'une ligne pour recopier le champ manquant, et une règle retenue : l'aperçu et le rendu lisent désormais la même structure, jamais deux copies."
stack: ["Python", "ffmpeg", "WebGL", "Web Audio", "numpy"]
liens: []
images:
  - fichier: "timeline-bloc1.png"
    alt: "Éditeur du bloc 1 : lecteur vidéo noir en haut, timeline avec forme d'onde et repères de beats, bande de quatre plans en dessous, panneau de droite vide (aucun plan sélectionné)."
    legende: "La timeline du bloc 1 aligne la forme d'onde, les repères de beats et la bande de plans ; rien n'est encore sélectionné dans le panneau de droite."
  - fichier: "effets-plan-selectionne.png"
    alt: "Bloc 3, plan c145 sélectionné : panneau « Effets du plan » avec sept curseurs à 80 %, réglages du plan, transition « Fondu enchaîné », bande de treize plans, aperçu noir (vidéo non lue)."
    legende: "Le plan c145 sélectionné affiche ses sept effets réglables et sa transition en fondu enchaîné ; l'aperçu reste noir tant que la vidéo n'est pas lancée."
  - fichier: "navigateur-de-rushes.png"
    alt: "Fenêtre « Parcourir les clips » : neuf dossiers de blocs avec leur nombre de rushes, plus Clip (243) et Découpes, et les vignettes en noir et blanc du lapin des rushes générés par IA."
    legende: "Le navigateur de rushes classe les 470 rushes générés par IA par bloc narratif, avec un aperçu au survol avant assignation à un plan."
---
