import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { vignettes } from "../src/data/vignettes";

const DOSSIER = join(process.cwd(), "src/content/realisations");

function frontmatter(texte: string): unknown {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) throw new Error("frontmatter absent");
  return parse(m[1]);
}

/** Toutes les URL publiées : les `liens` des trois études de cas, les `url` des vignettes. */
const urls: { url: string; origine: string }[] = [];
for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith(".md"))) {
  const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { liens?: { url: string }[] };
  for (const l of fm.liens ?? []) urls.push({ url: l.url, origine: f });
}
for (const v of vignettes) if (v.url) urls.push({ url: v.url, origine: "vignettes.ts" });

/** Un lien publié doit répondre. HEAD d'abord ; certains serveurs refusent HEAD (405) → GET. */
async function statut(url: string): Promise<number> {
  const o = { redirect: "follow" as const, signal: AbortSignal.timeout(8000) };
  const r = await fetch(url, { method: "HEAD", ...o });
  if (r.status !== 405) return r.status;
  return (await fetch(url, { method: "GET", ...o })).status;
}

describe("les liens publiés", () => {
  it("il y en a au moins un à vérifier", () => {
    expect(urls.length).toBeGreaterThan(0);
  });

  for (const { url, origine } of urls) {
    it(`${url} (${origine}) répond`, { timeout: 30000 }, async () => {
      const code = await statut(url);
      expect(code, `${url} répond ${code}`).toBeLessThan(400);
    });
  }
});
