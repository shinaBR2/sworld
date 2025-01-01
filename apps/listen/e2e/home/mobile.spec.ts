import { test, expect } from '@playwright/test';

test.describe('playing list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('show the list', async ({ page }) => {
    await expect(page.getByRole('list', { name: 'playing list' })).toBeHidden();
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
      widget.getByRole('button', { name: 'toggle playing list' })
    ).toBeVisible();
  });

  test.describe('actions', () => {
    test.only('toggle playing list', async ({ page }) => {
      const widget = page.getByRole('region', { name: 'music widget' });
      const button = widget.getByRole('button', {
        name: 'toggle playing list',
      });

      await button.click();

      const playingList = widget.getByRole('list', { name: 'playing list' });
      await expect(playingList).toBeVisible();

      await button.click();

      /**
       * This doesn't work because the element is still in the DOM
       * but hidden due to parent's overflow.
       * So we need to check the visibility of all items instead.
       */
      // await expect(playingList).toBeHidden();

      const allItems = playingList.getByRole('button', { name: 'audio track' });

      await expect(allItems).toBeHidden();
    });
  });
});
