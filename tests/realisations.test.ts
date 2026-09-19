import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { schemaRealisation } from "../src/lib/schema-realisation";
import { INTERDITS, INTERDITS_HUB, motsInterdits, regleClient } from "../src/lib/verifier-contenu";

const DOSSIER = join(process.cwd(), "src/content/realisations");
const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith(".md"));

function frontmatter(texte: string): unknown {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) throw new Error("frontmatter absent");
  return parse(m[1]);
}

describe("les études de cas", () => {
  it("sont exactement trois", () => {
    expect(fichiers.sort()).toEqual(["hub-sante.md", "pack-btp.md", "studio-moonkura.md"]);
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
  it("la règle « client » tient sur BTP, hub et l'inventaire", () => {
    for (const f of ["pack-btp.md", "hub-sante.md"]) {
      expect(regleClient(readFileSync(join(DOSSIER, f), "utf8")), f).toEqual([]);
    }
  });

  it("les ordres sont 1, 2, 3 sans doublon", () => {
    const ordres = fichiers.map((f) => (frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { ordre: number }).ordre).sort();
    expect(ordres).toEqual([1, 2, 3]);
  });
});

describe("motsInterdits", () => {
  it("est insensible à la casse et rend les mots trouvés", () => {
    expect(motsInterdits("Une réunion à REVEL avec le client.", ["Revel", "client", "Teulat"])).toEqual(["Revel", "client"]);
  });
});
