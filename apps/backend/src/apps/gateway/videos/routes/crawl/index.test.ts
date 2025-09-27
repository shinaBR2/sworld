import { TaskEntityType, TaskType } from 'src/database/models/task';
import { verifySignature } from 'src/services/videos/convert/validator';
import { createCloudTasks } from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { logger } from 'src/utils/logger';
import { queues } from 'src/utils/systemConfig';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crawlHandler } from './index';

vi.mock('src/utils/schema', () => ({
  AppResponse: vi.fn((success, message, data) => ({ success, message, data })),
}));

vi.mock('src/utils/cloud-task', () => ({
  createCloudTasks: vi.fn(),
}));

vi.mock('src/services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
}));

vi.mock('src/utils/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  return {
    logger: mockLogger,
    getCurrentLogger: vi.fn(() => mockLogger),
  };
});

vi.mock('src/utils/systemConfig', () => ({
  queues: {
    streamVideoQueue: 'stream-video',
  },
}));

// Add this mock after other mocks
vi.mock('src/utils/error-codes', () => ({
  VALIDATION_ERRORS: {
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  },
}));

describe('crawl', () => {
  let validatedData: any;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(envConfig).ioServiceUrl = 'http://test-io-service';
    vi.mocked(verifySignature).mockReturnValue(true);
    vi.mocked(createCloudTasks).mockResolvedValue({ taskId: 'test-task' });

    validatedData = {
      signatureHeader: 'test-signature',
      event: {
        data: { id: 'test-video' },
        metadata: { id: 'test-event' },
      },
    };
  });

  it('should create cloud task', async () => {
    const result = await crawlHandler({ validatedData });

    expect(createCloudTasks).toHaveBeenCalledWith({
      audience: 'http://test-io-service',
      queue: queues.streamVideoQueue,
      payload: validatedData.event,
      url: 'http://test-io-service/crawlers/crawl-handler',
      entityId: 'test-video',
      entityType: TaskEntityType.CRAWL_VIDEO,
      type: TaskType.CRAWL,
    });

    expect(logger.info).toHaveBeenCalledWith(
      {
        metadata: validatedData.event.metadata,
        task: { taskId: 'test-task' },
      },
      'Crawl task created successfully',
    );

    expect(result).toEqual({
      success: true,
      message: 'ok',
    });
  });

  it('should handle cloud task creation errors', async () => {
    const taskError = new Error('Failed to create task');
    vi.mocked(createCloudTasks).mockRejectedValue(taskError);

    await expect(crawlHandler({ validatedData })).rejects.toThrow(
      'Failed to create task',
    );

    expect(createCloudTasks).toHaveBeenCalled();
  });
});
