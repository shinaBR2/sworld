import { nanoid } from 'nanoid';
import type {
  ImportTelegramArchiveOutput,
  ImportTelegramArchiveRequest,
} from 'src/schema/telegram/import';
import {
  TaskEntityType,
  TaskType,
} from 'src/services/hasura/mutations/tasks/constants';
import {
  type CreateCloudTasksParams,
  computeTaskId,
  createCloudTasks,
} from 'src/utils/cloud-task';
import { envConfig } from 'src/utils/envConfig';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { queues, uuidNamespaces } from 'src/utils/systemConfig';
import { v5 as uuidv5 } from 'uuid';

const IO_HANDLER_PATH = '/telegram/import-handler';

const importTelegramArchive = async (
  context: HandlerContext<ImportTelegramArchiveRequest>,
) => {
  const logger = getCurrentLogger();
  const { channelId, messageIds, userId } = context.validatedData;
  const { ioServiceUrl } = envConfig;

  if (!ioServiceUrl) {
    return AppError('Missing io service URL');
  }

  try {
    // Canonicalize once: dedupe + sort so the same logical selection always maps
    // to one idempotency key (['1','2','1'] and ['1','2'] must not diverge), and
    // so we never forward duplicate IDs into the task payload.
    const normalizedMessageIds = [...new Set(messageIds)].sort();
    // Idempotency key covers the exact message selection, not just the
    // channel — re-importing the same channel with a different set of
    // messageIds must NOT be deduped against a prior, unrelated import.
    const entityId = uuidv5(
      JSON.stringify({
        channelId,
        userId,
        messageIds: normalizedMessageIds,
      }),
      uuidNamespaces.cloudTask,
    );
    const taskId = computeTaskId({
      entityType: TaskEntityType.TELEGRAM_ARCHIVE,
      entityId,
      type: TaskType.IMPORT_TELEGRAM,
    });

    const metadata = {
      id: nanoid(),
      spanId: nanoid(),
      traceId: nanoid(),
    };

    const taskConfig: CreateCloudTasksParams = {
      audience: ioServiceUrl,
      // The import runs on the io service (download from Telegram → stream to
      // GCS: light I/O, not ffmpeg), so it shares the existing io queue rather
      // than a dedicated one — same queue the other io handlers use.
      queue: queues.streamVideoQueue,
      payload: {
        data: { channelId, messageIds: normalizedMessageIds, userId },
        metadata,
      },
      url: `${ioServiceUrl}${IO_HANDLER_PATH}`,
      entityId,
      entityType: TaskEntityType.TELEGRAM_ARCHIVE,
      type: TaskType.IMPORT_TELEGRAM,
    };

    await createCloudTasks(taskConfig);

    return AppResponse<ImportTelegramArchiveOutput>(true, 'ok', { taskId });
  } catch (error) {
    logger.error(
      { error, channelId, messageIds },
      '[importTelegramArchive] failed to create task',
    );
    return AppError('Failed to create import task');
  }
};

export { importTelegramArchive };
