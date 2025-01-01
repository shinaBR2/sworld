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

  test('music widget visual', async ({ page }) => {
    const widget = page.getByRole('region', { name: 'music widget' });
    await expect(widget).toBeVisible();

    await expect(
      widget.getByRole('img', { name: 'audio thumnail' })
    ).toBeVisible();

    const nowPlaying = widget.getByLabel('now playing');
    await expect(nowPlaying).toBeVisible();
    await expect(nowPlaying).toContainText('Now playing');

    await expect(widget.getByLabel('audio title')).toBeVisible();
    await expect(widget.getByLabel('audio artist')).toBeVisible();

    const seeker = widget.getByLabel('audio time seeker');
    await expect(
      seeker.getByRole('slider', { name: 'time indicator' })
    ).toBeVisible();
    await expect(seeker.getByLabel('start')).toBeVisible();
    await expect(seeker.getByLabel('end')).toBeVisible();

    const controls = widget.getByRole('group', { name: 'playback controls' });
    await expect(
      controls.getByRole('button', { name: 'toggle loop mode' })
    ).toBeVisible();
    await expect(
      controls.getByRole('button', { name: 'shuffle' })
    ).toBeVisible();
    await expect(
      controls.getByRole('button', { name: 'next audio' })
    ).toBeVisible();
    await expect(
      controls.getByRole('button', { name: 'previous audio' })
    ).toBeVisible();
  });

  test.describe('music widget actions', () => {
    test.beforeEach(async ({ context }) => {
      await context.addInitScript(() => {
        window.HTMLMediaElement.prototype.play = async () => {};
        window.HTMLMediaElement.prototype.pause = () => {};
      });
    });

    test('play/pause', async ({ page }) => {
      const widget = page.getByRole('region', { name: 'music widget' });
      const controls = widget.getByRole('group', { name: 'playback controls' });
      const playButton = controls.getByRole('button', { name: 'play' });

      await playButton.click();
      const pauseButton = controls.getByRole('button', { name: 'pause' });

      await expect(pauseButton).toBeVisible();
      await expect(playButton).toBeHidden();

      await pauseButton.click();
      await expect(playButton).toBeVisible();
      await expect(pauseButton).toBeHidden();
    });
  });
});
