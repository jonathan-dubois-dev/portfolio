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
images:
  - fichier: "telegram-demande-estimation.webp"
    alt: "Capture d'écran de téléphone montrant une notification Telegram de nouvelle demande de devis BTP avec une estimation chiffrée entre 380 et 500 euros hors taxes."
    legende: "Sur le téléphone de l'artisan, la demande arrive avec une fourchette chiffrée et un brouillon de réponse prêt à valider d'un « ok »."
  - fichier: "cockpit-tableau-de-bord.png"
    alt: "Tableau de bord du cockpit BTP affichant zéro visite, huit demandes, douze devis en attente et deux factures en retard."
    legende: "Le tableau de bord résume l'activité du jour en un instant : visites, demandes, devis et factures en retard."
  - fichier: "cockpit-demandes.png"
    alt: "Liste des demandes de devis dans le cockpit, avec leur statut, leur urgence et des boutons pour planifier ou créer le devis."
    legende: "Chaque demande affiche son statut et son urgence, avec un accès direct pour planifier une visite ou créer le devis."
  - fichier: "cockpit-devis.png"
    alt: "Liste de cent devis dans le cockpit, avec leurs statuts envoyé, accepté ou refusé et des boutons pour renvoyer ou facturer l'acompte."
    legende: "Cent devis suivis avec leur statut et, pour chacun, la possibilité de le renvoyer ou d'émettre la facture d'acompte."
  - fichier: "telegram-briefing-du-matin.webp"
    alt: "Capture d'écran de téléphone montrant le briefing du matin envoyé par Telegram : visites, demandes, devis en attente et factures en retard."
    legende: "Chaque matin, l'artisan reçoit sur Telegram un résumé de la journée avec des boutons vers le planning, les factures, les devis et les demandes."
  - fichier: "telegram-devis-en-attente.webp"
    alt: "Capture d'écran de téléphone affichant la liste des douze devis en attente sous forme de boutons Telegram."
    legende: "Les douze devis en attente sont listés directement dans Telegram, un bouton par devis."
  - fichier: "cockpit-planning.png"
    alt: "Vue du planning hebdomadaire du cockpit BTP, avec une semaine type et les absences renseignées."
    legende: "Le planning affiche la semaine type de l'artisan et les absences déjà posées."
  - fichier: "n8n-estimation.png"
    alt: "Canvas n8n du workflow d'estimation : webhook, lecture du catalogue Notion, compactage, appel au modèle, garde-fous et réponse."
    legende: "Le workflow d'estimation, du webhook à la réponse, avec ses garde-fous déterministes et sa branche de secours vers Telegram."
  - fichier: "n8n-agent-terrain.png"
    alt: "Canvas n8n de l'agent terrain Telegram : déclencheur, callback, extraction par le modèle, traitement photo et voix, confirmations."
    legende: "L'agent terrain reçoit les messages Telegram de l'artisan — texte, photo ou voix — et en extrait les informations utiles."
---
