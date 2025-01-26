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

    await expect(widget.getByRole('button', { name: 'toggle playing list' })).toBeVisible();
  });

  test.describe('actions', () => {
    test('toggle playing list', async ({ page }) => {
      const widget = page.getByRole('region', { name: 'music widget' });
      const button = widget.getByRole('button', {
        name: 'toggle playing list',
      });

      await button.click();

      const playingList = widget.getByRole('listbox', { name: 'audio tracks' });
      await expect(playingList).toBeVisible();

      const playingAudio = playingList.getByRole('option', { name: 'audio track' }).first();
      await expect(playingAudio).toBeVisible();
      await expect(playingAudio).toHaveAttribute('aria-selected', 'true');

      await button.click();

      /**
       * This doesn't work because the element is still in the DOM
       * but hidden due to parent's overflow.
       * So we need to check the visibility of all items instead.
       */
      // await expect(playingList).toBeHidden();

      const allItems = await playingList
        .getByRole('option', {
          name: 'audio track',
        })
        .all();
      for (const btn of allItems) {
        /**
         * This doesn't work because the element is still in the DOM
         */
        // await expect(btn).not.toBeVisible();
        await expect(btn).not.toBeInViewport();
      }
    });

    test('next audio', async ({ page }) => {
      /**
       * This does not cover yet the case the playing list
       * has only one item
       */
      const playingList = page.getByRole('listbox', { name: 'audio tracks' });
      const widget = page.getByRole('region', { name: 'music widget' });
      const controls = widget.getByRole('group', { name: 'playback controls' });
      const nextButton = controls.getByRole('button', { name: 'next audio' });
      const togglePlayingListbutton = widget.getByRole('button', {
        name: 'toggle playing list',
      });

      await expect(widget).toBeVisible();

      await nextButton.click();
      await togglePlayingListbutton.click();

      await expect(playingList.getByRole('option').first()).toHaveAttribute('aria-selected', 'false');
      await expect(playingList.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true');
    });

    test('previous audio', async ({ page }) => {
      /**
       * This does not cover yet the case the playing list
       * has only one item
       */
      const playingList = page.getByRole('listbox', { name: 'audio tracks' });
      const widget = page.getByRole('region', { name: 'music widget' });
      const controls = widget.getByRole('group', { name: 'playback controls' });
      const prevButton = controls.getByRole('button', {
        name: 'previous audio',
      });
      const togglePlayingListbutton = widget.getByRole('button', {
        name: 'toggle playing list',
      });

      await expect(widget).toBeVisible();

      await prevButton.click();
      await togglePlayingListbutton.click();

      await expect(playingList.getByRole('option').first()).toHaveAttribute('aria-selected', 'false');
      await expect(playingList.getByRole('option').last()).toHaveAttribute('aria-selected', 'true');
    });
  });
});
