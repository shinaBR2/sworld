import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { TaskStatus } from './constants';
import { completeTask, createTask, updateTaskStatus } from './index';

vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

const baseParams = {
  taskId: 'task-1',
  type: 'fix_duration',
  metadata: { id: 'video-1' },
  entityType: 'video',
  entityId: 'video-1',
};

describe('createTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts the task with the mapped columns', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      insert_tasks_one: { id: 'row-1', completed: false },
    });

    await createTask(baseParams);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation CreateTask'),
      variables: {
        object: {
          task_id: baseParams.taskId,
          type: baseParams.type,
          metadata: baseParams.metadata,
          entity_id: baseParams.entityId,
          entity_type: baseParams.entityType,
          status: TaskStatus.PENDING,
          completed: false,
        },
      },
    });
  });

  it('returns the inserted/existing row (including completed)', async () => {
    const row = { id: 'row-1', completed: true };
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      insert_tasks_one: row,
    });

    const result = await createTask(baseParams);

    expect(result).toEqual(row);
  });

  it('throws when a required field is missing', async () => {
    await expect(createTask({ ...baseParams, entityId: '' })).rejects.toThrow(
      'Missing required fields for task creation',
    );
    expect(hasuraClient.request).not.toHaveBeenCalled();
  });
});

describe('updateTaskStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates status and returns affected rows', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_tasks: { affected_rows: 1 },
    });

    const result = await updateTaskStatus({
      taskId: 'task-1',
      status: TaskStatus.IN_PROGRESS,
    });

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation UpdateTaskStatus'),
      variables: { taskId: 'task-1', status: TaskStatus.IN_PROGRESS },
    });
    expect(result).toBe(1);
  });

  it('throws when no task matched', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_tasks: { affected_rows: 0 },
    });

    await expect(
      updateTaskStatus({ taskId: 'missing', status: TaskStatus.COMPLETED }),
    ).rejects.toThrow('Task with ID missing not found');
  });
});

describe('completeTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes the task and returns affected rows', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_tasks: { affected_rows: 1 },
    });

    const result = await completeTask({ taskId: 'task-1' });

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation CompleteTask'),
      variables: { taskId: 'task-1' },
    });
    expect(result).toBe(1);
  });

  it('throws when no task matched', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_tasks: { affected_rows: 0 },
    });

    await expect(completeTask({ taskId: 'missing' })).rejects.toThrow(
      'Task with ID missing not found',
    );
  });
});
