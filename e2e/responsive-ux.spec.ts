import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
]) {
  test(`keeps main menu, level select, i18n and editor usable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');

    // 1. Main Menu is a dedicated screen in pt-BR by default; gameplay HUD is hidden
    await expect(page.locator('#game-screen-overlay')).toBeVisible();
    await expect(page.locator('#factory-canvas')).toBeVisible();
    await expect(page.locator('#editor-toolbar')).toBeHidden();
    await expect(page.locator('.right-inspector')).toBeHidden();
    await expect(page.locator('.bottom-bar')).toBeHidden();
    await expect(page.locator('#menu-levels')).toContainText('Jogar Campanha');

    await page.screenshot({
      path: `artifacts/main-menu-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });

    // 2. Navigate to Level Select screen
    await page.locator('#menu-levels').click();
    await expect(page.locator('.level-card')).toHaveCount(3);
    await expect(page.locator('.level-card').nth(0)).toHaveAttribute('data-status', 'UNLOCKED');
    await expect(page.locator('.level-card').nth(1)).toHaveAttribute('data-status', 'LOCKED');
    await expect(page.locator('.level-card').nth(1)).toContainText('Conclua a Fase L01');

    if (viewport.width === 1280) {
      await page.screenshot({
        path: `artifacts/level-select-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }

    // 3. Enter L01 Gameplay from Level Select
    await page.locator('.level-play-btn[data-level-id="L01"]').click();
    await expect(page.locator('#game-screen-overlay')).toBeHidden();
    await expect(page.locator('#factory-canvas')).toBeVisible();
    await expect(page.locator('#editor-toolbar')).toBeVisible();
    await expect(page.locator('#start-simulation')).toBeVisible();
    await expect(page.locator('#zoom-in')).toBeVisible();

    // Verify 100% pt-BR localization in gameplay HUD (no hardcoded English)
    await expect(page.locator('#level-instructions')).toContainText('Posicione seis esteiras');
    await expect(page.locator('#connections')).toContainText('As portas conectam-se');
    await expect(page.locator('#machine-status')).toContainText('Processador: Ocioso');

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
    await page.screenshot({
      path: `artifacts/ux-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });
  });
}
