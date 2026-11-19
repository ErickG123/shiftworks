import { expect, test, type Page } from '@playwright/test';

async function clickGridCellAtYaw(
  page: Page,
  x: number,
  y: number,
  yawIndex = 0,
): Promise<void> {
  const canvas = page.locator('#factory-canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Factory canvas is not visible.');
  const theta = Math.PI / 4 + yawIndex * (Math.PI / 2);
  const worldX = x - 3.5;
  const worldZ = y - 3.5;
  const cameraRight = worldX * Math.sin(theta) - worldZ * Math.cos(theta);
  const cameraUp = -(worldX * Math.cos(theta) + worldZ * Math.sin(theta)) * (13 / Math.sqrt(369));
  const localX = bounds.width / 2 + (cameraRight * bounds.height) / 10.8;
  const localY = bounds.height / 2 - (cameraUp * bounds.height) / 10.8;
  await canvas.click({ position: { x: localX, y: localY } });
  await expect(page.locator('#selected-cell')).toContainText(`${x}, ${y}`);
}

test('completes Tutorial T00 with R rotation and navigates camera with WASD/Q/E while raycasting accurately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');

  // 1. Launch Tutorial T00 from Main Menu (default pt-BR)
  await page.locator('#menu-tutorial').click();
  await expect(page.locator('#tutorial-banner')).toBeVisible();
  await expect(page.locator('#tutorial-step-title')).toContainText('1/4');

  // Step 1/4: Select Conveyor tool
  await page.locator('[data-tool="CONVEYOR"]').click();
  await expect(page.locator('#tutorial-step-title')).toContainText('2/4');
  await expect(page.locator('#placement-direction')).toHaveValue('E');

  // Rotate ghost preview 4 times with R (E -> S -> W -> N -> E) before placing
  await page.keyboard.press('r');
  await expect(page.locator('#placement-direction')).toHaveValue('S');
  await page.keyboard.press('r');
  await expect(page.locator('#placement-direction')).toHaveValue('W');
  await page.keyboard.press('r');
  await expect(page.locator('#placement-direction')).toHaveValue('N');
  await page.keyboard.press('r');
  await expect(page.locator('#placement-direction')).toHaveValue('E');

  // Step 2/4: Place a conveyor at (1, 3) -> advances to Step 3/4
  await clickGridCellAtYaw(page, 1, 3, 0);
  await expect(page.locator('#tutorial-step-title')).toContainText('3/4');

  await page.screenshot({
    path: 'artifacts/tutorial-t00-1280x720.png',
    fullPage: true,
  });

  // Step 3/4: Press R to rotate conveyor -> advances to Step 4/4
  await page.keyboard.press('r');
  await expect(page.locator('#tutorial-step-title')).toContainText('4/4');

  // Step 4/4: Press Start to finish tutorial T00
  await page.locator('#start-simulation').click();
  await expect(page.locator('#tutorial-banner')).toBeHidden();

  // Return to EDITING via Edit Factory button
  await page.locator('#edit-simulation').click();
  await expect(page.locator('#start-simulation')).toBeEnabled();

  // 2. Test Q/E 90° camera rotation and WASD pan, then raycast placement after rotation
  await expect(page.locator('#camera-angle-indicator')).toContainText('45°');
  await page.keyboard.press('e');
  await expect(page.locator('#camera-angle-indicator')).toContainText('135°');

  // Place a conveyor at (2, 3) while camera is rotated to 135° (yawIndex = 1)
  await page.locator('[data-tool="CONVEYOR"]').click();
  await clickGridCellAtYaw(page, 2, 3, 1);
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('10');

  // Rotate camera back with Q to 45° and test WASD pan + center reset
  await page.keyboard.press('q');
  await expect(page.locator('#camera-angle-indicator')).toContainText('45°');
  await page.keyboard.press('w');
  await page.keyboard.press('a');
  await page.keyboard.press('s');
  await page.keyboard.press('d');
  await page.locator('#zoom-reset').click();
  await clickGridCellAtYaw(page, 3, 3, 0);
  await expect(page.locator('[data-tool-count="CONVEYOR"]')).toHaveText('9');
});

test('keyboard shortcuts respect focused inputs/selects/modals and keep native button Space activation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.locator('#menu-language-select').selectOption('en');
  await page.locator('#menu-continue').click();
  const canvas = page.locator('#factory-canvas');
  const start = page.locator('#start-simulation');

  await page.locator('[data-tool="CONVEYOR"]').click();
  await canvas.focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-tool="SELECT"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // Focusing a select control blocks Space, R, Q, E, WASD
  await page.locator('#placement-direction').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('q');
  await expect(start).toBeEnabled();
  await expect(page.locator('#camera-angle-indicator')).toContainText('45°');

  // Opening Settings modal blocks board shortcuts
  await page.locator('#open-settings').click();
  await expect(page.locator('#settings-overlay')).toBeVisible();
  await page.keyboard.press('q');
  await page.keyboard.press('r');
  await expect(page.locator('#camera-angle-indicator')).toContainText('45°');
  await page.keyboard.press('Escape');
  await expect(page.locator('#settings-overlay')).toBeHidden();

  // Native Space on focused Start button starts simulation
  await start.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause-simulation')).toBeEnabled();
  await expect(page.locator('#simulation-announcement')).toHaveText('Factory started.');

  // Pause and resume multiple times with Space on canvas
  await canvas.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#resume-simulation')).toBeEnabled();
  await page.keyboard.press('Space');
  await expect(page.locator('#pause-simulation')).toBeEnabled();
});
