import { expect, test } from '@playwright/test';

test('keyboard shortcuts support the board and respect focused controls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  const canvas = page.locator('#factory-canvas');
  const start = page.locator('#start-simulation');

  await page.locator('[data-tool="CONVEYOR"]').click();
  await canvas.focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-tool="SELECT"]')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#placement-direction').focus();
  await page.keyboard.press('Space');
  await expect(start).toBeEnabled();

  await canvas.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause-simulation')).toBeEnabled();
  await page.keyboard.press('Space');
  await expect(page.locator('#resume-simulation')).toBeEnabled();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause-simulation')).toBeEnabled();
});

test('Space on a focused action button keeps native button behavior', async ({ page }) => {
  await page.goto('/');
  const start = page.locator('#start-simulation');
  await start.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause-simulation')).toBeEnabled();
  await expect(page.locator('#simulation-announcement')).toHaveText('Factory started.');
});
