import { completeTask } from 'src/services/hasura/mutations/tasks';
import {
  fileExists,
  streamFile,
} from 'src/services/videos/helpers/gcp-cloud-storage';
import { getTelegramClient } from 'src/services/telegram/client';
import { Api } from 'teleproto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importTelegramArchiveHandler } from './index';

vi.mock('src/services/telegram/client', () => ({
  getTelegramClient: vi.fn(),
}));

vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  fileExists: vi.fn(),
  streamFile: vi.fn(),
  getDownloadUrl: vi.fn((p: string) => `https://cdn.test/${p}`),
}));

vi.mock('src/services/hasura/mutations/tasks', () => ({
  completeTask: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const TASK_ID = '9f8b7c6d-0000-4a1b-8c2d-1e2f3a4b5c6d';
const CHANNEL_ID = '-582839764';

const mockClient = {
  getInputEntity: vi.fn(),
  getMessages: vi.fn(),
  downloadMedia: vi.fn(),
  disconnect: vi.fn(),
};

const buildVideoMessage = (id: number, fileName = 'clip.mp4') => ({
  id,
  video: {
    mimeType: 'video/mp4',
    attributes: [new Api.DocumentAttributeFilename({ fileName })],
  },
});

const buildContext = (
  overrides: Partial<{
    channelId: string;
    messageIds: string[];
    userId: string;
    taskId: string;
  }> = {},
) => ({
  validatedData: {
    headers: { 'x-task-id': overrides.taskId ?? TASK_ID },
    body: {
      data: {
        channelId: overrides.channelId ?? CHANNEL_ID,
        messageIds: overrides.messageIds ?? ['10', '11'],
        userId: overrides.userId ?? USER_ID,
      },
      metadata: { id: 'evt-1', spanId: 's1', traceId: 't1' },
    },
  },
});

const call = (context: unknown) =>
  importTelegramArchiveHandler(context as any) as Promise<{
    success: boolean;
    message: string;
    dataObject?: { uploaded: number; skipped: number };
  }>;

describe('importTelegramArchiveHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTelegramClient).mockResolvedValue(mockClient as any);
    mockClient.getInputEntity.mockResolvedValue({ resolved: true });
    mockClient.downloadMedia.mockResolvedValue(Buffer.from('video-bytes'));
    mockClient.disconnect.mockResolvedValue(undefined);
    vi.mocked(fileExists).mockResolvedValue(false);
    vi.mocked(streamFile).mockResolvedValue(undefined as any);
    vi.mocked(completeTask).mockResolvedValue(1 as any);
  });

  it('downloads each video, uploads to the per-user channel path, and completes the task', async () => {
    mockClient.getMessages.mockResolvedValue([
      buildVideoMessage(10, 'first.mp4'),
      buildVideoMessage(11, 'second.mp4'),
    ]);

    const result = await call(buildContext());

    // Client is resolved from the task's userId and asked for exactly these ids.
    expect(getTelegramClient).toHaveBeenCalledWith(USER_ID);
    expect(mockClient.getInputEntity).toHaveBeenCalledWith(CHANNEL_ID);
    expect(mockClient.getMessages).toHaveBeenCalledWith(
      { resolved: true },
      { ids: [10, 11] },
    );

    // Uploaded to telegram-archive/<userId>/<channelSlug>/<messageId>-<filename>.
    expect(streamFile).toHaveBeenCalledTimes(2);
    const paths = vi.mocked(streamFile).mock.calls.map((c) => c[0].storagePath);
    expect(paths).toEqual([
      `telegram-archive/${USER_ID}/582839764/10-first.mp4`,
      `telegram-archive/${USER_ID}/582839764/11-second.mp4`,
    ]);
    expect(vi.mocked(streamFile).mock.calls[0][0].options).toMatchObject({
      contentType: 'video/mp4',
    });

    expect(completeTask).toHaveBeenCalledWith({ taskId: TASK_ID });
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
    expect(result.dataObject).toEqual({ uploaded: 2, skipped: 0 });
  });

  it('skips files already in storage (idempotent re-run) without re-downloading', async () => {
    mockClient.getMessages.mockResolvedValue([
      buildVideoMessage(10),
      buildVideoMessage(11),
    ]);
    vi.mocked(fileExists).mockResolvedValueOnce(true); // first already uploaded

    const result = await call(buildContext());

    expect(mockClient.downloadMedia).toHaveBeenCalledTimes(1); // only the second
    expect(streamFile).toHaveBeenCalledTimes(1);
    expect(completeTask).toHaveBeenCalledWith({ taskId: TASK_ID });
    expect(result.dataObject).toEqual({ uploaded: 1, skipped: 1 });
  });

  it('skips a requested message that has no video', async () => {
    mockClient.getMessages.mockResolvedValue([
      buildVideoMessage(10),
      { id: 11, video: undefined },
    ]);

    const result = await call(buildContext());

    expect(streamFile).toHaveBeenCalledTimes(1);
    expect(result.dataObject).toEqual({ uploaded: 1, skipped: 0 });
    expect(completeTask).toHaveBeenCalledTimes(1);
  });

  it('uses each caller their OWN credentials — no cross-user leakage', async () => {
    const otherUser = '660e8400-e29b-41d4-a716-446655440002';
    mockClient.getMessages.mockResolvedValue([]);

    await call(buildContext());
    await call(buildContext({ userId: otherUser }));

    expect(getTelegramClient).toHaveBeenNthCalledWith(1, USER_ID);
    expect(getTelegramClient).toHaveBeenNthCalledWith(2, otherUser);
  });

  it('re-throws on upload failure (so Cloud Tasks retries) and does NOT complete the task', async () => {
    mockClient.getMessages.mockResolvedValue([buildVideoMessage(10)]);
    vi.mocked(streamFile).mockRejectedValue(new Error('gcs down'));

    await expect(call(buildContext())).rejects.toThrow('gcs down');

    expect(completeTask).not.toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1); // still cleaned up
  });

  it('falls back to a default filename when the video has no filename attribute', async () => {
    mockClient.getMessages.mockResolvedValue([
      { id: 10, video: { mimeType: 'video/mp4', attributes: [] } },
    ]);

    await call(buildContext({ messageIds: ['10'] }));

    expect(vi.mocked(streamFile).mock.calls[0][0].storagePath).toBe(
      `telegram-archive/${USER_ID}/582839764/10-video.mp4`,
    );
  });

  it('sanitizes an attacker-influenced filename so it stays inside the user prefix', async () => {
    mockClient.getMessages.mockResolvedValue([
      {
        id: 10,
        video: {
          mimeType: 'video/mp4',
          attributes: [
            new Api.DocumentAttributeFilename({
              fileName: '../../etc/passwd\n.mp4',
            }),
          ],
        },
      },
    ]);

    await call(buildContext({ messageIds: ['10'] }));

    // Path components dropped (basename), unsafe chars replaced, leading dots
    // stripped — the key still begins with the user's prefix.
    const path = vi.mocked(streamFile).mock.calls[0][0].storagePath;
    expect(path).toBe(`telegram-archive/${USER_ID}/582839764/10-passwd_.mp4`);
    expect(path.startsWith(`telegram-archive/${USER_ID}/`)).toBe(true);
  });
});
