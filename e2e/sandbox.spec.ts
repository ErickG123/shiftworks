import { expect, test } from '@playwright/test';

test('Sandbox reuses the factory and remains playable when localStorage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('Storage is blocked', 'SecurityError'); },
    });
  });
  await page.goto('/');
  await expect(page.locator('#game-mode-select')).toHaveValue('CAMPAIGN');
  await expect(page.locator('#storage-status')).toContainText('session');
  await page.reload();
  await expect(page.locator('#game-mode-select')).toHaveValue('CAMPAIGN');
  await page.locator('#game-mode-select').selectOption('SANDBOX');
  await expect(page.locator('#sandbox-controls')).toBeVisible();
  await expect(page.locator('#inventory')).toContainText('Unlimited');
  await expect(page.locator('#goal-status')).toContainText('Output counts:');

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#clear-sandbox').click();
  await expect(page.locator('#editor-feedback')).toContainText('Sandbox cleared');
  await page.locator('#sandbox-source-mode').selectOption('BLUE');
  await page.locator('#sandbox-source-mode').selectOption('ALTERNATING');
  await page.locator('#load-sandbox-example').click();
  await page.locator('#start-simulation').click();
  await expect(page.locator('#pause-simulation')).toBeEnabled();
  await expect(page.locator('#goal-status')).toContainText(/A \(out-a\) [1-9]/, { timeout: 45_000 });
  await expect(page.locator('#goal-status')).toContainText(/B \(out-b\) [1-9]/, { timeout: 45_000 });
  await expect(page.locator('#simulation-message')).not.toContainText('complete');
  await page.locator('#pause-simulation').click();
  await page.locator('#reset-simulation').click();
  await expect(page.locator('#simulation-tick')).toHaveText('Tick 0');
});
