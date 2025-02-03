import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Task } from '../models/task';
import { createTask, updateTaskStatus, completeTask } from './tasks';
import { TaskStatus } from '../models/task';

// Mock the Task model
vi.mock('../models/task', () => ({
  Task: {
    findOrCreate: vi.fn(),
    update: vi.fn(),
  },
  TaskStatus: {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
  },
}));

describe('Task Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    const baseTask = {
      taskId: 'test-task-id',
      type: 'test-type',
      metadata: { key: 'value' },
      entityType: 'test-entity',
      entityId: 'test-entity-id',
    };

    it('should throw error if taskId is missing', async () => {
      const { taskId, ...paramsWithoutTaskId } = baseTask;
      await expect(createTask(paramsWithoutTaskId as any)).rejects.toThrow('Missing required fields for task creation');
    });

    it('should throw error if type is missing', async () => {
      const { type, ...paramsWithoutType } = baseTask;
      await expect(createTask(paramsWithoutType as any)).rejects.toThrow('Missing required fields for task creation');
    });

    it('should throw error if metadata is missing', async () => {
      const { metadata, ...paramsWithoutMetadata } = baseTask;
      await expect(createTask(paramsWithoutMetadata as any)).rejects.toThrow(
        'Missing required fields for task creation'
      );
    });

    it('should throw error if entityType is missing', async () => {
      const { entityType, ...paramsWithoutEntityType } = baseTask;
      await expect(createTask(paramsWithoutEntityType as any)).rejects.toThrow(
        'Missing required fields for task creation'
      );
    });

    it('should throw error if entityId is missing', async () => {
      const { entityId, ...paramsWithoutEntityId } = baseTask;
      await expect(createTask(paramsWithoutEntityId as any)).rejects.toThrow(
        'Missing required fields for task creation'
      );
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (Task.findOrCreate as any).mockRejectedValue(mockError);

      await expect(createTask(baseTask)).rejects.toThrow('Database error');
      expect(Task.findOrCreate).toHaveBeenCalledTimes(1);
    });

    it('should create a new task when it does not exist', async () => {
      const mockTask = {
        ...baseTask,
      };

      const mockCreatedTask = {
        ...mockTask,
        status: TaskStatus.PENDING,
        completed: false,
      };

      // Mock findOrCreate to return the task
      (Task.findOrCreate as Mock).mockResolvedValue([mockCreatedTask]);

      const result = await createTask(mockTask);

      expect(Task.findOrCreate).toHaveBeenCalledWith({
        where: {
          taskId: mockTask.taskId,
        },
        defaults: {
          taskId: mockTask.taskId,
          type: mockTask.type,
          entityId: mockTask.entityId,
          entityType: mockTask.entityType,
          metadata: mockTask.metadata,
          status: TaskStatus.PENDING,
          completed: false,
        },
        transaction: undefined,
      });

      expect(result).toEqual(mockCreatedTask);
    });

    it('should create a task with a transaction', async () => {
      const mockTransaction = {} as any;
      const mockTask = {
        ...baseTask,
        transaction: mockTransaction,
      };

      const mockCreatedTask = {
        ...mockTask,
        status: TaskStatus.PENDING,
        completed: false,
      };

      // Mock findOrCreate to return the task
      (Task.findOrCreate as vi.Mock).mockResolvedValue([mockCreatedTask]);

      const result = await createTask(mockTask);

      expect(Task.findOrCreate).toHaveBeenCalledWith({
        where: {
          taskId: mockTask.taskId,
        },
        defaults: {
          taskId: mockTask.taskId,
          type: mockTask.type,
          entityId: mockTask.entityId,
          entityType: mockTask.entityType,
          metadata: mockTask.metadata,
          status: TaskStatus.PENDING,
          completed: false,
        },
        transaction: mockTransaction,
      });

      expect(result).toEqual(mockCreatedTask);
    });
  });

  describe('updateTaskStatus', () => {
    const mockParams = {
      taskId: 'test-task-id',
      status: TaskStatus.COMPLETED,
    };

    it('should update task status', async () => {
      // Mock update to return update result
      (Task.update as Mock).mockResolvedValue([1]); // Simulate one row updated

      const result = await updateTaskStatus(mockParams);

      expect(Task.update).toHaveBeenCalledWith(
        { status: mockParams.status },
        {
          where: { taskId: mockParams.taskId },
          transaction: undefined,
        }
      );

      expect(result).toEqual(1);
    });

    it('should update task status with a transaction', async () => {
      const mockTransaction = {} as any;
      const paramsWithTransaction = { ...mockParams, transaction: mockTransaction };

      // Mock update to return update result
      (Task.update as Mock).mockResolvedValue([1]); // Simulate one row updated

      const result = await updateTaskStatus(paramsWithTransaction);

      expect(Task.update).toHaveBeenCalledWith(
        { status: paramsWithTransaction.status },
        {
          where: { taskId: paramsWithTransaction.taskId },
          transaction: mockTransaction,
        }
      );

      expect(result).toEqual(1);
    });

    it('should throw error when task is not found', async () => {
      (Task.update as Mock).mockResolvedValue([0]);

      await expect(updateTaskStatus(mockParams)).rejects.toThrow(`Task with ID ${mockParams.taskId} not found`);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');
      (Task.update as Mock).mockRejectedValue(mockError);

      await expect(updateTaskStatus(mockParams)).rejects.toThrow('Database error');
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed', async () => {
      const taskId = 'test-task-id';

      // Mock update to return update result
      (Task.update as Mock).mockResolvedValue([1]); // Simulate one row updated

      const result = await completeTask(taskId);

      expect(Task.update).toHaveBeenCalledWith(
        {
          status: TaskStatus.COMPLETED,
          completed: true,
        },
        {
          where: { taskId },
          transaction: undefined,
        }
      );

      expect(result).toEqual([1]);
    });

    it('should mark task as completed with a transaction', async () => {
      const taskId = 'test-task-id';
      const mockTransaction = {} as any;

      // Mock update to return update result
      (Task.update as Mock).mockResolvedValue([1]); // Simulate one row updated

      const result = await completeTask(taskId, mockTransaction);

      expect(Task.update).toHaveBeenCalledWith(
        {
          status: TaskStatus.COMPLETED,
          completed: true,
        },
        {
          where: { taskId },
          transaction: mockTransaction,
        }
      );

      expect(result).toEqual([1]);
    });
  });
});
