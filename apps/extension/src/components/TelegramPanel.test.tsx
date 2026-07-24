import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TelegramPanel } from './TelegramPanel';

// Per-type canned responses; each test tweaks `responses` before rendering.
let responses: Record<string, unknown>;
const sendMessage = vi.fn((msg: { type: string }, cb: (r: unknown) => void) =>
  cb(responses[msg.type]),
);

beforeEach(() => {
  responses = {
    TELEGRAM_LIST_VIDEOS: {
      success: true,
      message: 'ok',
      videos: [{ id: '10', caption: 'A clip', date: '2024-01-01T00:00:00Z' }],
      nextCursor: undefined,
    },
    TELEGRAM_REQUEST_LOGIN_CODE: { success: true, message: 'sent' },
    TELEGRAM_SUBMIT_LOGIN_CODE: { success: true, message: 'ok' },
  };
  sendMessage.mockClear();
  global.chrome = {
    runtime: { id: 'test-ext', sendMessage },
    // The nested TelegramLogin restores its step from chrome.storage on mount
    // (SWO-604); an empty store just means "no code sent yet".
    storage: {
      local: {
        get: vi.fn(async () => ({})),
        set: vi.fn(async () => {}),
        remove: vi.fn(async () => {}),
      },
    },
  } as unknown as typeof chrome;
});

afterEach(() => vi.restoreAllMocks());

describe('TelegramPanel', () => {
  it('shows the picker when the channel lists videos', async () => {
    render(<TelegramPanel />);
    expect(await screen.findByText('A clip')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Import 0 selected/ }),
    ).toBeTruthy();
  });

  it('shows the login prompt when the list returns NO_SESSION', async () => {
    responses.TELEGRAM_LIST_VIDEOS = {
      success: false,
      message: 'NO_SESSION',
      videos: [],
    };
    render(<TelegramPanel />);
    expect(
      await screen.findByRole('button', { name: 'Send login code' }),
    ).toBeTruthy();
  });

  it('switches from the login prompt to the picker after a successful login', async () => {
    responses.TELEGRAM_LIST_VIDEOS = {
      success: false,
      message: 'NO_SESSION',
      videos: [],
    };
    render(<TelegramPanel />);

    // Login shows first; complete it, then the panel re-lists.
    fireEvent.click(
      await screen.findByRole('button', { name: 'Send login code' }),
    );
    // Now the session exists — the next list call returns videos.
    responses.TELEGRAM_LIST_VIDEOS = {
      success: true,
      message: 'ok',
      videos: [{ id: '10', caption: 'A clip', date: '2024-01-01T00:00:00Z' }],
      nextCursor: undefined,
    };
    fireEvent.change(await screen.findByLabelText('Login code'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('A clip')).toBeTruthy();
  });

  it('keeps the loaded list when a "Load more" page fails', async () => {
    responses.TELEGRAM_LIST_VIDEOS = {
      success: true,
      message: 'ok',
      videos: [{ id: '10', caption: 'Page one clip', date: '2024-01-01' }],
      nextCursor: '9',
    };
    render(<TelegramPanel />);

    const loadMore = await screen.findByRole('button', { name: 'Load more' });
    // The second page fails — the first page (and its selection) must survive.
    responses.TELEGRAM_LIST_VIDEOS = {
      success: false,
      message: 'Could not fetch more.',
      videos: [],
    };
    fireEvent.click(loadMore);

    expect(await screen.findByText('Could not fetch more.')).toBeTruthy();
    // Still the picker: page-one video present, not swapped for a full-panel
    // error or the login prompt.
    expect(screen.getByText('Page one clip')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Send login code' }),
    ).toBeNull();
  });

  it('shows an error state when the list fails for another reason', async () => {
    responses.TELEGRAM_LIST_VIDEOS = {
      success: false,
      message: 'Something broke',
      videos: [],
    };
    render(<TelegramPanel />);
    expect(await screen.findByText('Something broke')).toBeTruthy();
  });

  it('shows an error when the background is unreachable', async () => {
    responses.TELEGRAM_LIST_VIDEOS = undefined;
    render(<TelegramPanel />);
    await waitFor(() =>
      expect(
        screen.getByText(/could not reach the background service/),
      ).toBeTruthy(),
    );
  });

  it('shows an error (not a hang) when sendMessage throws synchronously', async () => {
    // "Extension context invalidated" — sendMessage throws before the callback
    // ever fires. The request wrapper must swallow it into `undefined` so the
    // panel lands in error rather than spinning forever.
    global.chrome = {
      runtime: {
        id: 'test-ext',
        sendMessage: vi.fn(() => {
          throw new Error('Extension context invalidated.');
        }),
      },
    } as unknown as typeof chrome;
    render(<TelegramPanel />);
    await waitFor(() =>
      expect(
        screen.getByText(/could not reach the background service/),
      ).toBeTruthy(),
    );
  });
});
