import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { schemaRealisation } from "../src/lib/schema-realisation";
import { INTERDITS, INTERDITS_HUB, motsInterdits, regleClient, regleProduction } from "../src/lib/verifier-contenu";
import { comptes } from "../src/data/automatisations";
import { identite } from "../src/data/identite";
import { frontmatter } from "./lib/frontmatter";

const DOSSIER = join(process.cwd(), "src/content/realisations");
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md"));

/** Le scan de `src/` promis par le README : les cinq études, plus les données et le hero qui
 *  peuvent porter un mot interdit ou un « client » mal tourné (spec § 6, brief I2). */
const FICHIERS_DONNEES_SCANNES = [
  "src/data/identite.ts",
  "src/data/chiffres.json",
  "src/data/stack.ts",
  "src/data/automatisations.ts",
  "src/scripts/flux-geometrie.ts",
].map((chemin) => ({ chemin, texte: readFileSync(join(process.cwd(), chemin), "utf8") }));

describe("les études de cas", () => {
  it("sont exactement cinq", () => {
    expect(fichiers.sort()).toEqual([
      "hub-sante.md",
      "pack-btp.md",
      "pack-therapeutes.md",
      "site-sages-femmes.md",
      "studio-moonkura.md",
    ]);
  });

  for (const f of fichiers) {
    const texte = readFileSync(join(DOSSIER, f), "utf8");
    it(`${f} respecte le schéma`, () => {
      const r = schemaRealisation.safeParse(frontmatter(texte));
      expect(r.success, JSON.stringify(r.success ? null : r.error.issues, null, 1)).toBe(true);
    });
    it(`${f} ne contient aucun mot interdit`, () => {
      expect(motsInterdits(texte, INTERDITS)).toEqual([]);
    });
  }

  it("le hub ne parle jamais de client ni de signature", () => {
    const texte = readFileSync(join(DOSSIER, "hub-sante.md"), "utf8");
    expect(motsInterdits(texte, INTERDITS_HUB)).toEqual([]);
  });

  it("chaque étude porte un statut et une ligne de statut", () => {
    for (const f of fichiers) {
      const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statut: string; statutLigne?: string; badge?: string };
      expect(["usage", "demo", "demonstrateur"], f).toContain(fm.statut);
      expect(fm.statutLigne?.length ?? 0, f).toBeGreaterThanOrEqual(20);
      expect(fm.badge, `${f} : badge est dérivé, plus écrit`).toBeUndefined();
    }
  });
  it("le hub est un démonstrateur, le studio est en usage, le BTP une démo", () => {
    const statut = (f: string) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statut: string }).statut;
    expect(statut("hub-sante.md")).toBe("demonstrateur");
    expect(statut("studio-moonkura.md")).toBe("usage");
    expect(statut("pack-btp.md")).toBe("demo");
  });

  it("la règle « client » tient sur les cinq études", () => {
    for (const f of fichiers) {
      expect(regleClient(readFileSync(join(DOSSIER, f), "utf8")), f).toEqual([]);
    }
  });

  it("« production » n'apparaît que dans les études en usage", () => {
    for (const f of fichiers) {
      const texte = readFileSync(join(DOSSIER, f), "utf8");
      const fm = frontmatter(texte) as { statut: string };
      if (fm.statut !== "usage") expect(regleProduction(texte), f).toEqual([]);
    }
  });
  it("le studio et le site sages-femmes se disent en production", () => {
    for (const f of ["studio-moonkura.md", "site-sages-femmes.md"]) {
      const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { statutLigne: string };
      expect(fm.statutLigne, f).toMatch(/en production/i);
    }
  });

  it("les ordres sont 1, 2, 3, 4, 5 sans doublon", () => {
    const ordres = fichiers.map((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { ordre: number }).ordre).sort();
    expect(ordres).toEqual([1, 2, 3, 4, 5]);
  });

  it("le nombre annoncé dans le titre du pack BTP est celui de l'inventaire", () => {
    const fm = frontmatter(readFileSync(join(DOSSIER, "pack-btp.md"), "utf8")) as { titre: string };
    expect(fm.titre).toContain(`${comptes().parMetier.btp} workflows`);
  });

  it("le nombre annoncé dans le titre du pack thérapeutes est celui de l'inventaire", () => {
    const fm = frontmatter(readFileSync(join(DOSSIER, "pack-therapeutes.md"), "utf8")) as { titre: string };
    expect(fm.titre).toContain(`${comptes().parMetier.therapeutes} workflows`);
  });

  it("le nombre de workflows sages-femmes annoncé dans les preuves est celui de l'inventaire", () => {
    const fm = frontmatter(readFileSync(join(DOSSIER, "site-sages-femmes.md"), "utf8")) as { preuves: string[] };
    expect(fm.preuves.join(" ")).toContain(`${comptes().parMetier.sagesfemmes} workflows n8n`);
  });
});

describe("motsInterdits", () => {
  it("est insensible à la casse et rend les mots trouvés", () => {
    expect(motsInterdits("Une réunion à REVEL avec le client.", ["Revel", "client", "Teulat"])).toEqual(["Revel", "client"]);
  });
});

describe("la description du site est honnête", () => {
  it("ne prétend jamais qu'un pack de démonstration est « en production »", () => {
    expect(regleProduction(identite.descriptionSite)).toEqual([]);
  });
});

describe("la règle « client » et les mots interdits couvrent aussi les données et le hero", () => {
  for (const { chemin, texte } of FICHIERS_DONNEES_SCANNES) {
    it(`${chemin} ne contient aucun mot interdit`, () => {
      expect(motsInterdits(texte, INTERDITS), chemin).toEqual([]);
    });
    it(`${chemin} respecte la règle client`, () => {
      expect(regleClient(texte), chemin).toEqual([]);
    });
  }
});
