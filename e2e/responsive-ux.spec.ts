import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
  test(`keeps the editor usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#factory-canvas')).toBeVisible();
    await expect(page.locator('#editor-toolbar')).toBeVisible();
    await expect(page.locator('#start-simulation')).toBeVisible();
    await expect(page.locator('#zoom-in')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `artifacts/ux-${viewport.width}x${viewport.height}.png`, fullPage: true });
  });
}
