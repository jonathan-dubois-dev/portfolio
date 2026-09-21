import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { schemaAussi } from "../src/lib/schema-aussi";
import { INTERDITS, PERSONAS, motsInterdits, regleClient, regleProduction } from "../src/lib/verifier-contenu";
import { frontmatter } from "./lib/frontmatter";

const DOSSIER = join(process.cwd(), "src/content/aussi");
const ASSETS = join(process.cwd(), "src/assets/aussi");
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md")).sort();
type Carte = { statut: string; ordre: number; image: { fichier: string; alt: string }; lien?: { url: string; libelle: string } };

describe("les cartes « Aussi construit »", () => {
  it("sont exactement sept", () => {
    expect(fichiers).toEqual(["console.md", "demo-immo.md", "lab-effets.md", "pubs-3d.md", "superviseur.md", "troisieme-etage.md", "watermark.md"]);
  });
  for (const f of fichiers) {
    const slug = f.replace(/\.md$/, ""), texte = readFileSync(join(DOSSIER, f), "utf8"), fm = frontmatter(texte) as Carte;
    it(`${f} respecte le schéma`, () => {
      const r = schemaAussi.safeParse(fm);
      expect(r.success, JSON.stringify(r.success ? null : r.error.issues, null, 1)).toBe(true);
    });
    it(`${f} : aucun mot interdit, aucune persona, règle client, jamais « production »`, () => {
      expect(motsInterdits(texte, [...INTERDITS, ...PERSONAS])).toEqual([]);
      expect(regleClient(texte)).toEqual([]);
      expect(regleProduction(texte)).toEqual([]);
    });
    it(`${f} : son image existe, ≤ 400 Ko, seule dans son dossier`, () => {
      const p = join(ASSETS, slug, fm.image.fichier);
      expect(existsSync(p), p).toBe(true);
      expect(statSync(p).size).toBeLessThanOrEqual(400_000);
      expect(readdirSync(join(ASSETS, slug))).toEqual([fm.image.fichier]);
    });
  }
  it("les ordres sont 1..7 sans doublon", () => {
    const ordres = fichiers.map((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as Carte).ordre).sort((a, b) => a - b);
    expect(ordres).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it("exactement deux cartes sont arrêtées : la démo immo et le watermark", () => {
    const arretees = fichiers.filter((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as Carte).statut === "arrete");
    expect(arretees).toEqual(["demo-immo.md", "watermark.md"]);
  });
  it("aucun dossier d'assets sans carte", () => {
    expect(readdirSync(ASSETS).sort()).toEqual(fichiers.map((f) => f.replace(/\.md$/, "")));
  });
});
