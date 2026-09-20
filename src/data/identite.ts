export const identite = {
  nom: "Jonathan Dubois",
  titres: ["Ingénieur automatisation IA", "Creative technologist"] as const,
  ligne: "Je construis des systèmes IA qui tournent en production : agents, workflows, applications, génératif.",
  ville: "Toulouse",
  disponibilite: "Disponible en mission ou en poste",
  // Adresse provisoire (spec § 2) ; passera sur le domaine perso avec Email Routing.
  email: "duboisjonathan@orange.fr",
  // LinkedIn vide tant que le compte n'existe pas : le composant Contact n'affiche que les liens renseignés.
  liens: { linkedin: "", github: "https://github.com/jonathan-dubois-dev" },
  descriptionSite:
    "Ingénieur automatisation IA et creative technologist à Toulouse : agents, workflows n8n, applications sur Cloudflare, génératif. Cinq réalisations en production, testées et pesées.",
};
