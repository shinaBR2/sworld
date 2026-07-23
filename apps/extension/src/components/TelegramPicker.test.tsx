import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TelegramVideoMessage } from '../background/telegram';
import { formatDuration, labelFor, TelegramPicker } from './TelegramPicker';

let importResponse: unknown;
const sendMessage = vi.fn((_msg, cb: (r: unknown) => void) =>
  cb(importResponse),
);

const videos: TelegramVideoMessage[] = [
  {
    id: '10',
    filename: 'first.mp4',
    caption: 'A holiday clip',
    date: '2024-01-01T00:00:00Z',
    durationSeconds: 42,
    thumbnailDataUri: 'data:image/jpeg;base64,AAAA',
  },
  {
    id: '11',
    date: '2024-02-02T00:00:00Z',
    durationSeconds: 3725,
  },
];

beforeEach(() => {
  importResponse = { success: true, message: 'ok', taskId: 'task-1' };
  sendMessage.mockClear();
  global.chrome = {
    runtime: { id: 'test-ext', sendMessage },
  } as unknown as typeof chrome;
});

afterEach(() => vi.restoreAllMocks());

describe('formatDuration', () => {
  it('formats seconds as mm:ss and h:mm:ss', () => {
    expect(formatDuration(42)).toBe('0:42');
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(3725)).toBe('1:02:05');
    expect(formatDuration(undefined)).toBeUndefined();
  });
});

describe('labelFor', () => {
  it('prefers caption, then filename, then the date', () => {
    expect(labelFor(videos[0])).toBe('A holiday clip');
    expect(
      labelFor({ id: 'x', filename: 'clip.mp4', date: '2024-01-01' }),
    ).toBe('clip.mp4');
    expect(labelFor({ id: 'x', date: '2024-01-01T00:00:00Z' })).toBe(
      new Date('2024-01-01T00:00:00Z').toLocaleDateString(),
    );
  });

  it('skips whitespace-only caption and filename', () => {
    expect(
      labelFor({
        id: 'x',
        caption: '   ',
        filename: '  ',
        date: '2024-01-01T00:00:00Z',
      }),
    ).toBe(new Date('2024-01-01T00:00:00Z').toLocaleDateString());
  });

  it('falls back to a generic label when the date is unparseable', () => {
    expect(labelFor({ id: 'x', date: '' })).toBe('Untitled video');
    expect(labelFor({ id: 'x', date: 'not-a-date' })).toBe('Untitled video');
  });
});

describe('TelegramPicker', () => {
  const renderPicker = (props = {}) =>
    render(
      <TelegramPicker
        videos={videos}
        nextCursor={undefined}
        loadingMore={false}
        onLoadMore={vi.fn()}
        {...props}
      />,
    );

  it('renders each video with a thumbnail, label, and formatted duration', () => {
    renderPicker();
    expect(screen.getByText('A holiday clip')).toBeTruthy();
    expect(screen.getByText('0:42')).toBeTruthy();
    expect(screen.getByText('1:02:05')).toBeTruthy();
    const thumb = document.querySelector(
      'img[src="data:image/jpeg;base64,AAAA"]',
    );
    expect(thumb).not.toBeNull();
  });

  it('imports exactly the selected messageIds and shows success feedback', async () => {
    renderPicker();

    fireEvent.click(screen.getByText('A holiday clip'));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 selected' }));

    await waitFor(() =>
      expect(screen.getByText(/Import started for 1 video/)).toBeTruthy(),
    );
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TELEGRAM_IMPORT',
        payload: { messageIds: ['10'] },
      }),
      expect.any(Function),
    );
  });

  it('surfaces an import failure', async () => {
    importResponse = { success: false, message: 'Could not start the import.' };
    renderPicker();

    fireEvent.click(screen.getByText('A holiday clip'));
    fireEvent.click(screen.getByRole('button', { name: 'Import 1 selected' }));

    expect(await screen.findByText('Could not start the import.')).toBeTruthy();
  });

  it('shows a Load more button only when there is a next cursor', () => {
    const { rerender } = renderPicker();
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();

    rerender(
      <TelegramPicker
        videos={videos}
        nextCursor="9"
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Load more' })).toBeTruthy();
  });

  it('renders an empty state when there are no videos', () => {
    render(
      <TelegramPicker
        videos={[]}
        nextCursor={undefined}
        loadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );
    expect(screen.getByText('No videos found in this channel.')).toBeTruthy();
    // Nothing to import and nowhere to page to.
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Import/ })).toBeNull();
  });

  it('keeps Load more reachable when a page is empty but a cursor remains', () => {
    const onLoadMore = vi.fn();
    render(
      <TelegramPicker
        videos={[]}
        nextCursor="9"
        loadingMore={false}
        onLoadMore={onLoadMore}
      />,
    );
    // An empty page must not dead-end: the next page may hold videos.
    expect(screen.getByText('No videos found in this channel.')).toBeTruthy();
    const loadMore = screen.getByRole('button', { name: 'Load more' });
    fireEvent.click(loadMore);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
