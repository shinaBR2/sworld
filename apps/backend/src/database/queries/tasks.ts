import { Task, TaskStatus } from '../models/task';
import { Transaction } from 'sequelize';

interface CreateTaskParams {
  taskId: string;
  type: string;
  metadata: Record<string, unknown>;
  entityType: string;
  entityId: string;
  transaction?: Transaction;
}

const createTask = async ({ taskId, type, metadata, entityType, entityId, transaction }: CreateTaskParams) => {
  if (!taskId || !type || !metadata || !entityType || !entityId) {
    throw new Error('Missing required fields for task creation');
  }

  const [task] = await Task.findOrCreate({
    where: { taskId },
    defaults: {
      taskId,
      type,
      metadata,
      entityId,
      entityType,
      status: TaskStatus.PENDING,
      completed: false,
    },
    transaction,
  });

  return task;
};

interface UpdateTaskParams {
  taskId: string;
  status: TaskStatus;
  transaction?: Transaction;
}

const updateTaskStatus = async ({ taskId, status, transaction }: UpdateTaskParams) => {
  const [updatedCount] = await Task.update(
    { status },
    {
      where: { taskId },
      transaction,
    }
  );

  if (updatedCount === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  return updatedCount;
};

interface CompleteTaskParams {
  taskId: string;
  transaction?: Transaction;
}

const completeTask = async ({ taskId, transaction }: CompleteTaskParams) => {
  const [updatedCount] = await Task.update(
    {
      status: TaskStatus.COMPLETED,
      completed: true,
    },
    {
      where: { taskId },
      transaction,
    }
  );

  if (updatedCount === 0) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  return updatedCount;
};

export { createTask, updateTaskStatus, completeTask };
