import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';
import '../database/__mocks__/sequelize';

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

vi.mock('src/database', () => ({
  sequelize: {
    transaction: vi.fn().mockImplementation(() => ({
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

vi.mock('src/database/queries/tasks', () => ({
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
  let sequelize: any;

  const basePayload = {
    data: 'test',
  };
  const baseParams = {
    queue: 'test-queue',
    url: 'https://test.com',
    entityType: 'video',
    entityId: '123',
    type: 'process',
    payload: basePayload,
  };

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockCreateTask.mockResolvedValue([{ name: 'test-task' }, null, null]);
    mockQueuePath.mockReturnValue('projects/test-project/locations/us-central1/queues/test-queue');

    const tasksModule = await import('src/database/queries/tasks');
    const dbModule = await import('src/database');
    dbCreateTask = tasksModule.createTask;
    dbUpdateStatus = tasksModule.updateTaskStatus;
    sequelize = dbModule.sequelize;

    dbCreateTask.mockReset();
    dbUpdateStatus.mockReset();
    sequelize.transaction.mockClear();
  });

  afterEach(() => {
    // Reset configuration to default state
    mockConfig.projectId = 'test-project';
    mockConfig.location = 'us-central1';
    mockConfig.cloudTaskServiceAccount = 'cloud-task@email.com';
  });

  it('should create a basic task successfully', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
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
      type: 'process',
      metadata: testPayload,
      entityType: 'video',
      entityId: '123',
      transaction,
    });

    expect(mockQueuePath).toHaveBeenCalledWith('test-project', 'us-central1', 'test-queue');
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
      },
    });

    expect(dbUpdateStatus).toHaveBeenCalledWith({
      taskId: 'mock-uuid',
      status: 'in_progress',
      transaction,
    });

    expect(transaction.commit).toHaveBeenCalled();
    expect(response).toEqual({ name: 'test-task' });
  });

  it('should return null if task already exists and is completed', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: true });

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    const response = await createCloudTasks(params);

    expect(response).toBeNull();
    expect(transaction.commit).toHaveBeenCalled();
    expect(mockCreateTask).not.toHaveBeenCalled();
    expect(dbUpdateStatus).not.toHaveBeenCalled();
  });

  it('should rollback transaction if cloud task creation fails', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    mockCreateTask.mockRejectedValue(new Error('Cloud task error'));

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow();

    expect(transaction.rollback).toHaveBeenCalled();
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(dbUpdateStatus).not.toHaveBeenCalled();
  });

  it('should rollback transaction if database update fails', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockRejectedValue(new Error('DB update error'));

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow();

    expect(transaction.rollback).toHaveBeenCalled();
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  it('should handle object payload correctly', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
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
      })
    );
  });

  it('should handle schedule time correctly', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
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
      })
    );
  });

  it('should handle custom headers', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
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
      })
    );
  });

  it('should throw error when missing projectId', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.projectId = null;

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow('Missing cloud tasks configuration');
  });

  it('should throw error when missing location', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.location = '';

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow('Missing cloud tasks configuration');
  });

  it('should throw error when missing cloud tasks service account', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    // Modify the mock configuration
    mockConfig.cloudTaskServiceAccount = '';

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    await expect(createCloudTasks(params)).rejects.toThrow('Missing cloud tasks configuration');
  });

  it('should throw error when missing required parameters', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      queue: '',
      url: '',
    };

    const { createCloudTasks } = await import('./cloud-task');
    // @ts-expect-error
    await expect(createCloudTasks(params)).rejects.toThrow('Missing url or queue');
  });

  it('should throw error when failed to init task', async () => {
    const transaction = { commit: vi.fn(), rollback: vi.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    dbCreateTask.mockResolvedValue({ completed: false });
    dbUpdateStatus.mockResolvedValue({});

    const params = {
      ...baseParams,
    };

    const { createCloudTasks } = await import('./cloud-task');
    const originalError = new Error('Task creation failed');
    mockCreateTask.mockRejectedValue(new Error('Task creation failed'));
    await expect(createCloudTasks(params)).rejects.toThrow('Task creation failed');
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        err: originalError,
        queue: 'test-queue',
        url: 'https://test.com',
      }),
      'Task creation failed'
    );
  });
});
