// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // URL de production sur Pages ; un domaine perso viendra plus tard (spec § 11).
  site: "https://jonathan-dubois.pages.dev",
  integrations: [sitemap()],
});
