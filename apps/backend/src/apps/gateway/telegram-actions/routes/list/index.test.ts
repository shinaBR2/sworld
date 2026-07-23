import type { ListTelegramChannelVideosOutput } from 'src/schema/telegram/list';
import { getTelegramClient } from 'src/services/telegram/client';
import { TelegramNotAuthenticatedError } from 'src/services/telegram/errors';
import { Api } from 'teleproto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTelegramChannelVideos } from './index';

// The handler's real return type is a union across its success/error branches;
// narrowing it here keeps every `result.dataObject` access below type-safe.
const callList = (context: unknown) =>
  listTelegramChannelVideos(context as any) as Promise<{
    success: boolean;
    message: string;
    dataObject?: ListTelegramChannelVideosOutput;
  }>;

const mockClient = {
  getInputEntity: vi.fn(),
  getMessages: vi.fn(),
  downloadMedia: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('src/services/telegram/client', () => ({
  getTelegramClient: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

const buildVideoMessage = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  date: 1_700_000_000,
  message: 'a caption',
  video: {
    size: 123_456n,
    thumbs: [{}],
    attributes: [
      new Api.DocumentAttributeFilename({ fileName: 'clip.mp4' }),
      new Api.DocumentAttributeVideo({
        duration: 42.5,
        w: 100,
        h: 100,
        supportsStreaming: true,
      }),
    ],
  },
  ...overrides,
});

const buildContext = (
  overrides: Partial<{
    channelId: string;
    cursor: string;
    userId: string;
  }> = {},
) => ({
  validatedData: {
    channelId: overrides.channelId ?? '-582839764',
    cursor: overrides.cursor,
    userId: overrides.userId ?? USER_ID,
  },
});

describe('listTelegramChannelVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTelegramClient).mockResolvedValue(mockClient as any);
    mockClient.getInputEntity.mockResolvedValue({ resolved: true });
    mockClient.downloadMedia.mockResolvedValue(
      Buffer.from('thumb-bytes', 'utf8'),
    );
    mockClient.disconnect.mockResolvedValue(undefined);
  });

  it('resolves the client from the session userId, maps videos, and derives a nextCursor when the page is full', async () => {
    const messages = Array.from({ length: 20 }, (_, i) =>
      buildVideoMessage({ id: i + 1 }),
    );
    mockClient.getMessages.mockResolvedValue(messages);

    const result = await callList(buildContext());

    // Per-user client — built from the session userId, never a request-body value.
    expect(getTelegramClient).toHaveBeenCalledWith(USER_ID);
    expect(mockClient.getInputEntity).toHaveBeenCalledWith('-582839764');
    expect(mockClient.getMessages).toHaveBeenCalledWith(
      { resolved: true },
      expect.objectContaining({
        limit: 20,
        offsetId: undefined,
        filter: expect.any(Api.InputMessagesFilterVideo),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.dataObject?.videos).toHaveLength(20);
    expect(result.dataObject?.videos[0]).toMatchObject({
      id: '1',
      filename: 'clip.mp4',
      caption: 'a caption',
      durationSeconds: 42.5,
      sizeBytes: 123456,
      thumbnailDataUri: expect.stringMatching(/^data:image\/jpeg;base64,/),
    });
    expect(result.dataObject?.nextCursor).toBe('20');
    // Connected client is always closed.
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it('omits nextCursor when the page is not full and passes the cursor as offsetId', async () => {
    mockClient.getMessages.mockResolvedValue([buildVideoMessage({ id: 7 })]);

    const result = await callList(buildContext({ cursor: '99' }));

    expect(mockClient.getMessages).toHaveBeenCalledWith(
      { resolved: true },
      expect.objectContaining({ offsetId: 99 }),
    );
    expect(result.dataObject?.nextCursor).toBeUndefined();
  });

  it('skips non-video messages and tolerates thumbnail-download failures', async () => {
    mockClient.getMessages.mockResolvedValue([
      buildVideoMessage({ id: 1 }),
      { id: 2, date: 1_700_000_000, video: undefined },
    ]);
    mockClient.downloadMedia.mockRejectedValueOnce(new Error('thumb boom'));

    const result = await callList(buildContext());

    expect(result.success).toBe(true);
    expect(result.dataObject?.videos).toHaveLength(1);
    expect(result.dataObject?.videos[0].thumbnailDataUri).toBeUndefined();
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it('maps a missing session to the NO_SESSION code so the popup shows the login prompt', async () => {
    vi.mocked(getTelegramClient).mockRejectedValue(
      new TelegramNotAuthenticatedError(USER_ID),
    );

    const result = await callList(buildContext());

    expect(result.success).toBe(false);
    expect(result.message).toBe('NO_SESSION');
    expect(result.dataObject).toBeUndefined();
    // No client was returned, so nothing to disconnect.
    expect(mockClient.disconnect).not.toHaveBeenCalled();
  });

  it('returns a generic failure for an unexpected error and still disconnects', async () => {
    mockClient.getMessages.mockRejectedValue(new Error('mtproto exploded'));

    const result = await callList(buildContext());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to fetch channel videos');
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it('uses each caller their OWN client — no cross-user leakage', async () => {
    const otherUser = '660e8400-e29b-41d4-a716-446655440002';
    mockClient.getMessages.mockResolvedValue([]);

    await callList(buildContext());
    await callList(buildContext({ userId: otherUser }));

    expect(getTelegramClient).toHaveBeenNthCalledWith(1, USER_ID);
    expect(getTelegramClient).toHaveBeenNthCalledWith(2, otherUser);
  });
});
