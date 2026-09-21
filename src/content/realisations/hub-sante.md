---
titre: "Plateforme de coordination pour maison de santé — compte-rendu de réunion automatique"
prouve: "Une application IA complète, de l'authentification aux automatisations, sous une contrainte réglementaire forte : zéro donnée patient."
statut: demonstrateur
statutLigne: "Construit pour un projet réel de maison de santé pluriprofessionnelle ; resté au stade du démonstrateur — les outils déjà en place chez les praticiens couvraient une partie du besoin."
ordre: 4
resume: "Une quarantaine de praticiens à coordonner — réunions, documents, fournitures, forum — sans jamais toucher une donnée patient. Le compte-rendu de réunion s'écrit tout seul."
contexte: "Une maison de santé pluriprofessionnelle réunit une quarantaine de praticiens qui doivent se coordonner : réunions, documents partagés, fournitures, annonces, échanges internes. La contrainte qui commande tout : aucune donnée patient, sous aucune forme — sinon l'hébergement doit être certifié HDS. Le logiciel métier garde le patient ; la plateforme ne garde que la vie du centre."
construit:
  - "Un site public (Astro, Cloudflare Pages) dont l'accueil est le bâtiment lui-même, avec un espace par praticien, et un assistant de renseignement à débit limité (vingt questions par dix minutes et par adresse)."
  - "Un hub privé (Astro serveur sur Workers, base D1) avec sessions maison, mots de passe PBKDF2, invitations par courriel, journal d'activité."
  - "Des réunions avec compte-rendu automatique : l'enregistrement est transcrit (Whisper) puis structuré (Llama 3.3) sur Workers AI ; l'audio n'est jamais conservé, la transcription est effacée à la validation du président."
  - "Un détecteur d'allusion à un patient passe sur chaque brouillon avant validation ; la case « je confirme » est obligatoire."
  - "Documents versionnés avec corbeille, forum modéré, messagerie interne, réservation de salles, suivi des fournitures et des commandes."
  - "Cinq automatisations n8n : relais mail, entretien nocturne, sauvegarde quotidienne sur R2 sans transcriptions, digest du lundi, rappels de réunion et de commande."
  - "Une charte visuelle propre au lieu — plaques émaillées, onglets de carnet — avec un plancher de taille de texte pour les lecteurs de 75 ans."
schema: ["Enregistrement", "Whisper (Workers AI)", "Llama 3.3", "Détecteur patient", "Validation présidence", "Courriel sans contenu"]
preuves:
  - "177 tests unitaires et 56 tests navigateur sur le hub ; 61 et 70 sur le site public."
  - "Transcription vérifiée en conditions réelles sur Workers AI : treize secondes pour un enregistrement d'une minute, brouillon structuré, aucun texte dans les journaux."
  - "Sauvegarde R2 et relais mail vérifiés une fois déployés : courriel d'invitation réellement reçu."
incident:
  titre: "Connexion en erreur 500 dès le premier déploiement"
  constat: "Le hub fonctionnait parfaitement en local ; une fois déployé, chaque tentative de connexion répondait 500. Rien dans les journaux applicatifs."
  cause: "Le hachage des mots de passe utilisait PBKDF2 à 210 000 itérations. Le moteur WebCrypto de Cloudflare Workers plafonne à 100 000 : au-delà, l'appel lève une exception — invisible en local, où le moteur Node n'a pas cette limite."
  correctif: "Itérations ramenées sous le plafond, base distante rechargée, redéploiement — et une règle ajoutée à la liste de contrôle : tester la connexion réelle après chaque déploiement, jamais seulement en local."
stack: ["Astro", "Cloudflare Workers", "Cloudflare Pages", "D1", "R2", "Workers AI", "n8n", "vitest", "Playwright"]
liens:
  - { libelle: "Site public du démonstrateur", url: "https://hub-sante-demo.pages.dev" }
images:
  - fichier: "plan-des-etages.png"
    alt: "Vue « bâtiment » du site public : plan interactif des étages avec l'accès à l'espace de chaque praticien."
    legende: "L'accueil du site public est le plan du bâtiment lui-même, cliquable étage par étage."
  - fichier: "equipe-photo.png"
    alt: "Page équipe du site public : photo de groupe des praticiens de démonstration devant le bâtiment, avec un texte de présentation de la maison de santé."
    legende: "L'équipe présentée ici est un jeu de données de seed, aucun patient : praticiens et photo de démonstration pour le prototype."
---
