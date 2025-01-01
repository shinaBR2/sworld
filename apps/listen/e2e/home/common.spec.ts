import { test, expect } from '@playwright/test';

test.describe('home visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Flow - Listen/);
  });

  test('has logo', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Flow Logo' })).toBeVisible();
  });

  test('has site choices', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'site choices' })
    ).toBeVisible();
  });

  test('has profile button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'account options' })
    ).toBeVisible();
  });

  test('has feeling list', async ({ page }) => {
    await expect(
      page.getByRole('radiogroup', { name: 'feeling list' })
    ).toBeVisible();
  });
});
