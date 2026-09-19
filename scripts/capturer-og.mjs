// Capture le hero à l'état final en 1200 × 630 → public/og.png.
// Prérequis : `npm run build` fait. Lance lui-même `astro preview` sur 4322 et l'arrête.
import { spawn, execSync } from "node:child_process";
import { chromium } from "@playwright/test";

const URL = "http://127.0.0.1:4322/";
const serveur = spawn("npx astro preview --host 127.0.0.1 --port 4322", { shell: true, stdio: "ignore" });
const attendre = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(URL)).ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error("preview injoignable"); };

try {
  await attendre();
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.evaluate(() => { document.querySelector("[data-hero]").style.minHeight = "630px"; });
  // On attend l'état, pas une durée : à 2 600 ms d'horloge la boucle n'avait pas fini de faire
  // apparaître le dernier nœud ni sa flèche, et l'image partait avec une boîte à moitié pâle.
  await page.waitForFunction(() => (window.__fluxImages ?? 0) > 150);
  await page.screenshot({ path: "public/og.png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await navigateur.close();
  console.log("public/og.png écrit");
} finally {
  if (process.platform === "win32") {
    // `kill()` ne tue que l'enveloppe cmd : on abat l'arbre entier.
    try { execSync(`taskkill /pid ${serveur.pid} /t /f`, { stdio: "ignore" }); } catch {}
  } else {
    serveur.kill();
  }
}
