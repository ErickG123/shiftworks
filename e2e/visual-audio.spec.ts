import { expect, test } from '@playwright/test';

test('sound starts muted and changes only after an explicit button gesture', async ({ page }) => {
  await page.goto('/');
  await page.locator('#menu-continue').click();
  const toggle = page.locator('#audio-toggle');
  const volume = page.locator('#audio-volume');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(volume).toBeDisabled();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(volume).toBeEnabled();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(volume).toBeDisabled();
});
