export type Vignette = { titre: string; texte: string; url?: string };
export const vignettes: Vignette[] = [
  {
    titre: "L'Atelier — images et vidéos générées en local (accès sur invitation)",
    texte: "ComfyUI sur une RTX 3060, exposé en service web. Démarrage à froid et à chaud mesurés, pièges de la vidéo locale documentés (le verbe d'action est obligatoire, la qualité vient de l'image de départ).",
    url: "https://atelier.aelto.fr",
  },
  {
    titre: "Troisième Étage — le site d'un groupe, en 3D temps réel",
    texte: "Un ascenseur en Three.js dont la cabine octogonale pivote pour desservir les salles ; repli CSS 3D sans WebGL ; première vue à 1,54 Mo ; 93 tests unitaires et 116 tests navigateur.",
    url: "https://troisieme-etage-v2.pages.dev",
  },
];
