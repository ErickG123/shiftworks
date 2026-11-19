import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1600, height: 900 },
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

    if (viewport.width === 1280 || viewport.width === 1920) {
      await page.screenshot({
        path: `artifacts/main-menu-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }

    // 2. Navigate to Level Select screen (20 campaign levels across 5 sectors)
    await page.locator('#menu-levels').click();
    await expect(page.locator('.level-card')).toHaveCount(20);
    await expect(page.locator('.level-card').nth(0)).toHaveAttribute(
      'data-status',
      'UNLOCKED',
    );
    await expect(page.locator('.level-card').nth(1)).toHaveAttribute(
      'data-status',
      'LOCKED',
    );
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

    // Verify 100% pt-BR localization in gameplay HUD (no raw BLUE_BLANK / CONVEYOR labels)
    await expect(page.locator('#level-instructions')).toContainText('Posicione 6 esteiras');
    await expect(page.locator('#goal-status')).toContainText('Bloco azul na Doca: 0/3');
    await expect(page.locator('#inventory')).toContainText('Esteira');
    await expect(page.locator('#inventory')).not.toContainText('CONVEYOR');
    await expect(page.locator('#connections')).toContainText('As portas conectam-se');
    await expect(page.locator('#machine-status')).toContainText('Processador: Ocioso');

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({
      path: `artifacts/ux-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });
  });
}

test('switches PT-BR and EN dynamically and navigates menu <-> gameplay repeatedly without canvas duplication or leaks', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  for (let i = 0; i < 3; i += 1) {
    await page.locator('#menu-continue').click();
    await expect(page.locator('#factory-canvas')).toHaveCount(1);
    await expect(page.locator('#editor-toolbar')).toBeVisible();
    await page.locator('#open-main-menu').click();
    await expect(page.locator('#game-screen-overlay')).toBeVisible();
    await expect(page.locator('#factory-canvas')).toHaveCount(1);
  }

  await page.locator('#menu-continue').click();
  await expect(page.locator('#goal-status')).toContainText('Bloco azul na Doca: 0/3');

  // Switch to EN in gameplay HUD
  await page.locator('#hud-language-select').selectOption('en');
  await expect(page.locator('#goal-status')).toContainText('Blue blank at Dock: 0/3');
  await expect(page.locator('#inventory')).toContainText('Conveyor');

  // Switch back to PT-BR
  await page.locator('#hud-language-select').selectOption('pt-BR');
  await expect(page.locator('#goal-status')).toContainText('Bloco azul na Doca: 0/3');
  await expect(page.locator('#inventory')).toContainText('Esteira');

  expect(pageErrors).toEqual([]);
});
