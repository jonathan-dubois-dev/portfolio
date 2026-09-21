// captures-brutes/<slug>/<nom>.png  →  src/assets/realisations/<slug>/<nom>.png (1 600 px, ≤ 400 Ko, sinon .webp)
// captures-brutes/aussi/<slug>/<nom>.png  →  src/assets/aussi/<slug>/<nom>.png (même traitement)
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { join, parse } from "node:path";

const LARGEUR = 1600, MAX = 400_000;

async function traiter(src, dst, ignores) {
  if (!existsSync(src)) { console.error(`${src}/ absent`); process.exit(2); }
  let n = 0;
  for (const slug of readdirSync(src).filter((d) => !ignores.includes(d) && statSync(join(src, d)).isDirectory())) {
    mkdirSync(join(dst, slug), { recursive: true });
    for (const f of readdirSync(join(src, slug)).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
      const nom = parse(f).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const base = sharp(join(src, slug, f)).resize({ width: LARGEUR, withoutEnlargement: true });
      const png = join(dst, slug, `${nom}.png`), webp = join(dst, slug, `${nom}.webp`);
      await base.clone().png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(png);
      if (statSync(png).size > MAX) { unlinkSync(png); await base.clone().webp({ quality: 82 }).toFile(webp); }
      n++;
    }
  }
  return n;
}

const n1 = await traiter("captures-brutes", "src/assets/realisations", ["telegram", "aussi"]);
const n2 = await traiter("captures-brutes/aussi", "src/assets/aussi", []);
console.log(`${n1 + n2} capture(s) préparée(s) dans src/assets/realisations/ et src/assets/aussi/`);
