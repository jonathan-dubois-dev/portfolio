import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const DOSSIER = join(process.cwd(), "src/content/realisations");
const ASSETS = join(process.cwd(), "src/assets/realisations");
const frontmatter = (t: string) => parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(t)![1]) as { images: { fichier: string; alt: string; legende: string }[] };

describe("les images des études", () => {
  for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, ""), fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8"));
    it(`${slug} : au moins deux images, chacune présente, ≤ 400 Ko, avec alt et légende`, () => {
      expect(fm.images.length).toBeGreaterThanOrEqual(2);
      for (const im of fm.images) {
        const p = join(ASSETS, slug, im.fichier);
        expect(existsSync(p), p).toBe(true);
        expect(statSync(p).size, p).toBeLessThanOrEqual(400_000);
        expect(im.alt.length).toBeGreaterThanOrEqual(10);
        expect(im.legende.length).toBeGreaterThanOrEqual(10);
      }
    });
    it(`${slug} : aucun fichier orphelin dans src/assets`, () => {
      const presents = existsSync(join(ASSETS, slug)) ? readdirSync(join(ASSETS, slug)) : [];
      expect(presents.sort()).toEqual(fm.images.map((i) => i.fichier).sort());
    });
  }
});

describe("le portrait", () => {
  it("existe en 800 px, sous 150 Ko", () => {
    const p = join(process.cwd(), "src/assets/portrait.jpg");
    expect(existsSync(p), p).toBe(true);
    expect(statSync(p).size).toBeLessThanOrEqual(150_000);
  });
});
