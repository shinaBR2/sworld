import type { ImportTelegramArchiveOutput } from 'src/schema/telegram/import';
import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import { computeTaskId, createCloudTasks } from 'src/utils/cloud-task';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { importTelegramArchive } from './index';

const callImport = (context: unknown) =>
  importTelegramArchive(context as any) as Promise<{
    success: boolean;
    message: string;
    dataObject?: ImportTelegramArchiveOutput;
  }>;

vi.mock('src/utils/cloud-task', () => ({
  createCloudTasks: vi.fn(),
  computeTaskId: vi.fn(() => 'task-id-123'),
}));

vi.mock('src/utils/envConfig', () => ({
  envConfig: { ioServiceUrl: 'https://io.example.test' },
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  return { getCurrentLogger: vi.fn(() => mockLogger) };
});

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

const buildContext = (
  overrides: Partial<{
    channelId: string;
    messageIds: string[];
    userId: string;
  }> = {},
) => ({
  validatedData: {
    channelId: overrides.channelId ?? '-582839764',
    messageIds: overrides.messageIds ?? ['3', '1', '2'],
    userId: overrides.userId ?? USER_ID,
  },
});

describe('importTelegramArchive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createCloudTasks).mockResolvedValue(undefined as any);
    vi.mocked(computeTaskId).mockReturnValue('task-id-123');
  });

  it('enqueues a Cloud Task carrying the caller userId and returns its taskId', async () => {
    const result = await callImport(buildContext());

    expect(createCloudTasks).toHaveBeenCalledTimes(1);
    const taskConfig = vi.mocked(createCloudTasks).mock.calls[0][0];
    expect(taskConfig).toMatchObject({
      audience: 'https://io.example.test',
      url: 'https://io.example.test/telegram/import-handler',
      entityType: TaskEntityType.TELEGRAM_ARCHIVE,
      type: TaskType.IMPORT_TELEGRAM,
      payload: {
        data: {
          channelId: '-582839764',
          messageIds: ['3', '1', '2'],
          userId: USER_ID,
        },
      },
    });
    expect(result.success).toBe(true);
    expect(result.dataObject?.taskId).toBe('task-id-123');
  });

  it('derives the idempotency entityId from a SORTED messageId set (order-independent)', async () => {
    await callImport(buildContext({ messageIds: ['3', '1', '2'] }));
    const firstEntityId = vi.mocked(computeTaskId).mock.calls[0][0].entityId;

    vi.mocked(computeTaskId).mockClear();
    await callImport(buildContext({ messageIds: ['1', '2', '3'] }));
    const secondEntityId = vi.mocked(computeTaskId).mock.calls[0][0].entityId;

    expect(firstEntityId).toBe(secondEntityId);
  });

  it('returns an error when the io service URL is missing', async () => {
    const { envConfig } = await import('src/utils/envConfig');
    (envConfig as { ioServiceUrl?: string }).ioServiceUrl = undefined;

    const result = await callImport(buildContext());

    expect(result.success).toBe(false);
    expect(createCloudTasks).not.toHaveBeenCalled();

    (envConfig as { ioServiceUrl?: string }).ioServiceUrl =
      'https://io.example.test';
  });

  it('returns a failure when task creation throws', async () => {
    vi.mocked(createCloudTasks).mockRejectedValue(new Error('queue down'));

    const result = await callImport(buildContext());

    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to create import task');
  });
});
