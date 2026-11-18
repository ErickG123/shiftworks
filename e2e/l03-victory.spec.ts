import { expect, test, type Page } from '@playwright/test';

async function clickGridCell(page: Page, x: number, y: number): Promise<void> {
  const canvas = page.locator('#factory-canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Factory canvas is not visible.');
  const worldX = x - 3.5;
  const worldZ = y - 3.5;
  const cameraRight = (worldX - worldZ) / Math.sqrt(2);
  const cameraUp = -0.479 * (worldX + worldZ);
  const localX = bounds.width / 2 + cameraRight * bounds.height / 10.8;
  const localY = bounds.height / 2 - cameraUp * bounds.height / 10.8;
  await canvas.click({ position: { x: localX, y: localY } });
  await expect(page.locator('#selected-cell')).toContainText(`Selected cell: ${x}, ${y}`);
}

test('builds the L03 reference route and wins without input after Start', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.locator('#menu-language-select').selectOption('en');
  await page.locator('#menu-continue').click();
  await expect(page.locator('#engine-status')).toHaveAttribute('data-status', 'ready');

  await expect(page.locator('#level-select')).toHaveValue('L01');
  await page.locator('[data-tool="CONVEYOR"]').click();
  for (let x = 1; x <= 6; x += 1) await clickGridCell(page, x, 3);
  await page.locator('#start-simulation').click();
  await expect(page.locator('#result-panel')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#goal-status')).toContainText('BLUE_BLANK at dock: 3/3');
  await expect(page.locator('#next-level')).toBeEnabled();
  await page.locator('#next-level').click();

  await expect(page.locator('#level-select')).toHaveValue('L02');
  await expect(page.locator('#level-instructions')).toContainText('shifts automatically');
  await page.locator('[data-tool="PROCESSOR"]').click();
  await clickGridCell(page, 1, 3);
  await page.locator('[data-tool="SELECT"]').click();
  await clickGridCell(page, 1, 3);
  await page.locator('#save-processor-rules').click();
  await page.locator('#start-simulation').click();
  await expect(page.locator('#result-panel')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#goal-status')).toContainText('CUT_PLATE at dock: 3/3');
  await expect(page.locator('#goal-status')).toContainText('PRESSED_BLOCK at dock: 3/3');
  await page.locator('#next-level').click();

  await expect(page.locator('#level-select')).toHaveValue('L03');
  await page.locator('[data-tool="PROCESSOR"]').click();
  await clickGridCell(page, 1, 3);
  await page.locator('[data-tool="CONVEYOR"]').click();
  for (const x of [2, 3, 4]) await clickGridCell(page, x, 3);
  await page.locator('[data-tool="DIVERTER"]').click();
  await clickGridCell(page, 5, 3);
  await page.locator('[data-tool="CONVEYOR"]').click();
  await page.locator('#placement-direction').selectOption('S');
  await clickGridCell(page, 5, 4);

  await page.locator('[data-tool="SELECT"]').click();
  await clickGridCell(page, 1, 3);
  await expect(page.locator('#processor-rule-panel')).toBeVisible();
  await page.locator('#save-processor-rules').click();
  await clickGridCell(page, 5, 3);
  await expect(page.locator('#diverter-rule-panel')).toBeVisible();
  await page.locator('#save-diverter-rules').click();

  await page.locator('#start-simulation').click();
  await expect(page.locator('#result-panel')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#goal-status')).toContainText('CUT_PLATE at out-a: 3/3');
  await expect(page.locator('#goal-status')).toContainText('PRESSED_BLOCK at out-b: 3/3');
  await expect(page.locator('#simulation-metrics')).toContainText('Rejected: 0');
  await expect(page.locator('#replay-simulation')).toBeEnabled();

  await page.screenshot({ path: 'artifacts/l03-result-1280x900.png', fullPage: true });
});
