import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Flow - Listen/);
});

test('has logo', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Flow Logo' })).toBeVisible();
});

test('has site choices', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: 'site-choices' })
  ).toBeVisible();
});
