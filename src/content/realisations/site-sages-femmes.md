---
titre: "Un site de cabinet qui est une plateforme : une centaine de pages, 13 outils, une assistante IA"
prouve: "Un produit complet en usage quotidien par un cabinet, où chaque brique — outils hors-ligne, assistante, modération, PWA — est réelle et testée."
statut: usage
statutLigne: "En ligne et en usage quotidien par un cabinet de sages-femmes depuis juin 2026 ; construit comme la vitrine de ce que je sais faire pour un praticien."
ordre: 3
resume: "Les sites de cabinet sont des plaquettes. Celui-ci a treize outils qui marchent hors-ligne, une assistante qui répond depuis les données du site, des avis modérés, quatre lettres automatisées."
contexte: "Un cabinet de sages-femmes voulait plus qu'une plaquette : une ressource pour les patientes, entre deux consultations. Contrainte : aucune donnée de santé stockée, une déontologie stricte sur les avis, un site qui tienne sur un téléphone en 4G."
construit:
  - "Treize outils côté patiente, sans compte ni serveur : compteur de contractions hors-ligne, mouvements de bébé, calendrier de grossesse avec agenda .ics et rappels, questionnaire bien-être sans stockage, projet de naissance, checklists, fertilité, prise de poids…"
  - "Une assistante IA dont la base de connaissances est générée depuis les données du site — jamais une réponse écrite à la main — avec des garde-fous santé et un renvoi systématique vers la consultation."
  - "Vrai/Faux à 21 fiches sourcées, « quand consulter » par situation, « sage-femme, pour quoi faire » par âge de la vie, annuaire de sources officielles vérifiées, recherche interne."
  - "Boîte à idées d'articles et recueil d'avis avec modération avant publication (Workers Cloudflare + KV), parce qu'un avis de patiente ne se publie pas sans relecture."
  - "PWA installable qui marche hors-ligne, lecture audio des articles, confort de lecture (taille, contraste), données structurées et sitemap."
  - "Un blog en collections (16 articles) et quatre lettres automatisées par n8n : suivi de grossesse, post-partum, prévention, veille hebdomadaire."
  - "Six Workers Cloudflare autour du site : assistante, idées, avis, lettres, recherche interne, veille."
schema: ["Données du site", "Base de connaissances", "Assistante", "Outils hors-ligne", "Avis modérés", "Lettres n8n"]
preuves:
  - "En ligne et en usage quotidien : le site public est lié ci-dessous."
  - "Une centaine de pages générées, 13 outils, 16 articles, 6 Workers, 6 workflows n8n — comptés dans le dépôt le 19/09/2026."
  - "Tests Playwright sur le site en ligne à chaque lot livré, sur ordinateur et téléphone."
incident:
  titre: "Le site servait une version de retard à chaque déploiement"
  constat: "Après un déploiement, la liste des consultations restait cassée en ligne, alors que le fichier corrigé était bien servi par l'hébergeur — et le lendemain, tout marchait."
  cause: "Le service worker de la PWA servait scripts et styles en stale-while-revalidate : il rendait la version en cache et ne téléchargeait la nouvelle qu'en arrière-plan. Chaque visite voyait le déploiement précédent."
  correctif: "Scripts et styles de même origine passés en network-first, version de cache incrémentée pour purger à l'activation. Et une règle : on vérifie un déploiement en contournant le service worker, jamais à travers lui."
stack: ["Astro", "Cloudflare Pages", "Cloudflare Workers", "KV", "OpenAI", "n8n", "PWA"]
liens:
  - { libelle: "Le site public", url: "https://a-chaque-etape.fr" }
images:
  - { fichier: "accueil.png", alt: "Page d'accueil du site du cabinet : photo plein cadre, titre, boutons de rendez-vous.", legende: "L'accueil — une ressource, pas une plaquette." }
  - { fichier: "contractions.png", alt: "Le compteur de contractions : chronomètre, historique, repère pour contacter la maternité.", legende: "Le compteur de contractions, utilisable hors-ligne, sans compte." }
  - { fichier: "assistante.png", alt: "L'assistante IA ouverte, répondant à une question sur les horaires depuis les données du site.", legende: "L'assistante répond depuis une base de connaissances générée — jamais écrite à la main." }
  - { fichier: "vrai-faux.png", alt: "Cartes Vrai/Faux retournables, avec la source de chaque réponse.", legende: "Vrai ou faux : 21 fiches, chacune sourcée." }
---
