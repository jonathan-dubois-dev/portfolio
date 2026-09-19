import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const DOSSIER = "public/fonts";

function fichiersWoff2() {
  return readdirSync(DOSSIER).filter((f) => f.endsWith(".woff2"));
}

function sha256(chemin: string) {
  return createHash("sha256").update(readFileSync(chemin)).digest("hex");
}

describe("public/fonts/*.woff2", () => {
  it("aucun doublon d'empreinte : deux fichiers ne partagent jamais les mêmes octets", () => {
    const fichiers = fichiersWoff2();
    const empreintes = new Map<string, string>();
    for (const f of fichiers) {
      const h = sha256(`${DOSSIER}/${f}`);
      const existant = empreintes.get(h);
      expect(existant, `${f} a la même empreinte sha256 que ${existant}`).toBeUndefined();
      empreintes.set(h, f);
    }
  });

  it("src/styles/polices.css référence exactement les fichiers présents dans public/fonts/, aucun autre", () => {
    const fichiers = fichiersWoff2();
    const css = readFileSync("src/styles/polices.css", "utf8");
    const referencees = [...css.matchAll(/url\('\/fonts\/([^']+\.woff2)'\)/g)].map((m) => m[1]);

    for (const f of fichiers) expect(referencees, `${f} absent de polices.css`).toContain(f);
    for (const r of referencees) expect(fichiers, `${r} référencé mais absent de public/fonts/`).toContain(r);
  });
});
