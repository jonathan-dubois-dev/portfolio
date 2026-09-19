import { test, expect } from "@playwright/test";

const SITE = "https://jonathan-dubois.pages.dev";

test("sitemap : l'accueil et les trois réalisations", async ({ request }) => {
  const index = await (await request.get("/sitemap-index.xml")).text();
  const m = /<loc>([^<]+)<\/loc>/.exec(index)!;
  const sitemap = await (await request.get(m[1].replace(SITE, ""))).text();
  for (const u of ["/", "/realisations/pack-btp/", "/realisations/hub-sante/", "/realisations/studio-moonkura/", "/automatisations/"])
    expect(sitemap, u).toContain(`${SITE}${u}`);
});

test("canonical, description et image Open Graph par page", async ({ page, request }) => {
  await page.goto("/realisations/pack-btp/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/realisations/pack-btp/`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /LLM/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBe(`${SITE}/og.png`);
  const r = await request.get("/og.png");
  expect(r.status()).toBe(200);
  expect(Number(r.headers()["content-length"])).toBeGreaterThan(20_000);
});

test("robots.txt pointe le sitemap", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("sitemap-index.xml");
});
