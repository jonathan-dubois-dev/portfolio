import type { Page } from "@playwright/test";

/** Poids total transféré à la première vue (navigation + ressources), mesuré par `performance`. */
export async function poidsPremiereVue(page: Page): Promise<number> {
  await page.waitForLoadState("networkidle");
  return page.evaluate(() => {
    const rs = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return nav.transferSize + rs.reduce((s, r) => s + r.transferSize, 0);
  });
}
