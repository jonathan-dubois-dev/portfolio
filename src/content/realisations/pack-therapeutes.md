---
titre: "Le pack thérapeutes : 37 workflows et un cockpit pour un cabinet"
prouve: "La même rigueur sur un second métier, avec une logique de produit à deux paliers et un routeur Telegram de 56 nœuds."
statut: demo
statutLigne: "Pack complet en service depuis juin 2026 sur une praticienne de démonstration : tout tourne, sur des données de démo — aucun client réel à ce jour."
metier: therapeutes
ordre: 2
resume: "Tout ce qu'un cabinet gère à la main — demandes, rappels, absences, honoraires, avis, parrainage — automatisé autour d'un cockpit, pour une praticienne de démonstration."
contexte: "Une praticienne indépendante perd ses soirées en relances, rappels et notes d'honoraires. Le pack prend chaque geste répétitif : le patient confirme d'un clic, la praticienne valide depuis Telegram, le cockpit reflète tout. Deux paliers : l'outil seul, ou l'outil avec les automatisations."
construit:
  - "Demande entrante, confirmation de la candidate, inscription en liste d'attente, créneau libéré proposé au premier de la liste, créneau de dernière minute en express."
  - "Rappel J-1 avec report en self-service, préparation du patient, détection des silencieux, relance no-show avec proposition de créneau."
  - "Anamnèse : invitation depuis le cockpit, réception du formulaire, plan de soins envoyé ; note d'honoraires, demande et réception d'acompte."
  - "Impayés : détection quotidienne, relance douce depuis le cockpit, action de relance ; absence de la praticienne : détection, proposition, traitement par e-mail et report."
  - "Satisfaction : demande d'avis, réception, demande d'avis Google ; parrainage en deux temps (invitation du parrain, filleul inscrit) ; petit mot d'anniversaire."
  - "Un routeur de validation Telegram de 56 nœuds : chaque bouton de la praticienne déclenche la bonne branche et répond sans quitter Telegram."
  - "Briefing matinal, récap quotidien, débrief du soir, bilan mensuel ; un feeder CRM quotidien alimente le cockpit."
  - "Deux paliers décidés et testés : outil (69 €, cockpit en lecture et liens ciblés) ou cabinet complet (109 €, édition en place et toutes les automatisations)."
schema: ["Demande", "Confirmation", "Rappel J-1", "Séance", "Honoraires", "Avis"]
preuves:
  - "Les 37 workflows sont listés, avec leur déclencheur et leur rôle, dans l'inventaire."
  - "Cockpit sur données de démonstration ; routeur Telegram de 56 nœuds visible sur la capture."
  - "Migration Make → n8n de 24 workflows en une matinée le 10/06/2026, horodatages à l'appui."
incident:
  titre: "« Node hasn't been executed » dans le routeur Telegram"
  constat: "Un bouton sur trois faisait planter le routeur : n8n levait « Node 'X' hasn't been executed » sur la branche prise, alors que le nœud incriminé existait bien — dans une autre branche."
  cause: "Après un Switch, une seule branche s'exécute. Un nœud aval lisait `$('Nœud').first()` d'une branche non prise ; n8n lève avant même que JavaScript n'évalue, l'optional chaining ne protège de rien."
  correctif: "Un nœud « pack body » dans chaque branche ré-injecte dans `$json` les champs dont l'aval a besoin ; le Merge sort un item unifié, l'aval ne lit plus que `$json`. Règle retenue : en aval d'un Switch, ne lire que ce que toutes les branches produisent."
stack: ["n8n", "OpenAI", "Notion", "Telegram", "Cloudflare Workers", "Astro"]
liens: []
images:
  - { fichier: "canvas-routeur.png", alt: "Canvas n8n du routeur de validation Telegram : 56 nœuds répartis en branches depuis un Switch.", legende: "Le routeur de validation : un Switch, une branche par bouton, un « pack body » avant chaque Merge." }
  - { fichier: "cockpit-planning.png", alt: "Le cockpit du cabinet : planning de la semaine sur données de démonstration.", legende: "Le cockpit, alimenté chaque matin par le feeder CRM." }
  - { fichier: "cockpit-calendrier.png", alt: "L'agenda de la semaine du 14 au 20 septembre 2026 dans le cockpit, avec des créneaux confirmés et à confirmer.", legende: "Le calendrier de la semaine, avec ses premières consultations et ses créneaux encore à confirmer." }
---
