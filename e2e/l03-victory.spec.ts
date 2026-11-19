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
  await expect(page.locator('#selected-cell')).toContainText(`Selected cell: ${x}, ${y}`);
}

test('completes L01 (with pause/inspect/edit), L02 (Processor + conveyors), and L03 (Diverter) with dedicated victory overlay', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.locator('#menu-language-select').selectOption('en');
  await page.locator('#menu-continue').click();
  await expect(page.locator('#engine-status')).toHaveAttribute('data-status', 'ready');
  await page.locator('#simulation-speed').selectOption('4');

  // 1. L01: Place 5 conveyors, Start, Pause, Inspect, Edit Factory, complete 6th conveyor, and win
  await expect(page.locator('#level-select')).toHaveValue('L01');
  await page.locator('[data-tool="CONVEYOR"]').click();
  for (let x = 1; x <= 5; x += 1) await clickGridCell(page, x, 3);

  await page.locator('#start-simulation').click();
  await page.locator('#pause-simulation').click();
  await expect(page.locator('#paused-callout-banner')).toBeVisible();

  // Inspect placed conveyor at (1, 3) while PAUSED
  await clickGridCell(page, 1, 3);
  await expect(page.locator('#editor-feedback')).toContainText('Inspecting Conveyor');

  // Click Edit Factory from pause banner to unlock editing while preserving layout
  await page.locator('#paused-edit-cta').click();
  await expect(page.locator('#paused-callout-banner')).toBeHidden();
  await expect(page.locator('[data-tool="CONVEYOR"]')).toBeEnabled();

  // Add the 6th conveyor at (6, 3) and run L01 to completion
  await page.locator('[data-tool="CONVEYOR"]').click();
  await clickGridCell(page, 6, 3);
  await page.locator('#start-simulation').click();

  await expect(page.locator('#result-panel')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#result-heading')).toHaveText('Factory Complete!');
  await expect(
    page.locator('#result-stars-visual [data-earned="true"]'),
  ).toHaveCount(3);
  await expect(page.locator('#goal-status')).toContainText('Blue blank at Dock: 3/3');
  await expect(page.locator('#next-level')).toBeEnabled();

  await page.screenshot({
    path: 'artifacts/victory-overlay-1280x720.png',
    fullPage: true,
  });

  await page.locator('#next-level').click();

  // 2. L02: Verify positive conveyor budget (10 conveyors + 1 processor), build line, and win
  await expect(page.locator('#level-select')).toHaveValue('L02');
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('10');
  await expect(page.locator('[data-tool-count="PROCESSOR"]')).toHaveText('1');
  await expect(page.locator('#level-instructions')).toContainText('shifts automatically');

  await page.locator('[data-tool="PROCESSOR"]').click();
  await clickGridCell(page, 1, 3);
  await page.locator('[data-tool="CONVEYOR"]').click();
  for (const x of [2, 3, 4]) await clickGridCell(page, x, 3);

  await page.locator('[data-tool="SELECT"]').click();
  await clickGridCell(page, 1, 3);
  await page.locator('#save-processor-rules').click();

  await page.screenshot({
    path: 'artifacts/l02-gameplay-1280x900.png',
    fullPage: true,
  });

  await page.locator('#start-simulation').click();
  await expect(page.locator('#result-panel')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('#goal-status')).toContainText('Cut plate at Dock: 3/3');
  await expect(page.locator('#goal-status')).toContainText('Pressed block at Dock: 3/3');
  await expect(
    page.locator('#result-stars-visual [data-earned="true"]'),
  ).toHaveCount(3);
  await page.locator('#next-level').click();

  // 3. L03: Build Processor + Conveyors + Diverter route and win
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
  await expect(page.locator('#goal-status')).toContainText('Cut plate at Output A: 3/3');
  await expect(page.locator('#goal-status')).toContainText(
    'Pressed block at Output B: 3/3',
  );
  await expect(page.locator('#simulation-metrics')).toContainText('Rejected: 0');
  await expect(page.locator('#replay-simulation')).toBeEnabled();

  await page.screenshot({ path: 'artifacts/l03-result-1280x900.png', fullPage: true });
});
