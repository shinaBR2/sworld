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

test.describe('music widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('visual', async ({ page }) => {
    const widget = page.getByRole('region', { name: 'music widget' });
    await expect(widget).toBeVisible();

    await expect(
      widget.getByRole('button', { name: 'list audio' })
    ).toBeHidden();
  });
});
