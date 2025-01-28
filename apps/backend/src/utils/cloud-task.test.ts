import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

// Mock modules
const mockCreateTask = vi.fn();
const mockQueuePath = vi.fn();
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@google-cloud/tasks', () => ({
  CloudTasksClient: vi.fn().mockImplementation(() => ({
    createTask: mockCreateTask,
    queuePath: mockQueuePath,
  })),
}));

const mockConfig: {
  projectId: string | null;
  location: string;
  cloudTaskServiceAccount: string;
} = {
  projectId: 'test-project',
  location: 'us-central1',
  cloudTaskServiceAccount: 'cloud-task@email.com',
};

vi.mock('./envConfig', () => ({
  envConfig: mockConfig,
}));

vi.mock('uuid', () => ({
  v5: vi.fn(() => 'mock-uuid'),
}));

vi.mock('./systemConfig', () => ({
  uuidNamespaces: {
    cloudTask: 'test-namespace',
  },
}));

describe('createCloudTasks', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockCreateTask.mockResolvedValue([{ name: 'test-task' }, null, null]);
    mockQueuePath.mockReturnValue(
      'projects/test-project/locations/us-central1/queues/test-queue'
    );
  });

  afterEach(() => {
    // Reset configuration to default state
    mockConfig.projectId = 'test-project';
    mockConfig.location = 'us-central1';
    mockConfig.cloudTaskServiceAccount = 'cloud-task@email.com';
  });

  it('should create a basic task successfully', async () => {
    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
    };

    const { createCloudTasks } = await import('./cloud-task');
    const response = await createCloudTasks(params);

    expect(mockQueuePath).toHaveBeenCalledWith(
      'test-project',
      'us-central1',
      'test-queue'
    );
    expect(mockCreateTask).toHaveBeenCalledWith({
      parent: 'projects/test-project/locations/us-central1/queues/test-queue',
      task: {
        name: 'projects/test-project/locations/us-central1/queues/test-queue/tasks/mock-uuid',
        httpRequest: {
          headers: {
            'Content-Type': 'application/json',
          },
          httpMethod: 'POST',
          url: 'https://test.com',
          oidcToken: {
            serviceAccountEmail: mockConfig.cloudTaskServiceAccount,
            audience: 'https://test.com',
          },
        },
      },
    });
    expect(response).toEqual({ name: 'test-task' });
  });

  it('should handle object payload correctly', async () => {
    const testPayload = {
      data: 'test',
      timestamp: 1234567890,
      type: 'notification',
    };

    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
      payload: testPayload,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await createCloudTasks(params);

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        task: expect.objectContaining({
          httpRequest: expect.objectContaining({
            body: Buffer.from(JSON.stringify(testPayload)).toString('base64'),
          }),
        }),
      })
    );
  });

  it('should handle schedule time correctly', async () => {
    const now = 1000000000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
      inSeconds: 60,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await createCloudTasks(params);

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        task: expect.objectContaining({
          scheduleTime: {
            seconds: Math.floor(60 + now / 1000),
          },
        }),
      })
    );
  });

  it('should handle custom headers', async () => {
    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
      headers: {
        'X-Custom-Header': 'test-value',
      },
    };

    const { createCloudTasks } = await import('./cloud-task');
    await createCloudTasks(params);

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        task: expect.objectContaining({
          httpRequest: expect.objectContaining({
            headers: {
              'Content-Type': 'application/json',
              'X-Custom-Header': 'test-value',
            },
          }),
        }),
      })
    );
  });

  it('should throw error when missing projectId', async () => {
    // Modify the mock configuration
    mockConfig.projectId = null;

    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration'
    );
  });
  it('should throw error when missing location', async () => {
    // Modify the mock configuration
    mockConfig.location = '';

    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration'
    );
  });
  it('should throw error when missing cloud tasks service account', async () => {
    // Modify the mock configuration
    mockConfig.cloudTaskServiceAccount = '';

    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration'
    );
  });

  it('should throw error when missing required parameters', async () => {
    const params = {
      queue: '',
      url: '',
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing url or queue'
    );
  });

  it('should throw error when failed to init task', async () => {
    const params = {
      queue: 'test-queue',
      url: 'https://test.com',
    };

    const { createCloudTasks } = await import('./cloud-task');
    const originalError = new Error('Task creation failed');
    mockCreateTask.mockRejectedValue(new Error('Task creation failed'));
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Failed to init Cloud Tasks'
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: originalError,
        queue: 'test-queue',
        url: 'https://test.com',
      }),
      'Failed to init Cloud Tasks'
    );
  });
});
