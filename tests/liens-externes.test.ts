import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { vignettes } from "../src/data/vignettes";
import { LIENS_SUR_INVITATION } from "../src/data/liens-sur-invitation";

const DOSSIER = join(process.cwd(), "src/content/realisations");

function frontmatter(texte: string): unknown {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte);
  if (!m) throw new Error("frontmatter absent");
  return parse(m[1]);
}

/** Toutes les URL publiées : les `liens` des cinq études de cas, les `url` des vignettes — avec le texte qui les annonce. */
const urls: { url: string; origine: string; texte: string }[] = [];
for (const f of readdirSync(DOSSIER).filter((n) => n.endsWith(".md"))) {
  const fm = frontmatter(readFileSync(join(DOSSIER, f), "utf8")) as { liens?: { url: string; libelle: string }[] };
  for (const l of fm.liens ?? []) urls.push({ url: l.url, origine: f, texte: l.libelle });
}
for (const v of vignettes) if (v.url) urls.push({ url: v.url, origine: "vignettes.ts", texte: v.titre });

const originesSurInvitation = new Set(LIENS_SUR_INVITATION.map((u) => new URL(u).origin));

/** Un lien publié doit répondre, à sa propre origine. HEAD d'abord ; certains serveurs refusent HEAD (405) → GET. */
async function statut(url: string): Promise<{ code: number; origineFinale: string }> {
  const o = { redirect: "follow" as const, signal: AbortSignal.timeout(8000) };
  let r = await fetch(url, { method: "HEAD", ...o });
  if (r.status === 405) r = await fetch(url, { method: "GET", ...o });
  return { code: r.status, origineFinale: new URL(r.url).origin };
}

describe("les liens publiés", () => {
  it("il y en a au moins un à vérifier", () => {
    expect(urls.length).toBeGreaterThan(0);
  });

  for (const { url, origine } of urls) {
    const origineAttendue = new URL(url).origin;
    const surInvitation = originesSurInvitation.has(origineAttendue);
    it(`${url} (${origine}) répond${surInvitation ? " (accès sur invitation)" : ""}`, { timeout: 30000 }, async () => {
      const { code, origineFinale } = await statut(url);
      if (surInvitation) {
        // Un mur de connexion (login, 401/403) est acceptable ici : le lien doit juste répondre.
        expect(code, `${url} répond ${code}`).toBeLessThan(500);
      } else {
        expect(code, `${url} répond ${code}`).toBeLessThan(400);
        expect(
          origineFinale,
          `${url} redirige finalement vers ${origineFinale} : un mur de connexion est un échec`,
        ).toBe(origineAttendue);
      }
    });
  }
});

describe("les liens sur invitation sont annotés", () => {
  for (const u of LIENS_SUR_INVITATION) {
    it(`${u} est annoté « accès sur invitation » partout où il est publié`, () => {
      const origine = new URL(u).origin;
      const publications = urls.filter((x) => new URL(x.url).origin === origine);
      for (const p of publications) {
        expect(p.texte.toLowerCase(), `${p.origine} : "${p.texte}"`).toContain("accès sur invitation");
      }
    });
  }
});
