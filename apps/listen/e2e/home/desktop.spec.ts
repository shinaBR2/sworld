import { test, expect } from '@playwright/test';

test.describe('playing list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('show the list', async ({ page }) => {
    await expect(
      page.getByRole('list', { name: 'playing list' })
    ).toBeVisible();
  });
});
