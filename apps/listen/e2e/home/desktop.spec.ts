import { test, expect } from '@playwright/test';

test.describe('playing list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('show the list', async ({ page }) => {
    const playingList = page.getByRole('list', { name: 'playing list' });
    await expect(playingList).toBeVisible();

    const firstItem = playingList.getByRole('button').first();
    await expect(firstItem).toContainText('Now Playing');
  });

  test('actions', async ({ page }) => {
    const playingList = page.getByRole('list', { name: 'playing list' });
    const firstItem = playingList.getByRole('button').first();
    const secondItem = playingList.getByRole('button').nth(1);

    await expect(firstItem).toContainText('Now Playing');
    await expect(secondItem).not.toContainText('Now Playing');
    await secondItem.click();
    await expect(firstItem).not.toContainText('Now Playing');
    await expect(secondItem).toContainText('Now Playing');
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

  test.describe('actions', () => {
    test.beforeEach(async ({ context }) => {
      await context.addInitScript(() => {
        window.HTMLMediaElement.prototype.play = async () => {};
        window.HTMLMediaElement.prototype.pause = () => {};
      });
    });

    test('next audio', async ({ page }) => {
      /**
       * This does not cover yet the case the playing list
       * has only one item
       */
      const playingList = page.getByRole('list', { name: 'playing list' });
      const widget = page.getByRole('region', { name: 'music widget' });
      const controls = widget.getByRole('group', { name: 'playback controls' });
      const nextButton = controls.getByRole('button', { name: 'next audio' });

      await expect(widget).toBeVisible();
      await expect(playingList.getByRole('button').first()).toContainText(
        'Now Playing'
      );
      await nextButton.click();
      await expect(playingList.getByRole('button').first()).not.toContainText(
        'Now Playing'
      );
      await expect(playingList.getByRole('button').nth(1)).toContainText(
        'Now Playing'
      );
    });

    test('previous audio', async ({ page }) => {
      /**
       * This does not cover yet the case the playing list
       * has only one item
       */
      const playingList = page.getByRole('list', { name: 'playing list' });
      const widget = page.getByRole('region', { name: 'music widget' });
      const controls = widget.getByRole('group', { name: 'playback controls' });
      const nextButton = controls.getByRole('button', {
        name: 'previous audio',
      });

      await expect(widget).toBeVisible();
      await expect(playingList.getByRole('button').first()).toContainText(
        'Now Playing'
      );
      await nextButton.click();
      await expect(playingList.getByRole('button').first()).not.toContainText(
        'Now Playing'
      );
      await expect(playingList.getByRole('button').nth(1)).toContainText(
        'Now Playing'
      );
    });
  });
});
