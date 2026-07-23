import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock modules
const mockCreateTask = vi.fn();
const mockQueuePath = vi.fn();
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  level: 'info',
  fatal: vi.fn(),
  trace: vi.fn(),
  silent: vi.fn(),
};

vi.mock('./logger', () => ({
  getCurrentLogger: vi.fn(() => mockLogger),
}));

vi.mock('@google-cloud/tasks', () => ({
  CloudTasksClient: vi.fn(
    class {
      constructor() {
        return {
          createTask: mockCreateTask,
          queuePath: mockQueuePath,
        };
      }
    },
  ),
}));

vi.mock('src/services/hasura/mutations/tasks', () => ({
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
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
  let dbCreateTask: any;
  let dbUpdateStatus: any;

  const basePayload = {
    data: 'test',
  };
  const baseParams = {
    queue: 'test-queue',
    audience: 'https://test.com',
    url: 'https://test.com',
    entityType: TaskEntityType.VIDEO,
    entityId: '123',
    type: TaskType.CONVERT,
    payload: basePayload,
  };

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockCreateTask.mockResolvedValue([{ name: 'test-task' }, null, null]);
    mockQueuePath.mockReturnValue(
      'projects/test-project/locations/us-central1/queues/test-queue',
    );

    const tasksModule = await import('src/services/hasura/mutations/tasks');
    dbCreateTask = tasksModule.createTask;
    dbUpdateStatus = tasksModule.updateTaskStatus;

    dbCreateTask.mockReset();
    dbUpdateStatus.mockReset();
  });

  afterEach(() => {
    // Reset configuration to default state
    mockConfig.projectId = 'test-project';
    mockConfig.location = 'us-central1';
    mockConfig.cloudTaskServiceAccount = 'cloud-task@email.com';
  });

  it('should create a basic task successfully', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const testPayload = {
      ...basePayload,
    };
    const params = {
      ...baseParams,
      payload: testPayload,
    };

    const { createCloudTasks } = await import('./cloud-task');
    const response = await createCloudTasks(params);

    expect(dbCreateTask).toHaveBeenCalledWith({
      taskId: 'mock-uuid',
      type: TaskType.CONVERT,
      metadata: testPayload,
      entityType: 'video',
      entityId: '123',
    });

    expect(mockQueuePath).toHaveBeenCalledWith(
      'test-project',
      'us-central1',
      'test-queue',
    );
    expect(mockCreateTask).toHaveBeenCalledWith({
      parent: 'projects/test-project/locations/us-central1/queues/test-queue',
      task: {
        name: 'projects/test-project/locations/us-central1/queues/test-queue/tasks/mock-uuid',
        httpRequest: {
          headers: {
            'Content-Type': 'application/json',
            'X-Task-ID': 'mock-uuid',
          },
          httpMethod: 'POST',
          url: 'https://test.com',
          oidcToken: {
            serviceAccountEmail: mockConfig.cloudTaskServiceAccount,
            audience: 'https://test.com',
          },
          body: Buffer.from(JSON.stringify(testPayload)).toString('base64'),
        },
        dispatchDeadline: {
          seconds: 1800,
        },
      },
    });

    expect(dbUpdateStatus).toHaveBeenCalledWith({
      taskId: 'mock-uuid',
      status: 'in_progress',
    });

    expect(response).toEqual({ name: 'test-task' });
  });

  it('should return null if task already exists and is completed', async () => {
    dbCreateTask.mockResolvedValue({ completed: true });

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    const response = await createCloudTasks(params);

    expect(response).toBeNull();
    expect(mockCreateTask).not.toHaveBeenCalled();
    expect(dbUpdateStatus).not.toHaveBeenCalled();
  });

  it('should throw and skip the status update if cloud task creation fails', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    mockCreateTask.mockRejectedValue(new Error('Cloud task error'));

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow();

    expect(dbUpdateStatus).not.toHaveBeenCalled();
  });

  it('should throw if the status update fails', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockRejectedValue(new Error('Status update error'));

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow();
  });

  it('should handle object payload correctly', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const testPayload = {
      ...basePayload,
      timestamp: 1234567890,
      type: 'notification',
    };

    const params = {
      ...baseParams,
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
      }),
    );
  });

  it('should handle schedule time correctly', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const now = 1000000000000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    const params = {
      ...baseParams,
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
      }),
    );
  });

  it('should handle custom headers', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      ...baseParams,
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
              'X-Task-ID': 'mock-uuid',
            },
          }),
        }),
      }),
    );
  });

  it('should throw error when missing projectId', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.projectId = null;

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration',
    );
  });

  it('should throw error when missing location', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.location = '';

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration',
    );
  });

  it('should throw error when missing cloud tasks service account', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.cloudTaskServiceAccount = '';

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing cloud tasks configuration',
    );
  });

  it('should throw error when missing required parameters', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      queue: '',
      url: '',
      audience: '',
    };

    const { createCloudTasks } = await import('./cloud-task');
    // @ts-expect-error
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Missing url or queue or target handler',
    );
  });

  it('should throw error when failed to stringify payload', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const payload: any = { key: 'value' };
    payload.circular = payload;
    const params = {
      ...baseParams,
      payload,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Invalid payload: Failed to serialize to JSON',
    );
  });

  it('should throw error when failed to init task', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    const originalError = new Error('Task creation failed');
    mockCreateTask.mockRejectedValue(new Error('Task creation failed'));
    await expect(createCloudTasks(params)).rejects.toThrow(
      'Task creation failed',
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: originalError,
        queue: 'test-queue',
        url: 'https://test.com',
      }),
      'Task creation failed',
    );
  });

  it('should set the dispatch deadline to 1800 seconds', async () => {
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await createCloudTasks(params);

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        task: expect.objectContaining({
          dispatchDeadline: {
            seconds: 1800,
          },
        }),
      }),
    );
  });
});

describe('computeTaskId', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('hashes (entityType, entityId, type) under the cloudTask namespace', async () => {
    const { v5 } = await import('uuid');
    const { computeTaskId } = await import('./cloud-task');

    const taskId = computeTaskId({
      entityType: TaskEntityType.TELEGRAM_ARCHIVE,
      entityId: 'entity-1',
      type: TaskType.IMPORT_TELEGRAM,
    });

    expect(taskId).toBe('mock-uuid');
    expect(v5).toHaveBeenCalledWith(
      JSON.stringify({
        entityType: TaskEntityType.TELEGRAM_ARCHIVE,
        entityId: 'entity-1',
        type: TaskType.IMPORT_TELEGRAM,
      }),
      'test-namespace',
    );
  });
});
