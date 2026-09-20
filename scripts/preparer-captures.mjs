// captures-brutes/<slug>/<nom>.png  →  src/assets/realisations/<slug>/<nom>.png (1 600 px, ≤ 400 Ko, sinon .webp)
import sharp from "sharp";
import { readdirSync, mkdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import { join, parse } from "node:path";

const SRC = "captures-brutes", DST = "src/assets/realisations", LARGEUR = 1600, MAX = 400_000;
if (!existsSync(SRC)) { console.error(`${SRC}/ absent`); process.exit(2); }
let n = 0;
for (const slug of readdirSync(SRC).filter((d) => d !== "telegram" && statSync(join(SRC, d)).isDirectory())) {
  mkdirSync(join(DST, slug), { recursive: true });
  for (const f of readdirSync(join(SRC, slug)).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
    const nom = parse(f).name.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const base = sharp(join(SRC, slug, f)).resize({ width: LARGEUR, withoutEnlargement: true });
    const png = join(DST, slug, `${nom}.png`), webp = join(DST, slug, `${nom}.webp`);
    await base.clone().png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(png);
    if (statSync(png).size > MAX) { unlinkSync(png); await base.clone().webp({ quality: 82 }).toFile(webp); }
    n++;
  }
}
console.log(`${n} capture(s) préparée(s) dans ${DST}/`);
