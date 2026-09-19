---
titre: "Agent d'estimation de devis pour artisans — LLM + garde-fous déterministes"
prouve: "Un LLM en production, encadré par des règles déterministes, testé à chaque modification et corrigé sur incident réel."
statut: demo
statutLigne: "Pack complet en service depuis juin 2026 sur un artisan de démonstration : le pipeline tourne pour de vrai, les données sont de démo — aucun client réel à ce jour."
ordre: 1
resume: "Un artisan reçoit une demande floue ; en quelques minutes il a une fourchette crédible — ou un refus honnête. Jamais un prix inventé."
contexte: "Un artisan du bâtiment reçoit des demandes imprécises — « il y a une fuite », « refaire la salle de bain ». Répondre vite avec un ordre de grandeur crédible fait la différence commerciale ; répondre faux la détruit. Il fallait une estimation automatique qui sache aussi dire « je ne peux pas chiffrer ça sans venir voir »."
construit:
  - "Un webhook reçoit le formulaire de demande : nature des travaux, message libre, coordonnées."
  - "Le catalogue de prestations de l'artisan (53 briques tarifées) est lu dans Notion, puis compacté pour tenir dans le contexte du modèle."
  - "Un LLM en sortie JSON, température 0,2, choisit les briques pertinentes, rédige un cadrage et propose une fourchette basse–haute."
  - "Quatre garde-fous déterministes (G1 à G4) rejouent le calcul : plancher et plafond par type de demande, cohérence fourniture/pose, déplacement obligatoire, correction d'une borne aberrante."
  - "Si aucun mot-clé technique n'identifie la nature des travaux, le système répond par un repli explicite au lieu d'un chiffre."
  - "L'artisan reçoit la demande qualifiée dans Notion et une alerte Telegram ; le demandeur reçoit un e-mail nominatif au nom de l'artisan."
  - "Le prompt est versionné (v1.6) ; une batterie de dix cas — cinq nets, cinq replis — est rejouée après chaque modification, parce qu'un LLM varie d'une exécution à l'autre."
schema: ["Webhook", "Catalogue Notion", "Compactage", "LLM", "Garde-fous G1–G4", "Notion + Telegram", "E-mail"]
preuves:
  - "En service depuis juin 2026 sur un client de démonstration (accès sur demande)."
  - "Batterie de dix cas rejouée après chaque modification du prompt."
  - "Incident A-007 détecté par un contrôle qualité hebdomadaire automatique, corrigé, puis vérifié contre le code réellement déployé."
incident:
  titre: "A-007 — les fourchettes absurdes"
  constat: "La même demande — un réseau de plomberie cuisine et salle de bain — donnait successivement 130–391 €, 110–181 €, puis un refus. 181 € pour un réseau complet, c'est moins qu'une journée de travail."
  cause: "Le modèle mobilisait les briques en quantité unitaire (une heure, un mètre linéaire) ; le garde-fou G4 prenait cette somme pour un plafond fiable et écrasait dessus la borne haute — pourtant juste — du modèle. Il existait un plancher sur la borne basse, rien de symétrique sur la haute."
  correctif: "Un ratio : si la borne haute du modèle dépasse deux fois la somme catalogue, cette somme est manifestement unitaire et n'est plus un plafond — on bascule en repli explicite. Le bloc corrigé a été extrait du workflow déployé et rejoué tel quel sur quatre exécutions réelles : quatre sur quatre."
stack: ["n8n", "OpenAI", "Notion", "Telegram", "Cloudflare Pages", "Python"]
liens: []
---
