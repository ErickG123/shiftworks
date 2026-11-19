import { expect, test, type Page } from '@playwright/test';

async function clickGridCell(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator('#factory-canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Factory canvas is not visible.');
  const worldX = x - 3.5;
  const worldZ = y - 3.5;
  const cameraRight = (worldX - worldZ) / Math.sqrt(2);
  const cameraUp = -0.479 * (worldX + worldZ);
  const localX = bounds.width / 2 + (cameraRight * bounds.height) / 10.8;
  const localY = bounds.height / 2 - (cameraUp * bounds.height) / 10.8;
  await canvas.click({ position: { x: localX, y: localY } });
}

test('verifies Undo/Redo, 3D Equipment Preview Card, and +1 Tick step-by-step simulation in real browser', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.locator('#menu-continue').click();

  // 1. Place conveyor, Undo restores inventory to 12, Redo restores to 11 (SW-101)
  await page.locator('[data-tool="CONVEYOR"]').click();
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('12');
  await clickGridCell(page, 1, 3);
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('11');

  await page.locator('#editor-undo').click();
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('12');
  await page.locator('#editor-redo').click();
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('11');

  // 2. Open floating 3D Equipment Preview Card without placing a piece (SW-201/202/203)
  await page.locator('#equipment-info-btn').click();
  await expect(page.locator('#equipment-preview-overlay')).toBeVisible();
  await expect(page.locator('#equipment-preview-canvas')).toBeVisible();
  await expect(page.locator('#preview-card-title')).toHaveText('Esteira');

  await page.screenshot({
    path: 'artifacts/equipment-preview-3d-1280x720.png',
    fullPage: true,
  });

  await page.locator('#preview-toggle-play').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#equipment-preview-overlay')).toBeHidden();
  await expect(page.locator('#equipment-preview-canvas')).toHaveCount(0);

  // 3. Start -> Pause -> +1 Tick deterministic stepping and speed selector (SW-108)
  await page.locator('#simulation-speed').selectOption('2');
  await page.locator('#start-simulation').click();
  await page.locator('#pause-simulation').click();
  await expect(page.locator('#step-simulation')).toBeEnabled();

  const beforeText = (await page.locator('#simulation-tick').textContent()) ?? 'Ciclo 0';
  const beforeTick = Number(beforeText.replace(/\D/g, '')) || 0;
  await page.locator('#step-simulation').click();
  await expect(page.locator('#simulation-tick')).toHaveText(`Ciclo ${beforeTick + 1}`);
  await page.locator('#step-simulation').click();
  await expect(page.locator('#simulation-tick')).toHaveText(`Ciclo ${beforeTick + 2}`);
});
