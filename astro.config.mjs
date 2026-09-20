// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Domaine perso attaché le 20/09/2026 (jonathan-dubois.dev + www, DNS Cloudflare Pages).
  site: "https://jonathan-dubois.dev",
  integrations: [sitemap()],
});
