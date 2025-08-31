import { CloudTasksClient, type protos } from '@google-cloud/tasks';
import { sequelize } from 'src/database';
import {
  type TaskEntityType,
  TaskStatus,
  type TaskType,
} from 'src/database/models/task';
import { createTask, updateTaskStatus } from 'src/database/queries/tasks';
import { v5 as uuidv5 } from 'uuid';
import { envConfig } from './envConfig';
import { logger } from './logger';
import { uuidNamespaces } from './systemConfig';

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
 * @property {string} audience - The HTTP target handler base URL
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
  audience: string;
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
const createCloudTasks = async (
  params: CreateCloudTasksParams,
): Promise<CloudTask | null> => {
  const { projectId, location, cloudTaskServiceAccount } = envConfig;

  if (!projectId || !location || !cloudTaskServiceAccount) {
    throw new Error('Missing cloud tasks configuration');
  }

  const {
    queue,
    audience,
    headers,
    url,
    payload,
    inSeconds,
    entityType,
    entityId,
    type,
  } = params;

  if (!url || !queue || !audience) {
    throw new Error('Missing url or queue or target handler');
  }

  const client = getCloudTasksClient();
  const parent = client.queuePath(projectId, location, queue);
  const taskId = uuidv5(
    JSON.stringify({ entityType, entityId, type }),
    uuidNamespaces.cloudTask,
  );

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

    // This is should be ts-ignore but not sure
    // why it auto format to ts-expect-error
    // @ts-expect-error
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
          audience,
        },
      },
      dispatchDeadline: {
        seconds: 1800,
      },
    };

    if (payload) {
      try {
        // biome-ignore lint/style/noNonNullAssertion: fix later
        cloudTask.httpRequest!.body = Buffer.from(
          JSON.stringify(payload),
        ).toString('base64');
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
      'Task creation failed',
    );
    throw error;
  }
};

export { type CreateCloudTasksParams, createCloudTasks };
