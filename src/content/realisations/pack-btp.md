---
titre: "Le pack BTP : 29 workflows autour d'un artisan"
prouve: "Un système complet — de la demande à l'avis — avec un LLM encadré, un cockpit, des relances, et des incidents réels corrigés."
statut: demo
statutLigne: "Pack complet en service depuis juin 2026 sur un artisan de démonstration : le pipeline tourne pour de vrai, les données sont de démo — aucun client réel à ce jour."
ordre: 1
resume: "Vingt-neuf workflows qui se tiennent : estimation, visite, devis, chantier, facture, relances, avis. Un artisan de démonstration, un cockpit, un bot Telegram."
contexte: "Un plombier de démonstration reçoit des demandes imprécises. Le pack couvre tout son cycle sans qu'il touche un logiciel : il valide depuis Telegram, le reste part tout seul — estimation, créneaux de visite, devis, facture, relances, demande d'avis."
metier: btp
construit:
  - "Estimation IA d'une demande : catalogue de 53 prestations, modèle en sortie JSON, quatre garde-fous déterministes, repli explicite quand la nature des travaux n'est pas reconnaissable."
  - "Validation par l'artisan depuis Telegram : boutons à retour instantané, routeur de callbacks, e-mail nominatif au demandeur au nom de l'artisan."
  - "Visite : proposition de créneau, confirmation par le demandeur d'un clic, validation de l'artisan, annulation possible jusqu'au bout — chaque étape trace une activité."
  - "Devis pré-rempli depuis les briques de l'estimation, catalogue avec autocomplétion, remise, conditions, envoi et acceptation en ligne."
  - "Acceptation → chantier lancé d'un bouton Telegram ; chantier terminé depuis le cockpit ; facture acompte puis solde, bascule automatique en retard, relances."
  - "Avis Google demandé au bon moment, réception simulée pour la démo, relances dues chaque semaine sur Telegram."
  - "Un cockpit (Worker Cloudflare : lecture, écriture, calcul) alimenté chaque matin par un feeder, un briefing matinal Telegram, un agent terrain de 35 nœuds."
  - "Un prompt versionné et une batterie de dix cas rejouée après chaque modification — parce qu'un modèle varie d'une exécution à l'autre."
schema: ["Demande", "Estimation IA", "Visite", "Devis", "Chantier", "Facture", "Avis"]
preuves:
  - "En service depuis juin 2026 sur un client de démonstration (accès sur demande)."
  - "Les 29 workflows sont listés, avec leur déclencheur et leur rôle, dans l'inventaire."
  - "Incident A-007 détecté par un contrôle qualité hebdomadaire automatique, corrigé, vérifié contre le code déployé."
incident:
  titre: "A-007 — les fourchettes absurdes"
  constat: "La même demande — un réseau de plomberie cuisine et salle de bain — donnait successivement 130–391 €, 110–181 €, puis un refus. 181 € pour un réseau complet, c'est moins qu'une journée de travail."
  cause: "Le modèle mobilisait les briques en quantité unitaire (une heure, un mètre linéaire) ; le garde-fou G4 prenait cette somme pour un plafond fiable et écrasait dessus la borne haute — pourtant juste — du modèle. Il existait un plancher sur la borne basse, rien de symétrique sur la haute."
  correctif: "Un ratio : si la borne haute du modèle dépasse deux fois la somme catalogue, cette somme est manifestement unitaire et n'est plus un plafond — on bascule en repli explicite. Le bloc corrigé a été extrait du workflow déployé et rejoué tel quel sur quatre exécutions réelles : quatre sur quatre."
stack: ["n8n", "OpenAI", "Notion", "Telegram", "Cloudflare Pages", "Cloudflare Workers", "Python"]
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
