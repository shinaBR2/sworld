import type { Request, Response } from 'express';
import { TaskEntityType, TaskType } from 'src/database/models/task';
import { verifySignature } from 'src/services/videos/convert/validator';
import { createCloudTasks } from 'src/utils/cloud-task';
import { CustomError } from 'src/utils/custom-error';
import { envConfig } from 'src/utils/envConfig';
import { VALIDATION_ERRORS } from 'src/utils/error-codes';
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

vi.mock('src/utils/custom-error', () => ({
  CustomError: {
    high: vi.fn((message, options) => {
      const error = new Error(message);
      Object.assign(error, { options });
      return error;
    }),
  },
}));

vi.mock('src/services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

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

  it('should create cloud task when signature is valid', async () => {
    const result = await crawlHandler(validatedData);

    expect(verifySignature).toHaveBeenCalledWith('test-signature');
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

  it('should throw error when signature verification fails', async () => {
    vi.mocked(verifySignature).mockReturnValue(false);

    await expect(crawlHandler(validatedData)).rejects.toThrow(
      'Invalid signature',
    );

    expect(verifySignature).toHaveBeenCalledWith('test-signature');
    expect(CustomError.high).toHaveBeenCalledWith('Invalid signature', {
      shouldRetry: false,
      errorCode: VALIDATION_ERRORS.INVALID_SIGNATURE,
      context: {
        metadata: validatedData.event.metadata,
        data: validatedData.event.data,
      },
      source: 'apps/gateway/videos/routes/crawl/index.ts',
    });

    expect(createCloudTasks).not.toHaveBeenCalled();
  });

  it('should handle cloud task creation errors', async () => {
    const taskError = new Error('Failed to create task');
    vi.mocked(createCloudTasks).mockRejectedValue(taskError);

    await expect(crawlHandler(validatedData)).rejects.toThrow(
      'Failed to create task',
    );

    expect(verifySignature).toHaveBeenCalledWith('test-signature');
    expect(createCloudTasks).toHaveBeenCalled();
  });
});
