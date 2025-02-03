import { CloudTasksClient, protos } from '@google-cloud/tasks';
import { envConfig } from './envConfig';
import { v5 as uuidv5 } from 'uuid';
import { uuidNamespaces } from './systemConfig';
import { logger } from './logger';
import { sequelize } from 'src/database';
import { TaskEntityType, TaskStatus, TaskType } from 'src/database/models/task';
import { createTask, updateTaskStatus } from 'src/database/queries/tasks';

let client: CloudTasksClient | null = null;

/**
 * Returns a singleton instance of CloudTasksClient
 * @returns {CloudTasksClient} The Cloud Tasks client instance
 */
const getCloudTasksClient = (): CloudTasksClient => {
  if (!client) {
    client = new CloudTasksClient();
  }
  return client;
};

/**
 * Parameters for creating a Cloud Task
 * @interface CreateCloudTasksParams
 * @property {string} queue - The name of the queue to create the task in
 * @property {string} url - The URL to send the task request to
 * @property {Record<string, any>} [payload] - Optional payload to send with the task
 * @property {number} [inSeconds] - Optional delay in seconds before executing the task
 * @property {Record<string, string>} [headers] - Optional HTTP headers to include with the request
 * @property {TaskEntityType} entityType - The type of entity associated with the task
 * @property {string} entityId - The ID of the entity associated with the task
 * @property {TaskType} type - The type of task to be executed
 */
interface CreateCloudTasksParams {
  queue: string;
  url: string;
  payload?: Record<string, any>;
  inSeconds?: number;
  headers?: Record<string, string>;
  entityType: TaskEntityType;
  entityId: string;
  type: TaskType;
}

type CloudTask = protos.google.cloud.tasks.v2.ITask;

/**
 * Creates a new Cloud Task with the specified parameters
 * @param {CreateCloudTasksParams} params - Parameters for creating the task
 * @returns {Promise<protos.google.cloud.tasks.v2.ITask>} The created task
 * @throws {Error} If required parameters are missing
 */
const createCloudTasks = async (params: CreateCloudTasksParams): Promise<CloudTask | null> => {
  const { projectId, location, cloudTaskServiceAccount } = envConfig;

  if (!projectId || !location || !cloudTaskServiceAccount) {
    throw new Error('Missing cloud tasks configuration');
  }

  const { queue, headers, url, payload, inSeconds, entityType, entityId, type } = params;

  if (!url || !queue) {
    throw new Error('Missing url or queue');
  }

  const client = getCloudTasksClient();
  const parent = client.queuePath(projectId, location, queue);
  const taskId = uuidv5(JSON.stringify({ entityType, entityId, type }), uuidNamespaces.cloudTask);

  const transaction = await sequelize.transaction();

  try {
    const dbTask = await createTask({
      taskId,
      type,
      metadata: payload || {},
      entityType,
      entityId,
      transaction,
    });

    if (dbTask.completed) {
      await transaction.commit();
      return null;
    }

    const cloudTask: CloudTask = {
      name: `${parent}/tasks/${taskId}`,
      httpRequest: {
        headers: {
          'Content-Type': 'application/json',
          'X-Task-ID': taskId,
          ...headers,
        },
        httpMethod: 'POST',
        url,
        oidcToken: {
          serviceAccountEmail: cloudTaskServiceAccount,
          audience: url,
        },
      },
    };

    if (payload) {
      // cloudTask.httpRequest!.body = JSON.stringify(payload);

      try {
        cloudTask.httpRequest!.body = JSON.stringify(payload);
      } catch (error) {
        logger.error({ error, payload }, 'Failed to serialize payload');
        throw new Error('Invalid payload: Failed to serialize to JSON');
      }
    }

    if (inSeconds) {
      cloudTask.scheduleTime = {
        seconds: Math.floor(inSeconds + Date.now() / 1000),
      };
    }

    const request = { parent, task: cloudTask };
    const [response] = await client.createTask(request);

    await updateTaskStatus({
      taskId,
      status: TaskStatus.IN_PROGRESS,
      transaction,
    });
    await transaction.commit();

    return response;
  } catch (error) {
    await transaction.rollback();

    logger.error(
      {
        err: error,
        projectId,
        queue,
        url,
        taskId,
        entityType,
        entityId,
      },
      'Task creation failed'
    );
    throw error;
  }
};

export { CreateCloudTasksParams, createCloudTasks };
