import { CloudTasksClient, protos } from '@google-cloud/tasks';
import { envConfig } from './envConfig';
import { v5 as uuidv5 } from 'uuid';
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
 * @property {string} url - The URL to send the task request to
 * @property {Record<string, any>} [payload] - Optional payload to send with the task
 * @property {number} [inSeconds] - Optional delay in seconds before executing the task
 * @property {Record<string, string>} [headers] - Optional HTTP headers to include with the request
 */
interface CreateCloudTasksParams {
  queue: string;
  url: string;
  payload?: Record<string, any>;
  inSeconds?: number;
  headers?: Record<string, string>;
}

type Task = protos.google.cloud.tasks.v2.ITask;

/**
 * Creates a new Cloud Task with the specified parameters
 * @param {CreateCloudTasksParams} params - Parameters for creating the task
 * @returns {Promise<protos.google.cloud.tasks.v2.ITask>} The created task
 * @throws {Error} If required parameters are missing
 */
const createCloudTasks = async (
  params: CreateCloudTasksParams
): Promise<protos.google.cloud.tasks.v2.ITask> => {
  const projectId = envConfig.projectId;
  const location = envConfig.location;

  if (!projectId || !location) {
    throw new Error('Missing projectId or location');
  }

  const { queue, headers, url, payload, inSeconds } = params;

  if (!url || !queue) {
    throw new Error('Missing url or queue');
  }

  const client = getCloudTasksClient();
  const parent = client.queuePath(projectId, location, queue);
  const taskId = uuidv5(
    JSON.stringify({
      url,
      payload,
      queue,
    }),
    uuidNamespaces.cloudTask
  );

  const task: Task = {
    name: `${parent}/tasks/${taskId}`,
    httpRequest: {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      httpMethod: 'POST',
      url,
    },
  };

  if (payload) {
    task.httpRequest!.body = Buffer.from(JSON.stringify(payload)).toString(
      'base64'
    );
  }

  if (inSeconds) {
    task.scheduleTime = {
      seconds: Math.floor(inSeconds + Date.now() / 1000),
    };
  }

  const request = { parent, task };
  try {
    const [response] = await client.createTask(request);
    return response;
  } catch (error) {
    throw new Error('Failed to init Cloud Tasks');
  }
};

export { createCloudTasks };
