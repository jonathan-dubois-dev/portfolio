import type { Statut } from "../lib/verifier-contenu";

export type Metier = "btp" | "therapeutes" | "immo" | "sagesfemmes" | "hub" | "interne";
export type Declencheur = "cron" | "webhook" | "telegram" | "formulaire" | "cockpit" | "sous-workflow";
export type Automatisation = { id: string; nom: string; metier: Metier; declencheur: Declencheur; action: string; actif: boolean };

/** Le statut d'une ligne dérive de son métier : on ne l'écrit jamais ligne par ligne. */
export const METIERS: Record<Metier, { titre: string; statut: Statut; ordre: number }> = {
  btp: { titre: "Bâtiment — le pack artisan", statut: "demo", ordre: 1 },
  therapeutes: { titre: "Thérapeutes — le pack cabinet", statut: "demo", ordre: 2 },
  immo: { titre: "Immobilier — l'agent terrain", statut: "demo", ordre: 3 },
  sagesfemmes: { titre: "Sages-femmes — le site et ses lettres", statut: "usage", ordre: 4 },
  hub: { titre: "Maison de santé — le hub", statut: "demonstrateur", ordre: 5 },
  interne: { titre: "Outillage interne", statut: "usage", ordre: 6 },
};

/** 100 workflows n8n, relevés par l'API le 19/09/2026 ; noms réécrits (sans préfixe, sans persona). */
export const automatisations: Automatisation[] = [
  // --- btp (29) ---
  { id: "VPE9l7koecmNMvms", nom: "Estimation IA d'une demande", metier: "btp", declencheur: "webhook", action: "Lit le catalogue, fait chiffrer une fourchette par le modèle, applique quatre garde-fous, répond au formulaire.", actif: true },
  { id: "TX0FD1OtHbpFX5u8", nom: "Réception du verdict et e-mail", metier: "btp", declencheur: "telegram", action: "Reçoit la décision de l'artisan, route les boutons Telegram, envoie l'e-mail nominatif au demandeur.", actif: true },
  { id: "hLAxEO2s9dUKNqTV", nom: "Annulation d'une visite", metier: "btp", declencheur: "webhook", action: "Le demandeur annule sa visite via un lien reçu par e-mail ; le créneau est libéré et l'artisan prévenu.", actif: true },
  { id: "n9E3NtPGpd8LN9lm", nom: "Confirmation de visite par Telegram", metier: "btp", declencheur: "telegram", action: "Relaie la confirmation du demandeur à l'artisan sur Telegram et met à jour le rendez-vous.", actif: true },
  { id: "6kmFjilFcNHTyfV5", nom: "Lancement du chantier", metier: "btp", declencheur: "telegram", action: "L'artisan démarre le chantier d'un bouton Telegram ; le statut et les dates sont mis à jour.", actif: true },
  { id: "a7A0UUxUpXOKXHro", nom: "Clôture de chantier", metier: "btp", declencheur: "cockpit", action: "Depuis le cockpit, l'artisan marque un chantier terminé et déclenche la suite du parcours.", actif: true },
  { id: "t1vRbg4ZZie2NSKx", nom: "Simulation d'avis Google", metier: "btp", declencheur: "webhook", action: "Simule la réception d'un avis Google pour tester le parcours de démonstration.", actif: true },
  { id: "m5j4ivmLMC6nQ0qC", nom: "Menu Telegram de l'artisan", metier: "btp", declencheur: "telegram", action: "Affiche le menu de commandes Telegram avec les actions disponibles pour l'artisan.", actif: true },
  { id: "H5AiAVMr1jFp0hxw", nom: "Confirmation de la visite", metier: "btp", declencheur: "webhook", action: "Enregistre la confirmation de la visite et met à jour le planning de l'artisan.", actif: true },
  { id: "JRW05XJRLmowhoxI", nom: "Pré-estimation manuelle", metier: "btp", declencheur: "webhook", action: "Chiffre une pré-estimation à partir d'une demande saisie à la main, hors formulaire standard.", actif: true },
  { id: "yS7fUP646TYv6p8t", nom: "Présentation du verdict à l'artisan", metier: "btp", declencheur: "telegram", action: "Envoie l'estimation à l'artisan sur Telegram avec les boutons de décision : accepter, ajuster, refuser.", actif: true },
  { id: "2NR3eW31fL7xq7MS", nom: "SMS entrant routé vers Telegram", metier: "btp", declencheur: "webhook", action: "Relaie un SMS reçu du demandeur vers Telegram pour une réponse manuelle de l'artisan.", actif: false },
  { id: "5i6jUXwHvyqmJNmN", nom: "Relance de devis", metier: "btp", declencheur: "cockpit", action: "Depuis le cockpit, l'artisan relance un devis resté sans réponse.", actif: true },
  { id: "ln235pqSOOU9ybbS", nom: "Rappel hebdomadaire des relances", metier: "btp", declencheur: "cron", action: "Chaque semaine, liste les relances dues et les envoie à l'artisan sur Telegram.", actif: true },
  { id: "PrttffsZ3tq5PWDZ", nom: "Bascule des factures en retard", metier: "btp", declencheur: "webhook", action: "Détecte les factures impayées arrivées à échéance et alerte l'artisan.", actif: true },
  { id: "02BO0kw7lGSY36MJ", nom: "Demande d'avis Google", metier: "btp", declencheur: "cockpit", action: "Un bouton du cockpit déclenche l'envoi d'une demande d'avis Google au demandeur.", actif: true },
  { id: "8NbAMwmfqQvk8iUf", nom: "Réponse vocale d'accueil", metier: "btp", declencheur: "webhook", action: "Décroche l'appel entrant et diffuse le message d'accueil vocal de l'artisan.", actif: false },
  { id: "DHJtiDhsWsfF6WSD", nom: "Validation de la visite par l'artisan", metier: "btp", declencheur: "telegram", action: "L'artisan valide la visite proposée depuis Telegram et le rendez-vous est confirmé.", actif: true },
  { id: "6TB6hWC85P2E3DIR", nom: "Agent terrain de l'artisan", metier: "btp", declencheur: "webhook", action: "Assistant conversationnel qui renseigne l'artisan sur ses chantiers et rendez-vous en cours.", actif: true },
  { id: "V6Kq92NE26CXZmyQ", nom: "Planification de la visite", metier: "btp", declencheur: "webhook", action: "À partir d'une demande qualifiée, propose un créneau de visite et le programme.", actif: true },
  { id: "bWrPvETmwlWkQJ2Z", nom: "Demande d'avis après chantier", metier: "btp", declencheur: "webhook", action: "Sollicite un avis Google auprès du demandeur une fois le chantier terminé.", actif: true },
  { id: "49RpNe8dffjs2LZ8", nom: "Envoi du devis", metier: "btp", declencheur: "webhook", action: "Génère le devis et l'envoie au demandeur avec un lien d'acceptation en ligne.", actif: true },
  { id: "qbkim3p0Cqzim9XS", nom: "Envoi de la facture", metier: "btp", declencheur: "webhook", action: "Génère la facture finale et l'envoie au demandeur après réception du chantier.", actif: true },
  { id: "mVUJ6zOZQMziF1W4", nom: "Relance de facture impayée", metier: "btp", declencheur: "cockpit", action: "Depuis le cockpit, l'artisan relance une facture restée impayée après échéance.", actif: true },
  { id: "M2fb8LuCGE9CHwiw", nom: "Acceptation du devis", metier: "btp", declencheur: "webhook", action: "Le demandeur accepte le devis via un lien ; le chantier passe au statut accepté.", actif: true },
  { id: "LULtEMZ1y1sJknjS", nom: "Alimentation quotidienne du cockpit", metier: "btp", declencheur: "cron", action: "Chaque jour, recalcule les indicateurs et les statuts affichés dans le cockpit de l'artisan.", actif: true },
  { id: "u5OW14qaSmihPf1s", nom: "Message manqué transcrit", metier: "btp", declencheur: "webhook", action: "Transcrit l'appel manqué, envoie un SMS de rappel et alerte l'artisan sur Telegram.", actif: false },
  { id: "scl2ar53p4Ffw6oR", nom: "Demande de démonstration", metier: "btp", declencheur: "cockpit", action: "Depuis le cockpit, planifie un test du pack pour un prospect intéressé.", actif: true },
  { id: "1TALYtQzodiUdDIy", nom: "Briefing matinal de l'artisan", metier: "btp", declencheur: "cron", action: "Chaque matin, envoie à l'artisan le résumé Telegram des visites et relances du jour.", actif: true },

  // --- therapeutes (37) ---
  { id: "7vphGP54wGCAEJM3", nom: "Routeur de validation Telegram", metier: "therapeutes", declencheur: "telegram", action: "Cinquante-six nœuds : chaque bouton de la praticienne déclenche la bonne branche et confirme in-app.", actif: true },
  { id: "PN1vKhDBUXnustFA", nom: "Report de rendez-vous en libre-service", metier: "therapeutes", declencheur: "cron", action: "Le patient reporte lui-même son rendez-vous jusqu'à la veille, sans repasser par la praticienne.", actif: true },
  { id: "P5cLvqxqUOooxKNX", nom: "Confirmation d'un créneau libéré", metier: "therapeutes", declencheur: "webhook", action: "Confirme au patient concerné qu'un créneau vient de se libérer dans l'agenda.", actif: true },
  { id: "ML5CQ0kKhfXa60h0", nom: "Mot d'anniversaire", metier: "therapeutes", declencheur: "webhook", action: "Envoie un petit message d'anniversaire personnalisé à chaque patient, le jour J.", actif: true },
  { id: "IsRPMweVDDCR7Nqh", nom: "Briefing matinal de la praticienne", metier: "therapeutes", declencheur: "cron", action: "Chaque matin, envoie à la praticienne le résumé des rendez-vous et relances du jour.", actif: true },
  { id: "YLtcysOWHnzAEezc", nom: "Annulation d'un rendez-vous", metier: "therapeutes", declencheur: "webhook", action: "Traite l'annulation d'un rendez-vous par le patient et libère le créneau dans l'agenda.", actif: true },
  { id: "0C4h7dG69gbRqsBo", nom: "Agent terrain de la praticienne", metier: "therapeutes", declencheur: "webhook", action: "Assistant conversationnel qui renseigne la praticienne sur son planning et ses patients.", actif: true },
  { id: "kI7FypCBcOiADVEO", nom: "Debrief du soir après consultation", metier: "therapeutes", declencheur: "cron", action: "Chaque soir, récapitule pour la praticienne les rendez-vous tenus dans la journée.", actif: true },
  { id: "n1xAx2ZqHGV4Vryx", nom: "Créneau de dernière minute", metier: "therapeutes", declencheur: "webhook", action: "Propose un créneau resté libre aux patients en liste d'attente, avec réponse express.", actif: true },
  { id: "VJrHWH3ZGmmwAOMR", nom: "Bilan mensuel du cabinet", metier: "therapeutes", declencheur: "cron", action: "Chaque mois, envoie par e-mail un bilan d'activité à la praticienne.", actif: true },
  { id: "Cc0Xs4sr7h6vyi4y", nom: "Réception d'un avis de satisfaction", metier: "therapeutes", declencheur: "webhook", action: "Enregistre l'avis laissé par un patient et le transmet à la praticienne.", actif: true },
  { id: "rnd3eKDwpk4Gf1X0", nom: "Détection d'un patient silencieux", metier: "therapeutes", declencheur: "cron", action: "Repère un patient sans nouvelle depuis longtemps et propose une relance à la praticienne.", actif: true },
  { id: "ldpJ3WHCFztz7Elb", nom: "Demande entrante d'un prospect", metier: "therapeutes", declencheur: "formulaire", action: "Reçoit une demande de premier contact et la qualifie avant transmission à la praticienne.", actif: true },
  { id: "j0TqxoFPxtc9D6cK", nom: "Mise à jour Notion des dossiers", metier: "therapeutes", declencheur: "sous-workflow", action: "Sous-workflow qui synchronise dans Notion les patients, rendez-vous et liste d'attente.", actif: false },
  { id: "MfZOr8VmUqxWefJN", nom: "Relance douce", metier: "therapeutes", declencheur: "cockpit", action: "Depuis le cockpit, la praticienne déclenche une relance douce vers un patient inactif.", actif: true },
  { id: "6D7s3m9Z6iB92BrK", nom: "Préparation du patient avant RDV", metier: "therapeutes", declencheur: "webhook", action: "Envoie au patient les informations utiles à préparer avant son rendez-vous.", actif: true },
  { id: "y5VtS6fblDNfIm7Q", nom: "Envoi d'une note d'honoraires", metier: "therapeutes", declencheur: "cockpit", action: "Depuis le cockpit, génère et envoie la note d'honoraires au patient concerné.", actif: true },
  { id: "1YDoIjea7YuMe6kZ", nom: "Demande d'avis après consultation", metier: "therapeutes", declencheur: "webhook", action: "Sollicite un avis auprès du patient quelques jours après sa consultation.", actif: true },
  { id: "POiYCDFe8qOMSD0Q", nom: "Envoi du plan de soins", metier: "therapeutes", declencheur: "webhook", action: "Transmet au patient le plan de soins établi par la praticienne.", actif: true },
  { id: "fYz5HIZFXvLjUEhG", nom: "Demande d'acompte", metier: "therapeutes", declencheur: "webhook", action: "Envoie une demande d'acompte au patient de démonstration avant la consultation.", actif: true },
  { id: "QSesHfg8dyZnKpOt", nom: "Récapitulatif quotidien", metier: "therapeutes", declencheur: "cron", action: "Chaque jour, envoie par e-mail à la praticienne le récapitulatif de son activité.", actif: true },
  { id: "ZQowm1OuVTwfbSy5", nom: "Invitation au parrainage", metier: "therapeutes", declencheur: "webhook", action: "Invite un patient satisfait à parrainer un proche auprès de la praticienne.", actif: true },
  { id: "qFSCb8rB2lw7D5wl", nom: "Invitation à remplir l'anamnèse", metier: "therapeutes", declencheur: "cockpit", action: "Depuis le cockpit, envoie au patient le lien du formulaire d'anamnèse à remplir.", actif: true },
  { id: "pLGP0mJs90Nf2BE1", nom: "Confirmation depuis la liste d'attente", metier: "therapeutes", declencheur: "webhook", action: "Confirme à une personne en liste d'attente la place qui vient de se libérer chez la praticienne.", actif: true },
  { id: "6C0FjsjjnIl0MHW3", nom: "Créneau libéré", metier: "therapeutes", declencheur: "webhook", action: "Détecte un créneau qui se libère dans l'agenda et lance la procédure de réattribution.", actif: true },
  { id: "u6TL91zvPFDOrb4D", nom: "Réception du formulaire d'anamnèse", metier: "therapeutes", declencheur: "formulaire", action: "Reçoit le formulaire d'anamnèse rempli par le patient et le transmet à la praticienne.", actif: true },
  { id: "ICmb4rliNsdvagWc", nom: "Réception d'un acompte", metier: "therapeutes", declencheur: "webhook", action: "Enregistre la réception d'un acompte versé par le patient de démonstration.", actif: true },
  { id: "dCfKu8C1GJ4UNShs", nom: "Détection d'absence de la praticienne", metier: "therapeutes", declencheur: "cron", action: "Détecte une absence programmée de la praticienne et prépare un report pour les patients concernés.", actif: true },
  { id: "eQnfA8r2YfDb3VHq", nom: "Inscription en liste d'attente", metier: "therapeutes", declencheur: "formulaire", action: "Inscrit un prospect en liste d'attente via un formulaire et confirme sa position.", actif: true },
  { id: "BS7B4Km7HzPmYx1B", nom: "Alimentation quotidienne du CRM", metier: "therapeutes", declencheur: "cron", action: "Chaque jour, alimente le CRM avec de nouvelles demandes et des données de test.", actif: true },
  { id: "7kwM2WuHCdpHDgf9", nom: "Relance après rendez-vous manqué", metier: "therapeutes", declencheur: "webhook", action: "Propose un nouveau créneau au patient qui ne s'est pas présenté à son rendez-vous.", actif: true },
  { id: "6vFwkeV7DUknihGP", nom: "Rappel de rendez-vous la veille", metier: "therapeutes", declencheur: "cron", action: "Envoie un rappel au patient la veille de son rendez-vous.", actif: true },
  { id: "IwX3K3mJGo7TtzYC", nom: "Filleul inscrit via parrainage", metier: "therapeutes", declencheur: "webhook", action: "Confirme l'inscription d'un filleul arrivé par le programme de parrainage.", actif: true },
  { id: "PZYPl4cX4EI1o5Md", nom: "Relance d'impayés", metier: "therapeutes", declencheur: "webhook", action: "Envoie une relance au patient dont le paiement d'une consultation reste en attente.", actif: true },
  { id: "cZDNW94IoZYGI622", nom: "Demande d'avis Google", metier: "therapeutes", declencheur: "cockpit", action: "Depuis le cockpit, la praticienne déclenche une demande d'avis Google auprès d'un patient.", actif: true },
  { id: "cW0hkRylH0O8Yks0", nom: "Traitement d'une absence de la praticienne", metier: "therapeutes", declencheur: "webhook", action: "Prévient par e-mail les patients concernés et propose un report de rendez-vous.", actif: true },
  { id: "DpzF4RvaoTwaQkFm", nom: "Détection d'impayés", metier: "therapeutes", declencheur: "cron", action: "Repère les paiements de consultation en retard et prépare la relance.", actif: true },

  // --- immo (12) ---
  { id: "OLNsxm5Z0utGm7NP", nom: "Réception et qualification d'un lead", metier: "immo", declencheur: "webhook", action: "Crée le contact, qualifie la demande, prévient l'agent sur Telegram.", actif: true },
  { id: "0am3O4dCjca8j8E5", nom: "Rappel de visite la veille", metier: "immo", declencheur: "cron", action: "Envoie au prospect un rappel de sa visite programmée le lendemain.", actif: true },
  { id: "dNl8bMe0mNfXGwhC", nom: "Routeur des réponses Telegram", metier: "immo", declencheur: "telegram", action: "Reçoit les réponses de l'agent sur Telegram et déclenche la bonne branche de traitement.", actif: true },
  { id: "5jnS7YVhTgcIbat2", nom: "Alerte automatique de bien", metier: "immo", declencheur: "webhook", action: "Détecte un bien correspondant aux critères d'un prospect et lui envoie une alerte.", actif: true },
  { id: "lLVYnxnIyc8Xxq6s", nom: "Suivi après visite", metier: "immo", declencheur: "webhook", action: "Envoie un message de suivi au prospect quelques jours après sa visite d'un bien.", actif: true },
  { id: "W0Wn6ak3vMuvvi4j", nom: "Newsletter mensuelle", metier: "immo", declencheur: "cron", action: "Chaque mois, envoie la newsletter de biens et conseils aux prospects inscrits.", actif: true },
  { id: "uBbpvR8erBM15EN5", nom: "Suivi des e-mails entrants", metier: "immo", declencheur: "webhook", action: "Qualifie chaque e-mail entrant d'un prospect et le route vers l'agent concerné.", actif: true },
  { id: "3iXNneECZbaS7LhH", nom: "Relances automatiques programmées", metier: "immo", declencheur: "cron", action: "Relance un prospect à trois, sept puis quatorze jours s'il reste sans réponse.", actif: true },
  { id: "Drnif1KsbmeD1vYC", nom: "Nouveau bien ou mandat", metier: "immo", declencheur: "webhook", action: "Enregistre un nouveau bien ou mandat et prévient l'agent en charge du secteur.", actif: true },
  { id: "pSpn46cSYLOx2ysu", nom: "Agent terrain immobilier", metier: "immo", declencheur: "webhook", action: "Assistant conversationnel qui renseigne l'agent sur ses biens, mandats et visites en cours.", actif: true },
  { id: "rGMhlCmJtNXZ5CmQ", nom: "Confirmation de visite", metier: "immo", declencheur: "webhook", action: "Enregistre la confirmation d'une visite par le prospect et met à jour l'agenda.", actif: true },
  { id: "mjIat4MjtSYdxl7o", nom: "E-mails saisonniers", metier: "immo", declencheur: "webhook", action: "Envoie aux prospects des e-mails thématiques selon la saison immobilière en cours.", actif: true },

  // --- sagesfemmes (6) ---
  { id: "jmHjMNB2OyJVBu7q", nom: "Suivi post-partum hebdomadaire", metier: "sagesfemmes", declencheur: "cron", action: "Envoie chaque semaine la lettre adaptée à la date d'accouchement déclarée.", actif: true },
  { id: "FKb0qnCd7FWPChuK", nom: "Veille hebdomadaire de ressources", metier: "sagesfemmes", declencheur: "cron", action: "Chaque semaine, repère des ressources fiables sur la grossesse et le post-partum à partager.", actif: true },
  { id: "TqcKt76bDSxqFCwI", nom: "Conseils de prévention mensuels", metier: "sagesfemmes", declencheur: "cron", action: "Chaque mois, envoie un conseil de prévention adapté à l'étape de la grossesse.", actif: true },
  { id: "iWNZsGShXSy3od6a", nom: "Relais des e-mails transactionnels", metier: "sagesfemmes", declencheur: "sous-workflow", action: "Sous-workflow qui envoie tous les e-mails transactionnels du site pour les autres automatisations.", actif: true },
  { id: "itDieFBGjr2Lu48L", nom: "Newsletter de suivi de grossesse", metier: "sagesfemmes", declencheur: "cron", action: "Chaque semaine, envoie une newsletter adaptée à l'avancement de la grossesse.", actif: true },
  { id: "Ts0F2VwVD24SI9Yl", nom: "Envoi de la veille par e-mail", metier: "sagesfemmes", declencheur: "cron", action: "Chaque semaine, transforme la veille repérée en e-mail et l'envoie aux abonnées.", actif: true },

  // --- hub (5) ---
  { id: "10N7Io4HqeogUkRA", nom: "Entretien nocturne du hub", metier: "hub", declencheur: "cron", action: "Chaque nuit, purge les données temporaires et nettoie les sessions expirées du hub.", actif: true },
  { id: "pDQsPeFLJ6jg5sXr", nom: "Digest du lundi", metier: "hub", declencheur: "cron", action: "Chaque lundi matin, envoie aux praticiens un résumé des annonces et documents de la semaine.", actif: true },
  { id: "uGygK2Y5wcOl7SMO", nom: "Sauvegarde nocturne", metier: "hub", declencheur: "cron", action: "Chaque nuit, sauvegarde les données du hub sur R2, hors transcriptions de réunion.", actif: true },
  { id: "0vWAapMrVDmSilyP", nom: "Relais des e-mails du hub", metier: "hub", declencheur: "sous-workflow", action: "Sous-workflow qui envoie tous les e-mails du hub pour le compte des autres automatisations.", actif: true },
  { id: "vT5HnzXaU6bCdiTs", nom: "Rappels quotidiens", metier: "hub", declencheur: "cron", action: "Chaque jour, envoie aux praticiens les rappels de réunion et de commande en cours.", actif: true },

  // --- interne (11) ---
  { id: "CKygNi1uzQRwyjAf", nom: "Sentinelle d'erreurs", metier: "interne", declencheur: "sous-workflow", action: "Attrape toute erreur d'un workflow et l'envoie en alerte temps réel.", actif: true },
  { id: "R32J5nLj6hc2qB0H", nom: "Digest IA quotidien", metier: "interne", declencheur: "cron", action: "Chaque jour, génère un résumé audio de l'actualité choisie et l'envoie par e-mail.", actif: false },
  { id: "ogBwErcxpDCizFDb", nom: "Rappel demandé depuis le site", metier: "interne", declencheur: "formulaire", action: "Reçoit une demande de rappel depuis le formulaire du site et prévient l'opérateur.", actif: true },
  { id: "aqjrEe8zshI3KZ7q", nom: "Validations diverses", metier: "interne", declencheur: "webhook", action: "Point d'entrée générique qui reçoit et route les validations manuelles ponctuelles.", actif: true },
  { id: "rWPQFoRALm7gsG8r", nom: "Réception d'une demande de devis", metier: "interne", declencheur: "formulaire", action: "Reçoit le formulaire de demande de devis du site et le route vers le bon pack.", actif: true },
  { id: "cU70z4cT5esxmVoB", nom: "Rappel d'un prospect", metier: "interne", declencheur: "webhook", action: "Reçoit une demande de rappel déposée sur aelto.fr et notifie l'opérateur.", actif: true },
  { id: "JfhlVJTF05zT7NJx", nom: "Envoi d'e-mail manuel", metier: "interne", declencheur: "webhook", action: "Outil déclenché à la main pour envoyer un e-mail ponctuel depuis un agent.", actif: false },
  { id: "0FzTNdVJLSfaoGcz", nom: "Veille agent cloud vers Telegram", metier: "interne", declencheur: "webhook", action: "Relaie vers Telegram les notifications d'un agent cloud en cours d'exécution.", actif: false },
  { id: "2e3VzCLoLyjWADRk", nom: "Opérations Notion mutualisées", metier: "interne", declencheur: "sous-workflow", action: "Sous-workflow qui centralise les écritures Notion utilisées par plusieurs automatisations.", actif: true },
  { id: "DaE0VFrOjHciiJzQ", nom: "Envoi de devis depuis le cockpit", metier: "interne", declencheur: "cockpit", action: "Depuis le cockpit, génère et envoie un devis pour une demande qualifiée.", actif: true },
  { id: "CXfyB6R0p3RGg2lh", nom: "Note d'appel de prospection (guide)", metier: "interne", declencheur: "webhook", action: "Structure la note prise pendant un appel de prospection à l'aide d'un guide.", actif: true },
];

export function parMetier(): Record<Metier, Automatisation[]> {
  const g = { btp: [], therapeutes: [], immo: [], sagesfemmes: [], hub: [], interne: [] } as Record<Metier, Automatisation[]>;
  for (const a of automatisations) g[a.metier].push(a);
  return g;
}

export function comptes() {
  const g = parMetier();
  return {
    total: automatisations.length,
    actifs: automatisations.filter((a) => a.actif).length,
    parMetier: Object.fromEntries(Object.entries(g).map(([m, l]) => [m, l.length])) as Record<Metier, number>,
  };
}
