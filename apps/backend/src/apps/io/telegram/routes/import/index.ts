import { Readable } from 'node:stream';
import type { TelegramImportHandlerRequest } from 'src/schema/telegram/task-payload';
import { completeTask } from 'src/services/hasura/mutations/tasks';
import { getTelegramClient } from 'src/services/telegram/client';
import {
  fileExists,
  getDownloadUrl,
  streamFile,
} from 'src/services/videos/helpers/gcp-cloud-storage';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';
import { Api, type TelegramClient } from 'teleproto';

const STORAGE_ROOT = 'telegram-archive';
const DEFAULT_VIDEO_MIME = 'video/mp4';
// Filename used when a message's video document carries no filename attribute.
const FALLBACK_FILENAME = 'video.mp4';

/**
 * Stable, filesystem-safe slug for the channel segment of the storage path.
 * Derived from `channelId` (not the channel title) because the id is the stable
 * identity carried end-to-end from list → import — a title could change between
 * runs and break idempotency. Lowercased, non-alphanumerics collapsed to '-'.
 */
const toChannelSlug = (channelId: string): string =>
  channelId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'channel';

const filenameOf = (video: Api.Document): string => {
  const filenameAttr = video.attributes.find(
    (attr): attr is Api.DocumentAttributeFilename =>
      attr instanceof Api.DocumentAttributeFilename,
  );
  return filenameAttr?.fileName ?? FALLBACK_FILENAME;
};

/**
 * io Cloud Task handler for a Telegram archive import (SWO-495). Downloads each
 * selected message's video and uploads it to GCS under
 * `telegram-archive/<userId>/<channelSlug>/<messageId>-<filename>`.
 *
 * Runs against the TRIGGERING user's own Telegram credentials — `userId` comes
 * from the task payload, which SWO-494's gateway `import` route stamped from the
 * caller's session (never the request body), so this handler can only ever act
 * as that user. Deliberately NOT wrapped in `withVideoFailureReport`: that is
 * scoped to video-entity handlers (`markVideoFailed`), and there is no video row
 * here. On any failure we log and re-throw so the thrown 5xx lets Cloud Tasks
 * retry, rather than silently swallowing. Re-runs are idempotent: a file already
 * in GCS is skipped, so a retry after a partial upload only does the missing work.
 */
const importTelegramArchiveHandler = async (
  context: HandlerContext<TelegramImportHandlerRequest>,
) => {
  const logger = getCurrentLogger();
  const { body, headers } = context.validatedData;
  const { data, metadata } = body;
  const taskId = headers['x-task-id'];
  const { channelId, messageIds, userId } = data;

  logger.info(
    { ...metadata, taskId, channelId, count: messageIds.length },
    '[telegram/import-handler] start',
  );

  // Per-user client (SWO-491): returned already connected, we own disconnect().
  let client: TelegramClient | undefined;
  try {
    const connected = await getTelegramClient(userId);
    client = connected;

    const entity = await connected.getInputEntity(channelId);
    const messages = await connected.getMessages(entity, {
      ids: messageIds.map(Number),
    });

    const channelSlug = toChannelSlug(channelId);
    let uploaded = 0;
    let skipped = 0;

    for (const message of messages) {
      const video = message?.video;
      if (!video) {
        // A requested id that isn't a video (deleted, or a non-video message).
        logger.warn(
          { taskId, messageId: message?.id },
          '[telegram/import-handler] skipping message with no video',
        );
        continue;
      }

      const filename = filenameOf(video);
      const storagePath = `${STORAGE_ROOT}/${userId}/${channelSlug}/${message.id}-${filename}`;

      if (await fileExists(storagePath)) {
        skipped += 1;
        logger.info(
          { taskId, storagePath },
          '[telegram/import-handler] already uploaded, skipping',
        );
        continue;
      }

      const media = await connected.downloadMedia(message);
      if (!Buffer.isBuffer(media)) {
        // downloadMedia returns undefined/string only when there's nothing to
        // pull — treat as nothing to upload rather than a hard failure.
        logger.warn(
          { taskId, messageId: message.id },
          '[telegram/import-handler] no media bytes for message',
        );
        continue;
      }

      await streamFile({
        stream: Readable.from(media),
        storagePath,
        options: { contentType: video.mimeType ?? DEFAULT_VIDEO_MIME },
      });
      uploaded += 1;
      logger.info(
        { taskId, storagePath, url: getDownloadUrl(storagePath) },
        '[telegram/import-handler] uploaded',
      );
    }

    await completeTask({ taskId });

    logger.info(
      { taskId, uploaded, skipped },
      '[telegram/import-handler] done',
    );
    return AppResponse(true, 'ok', { uploaded, skipped });
  } catch (error) {
    // Re-throw so Cloud Tasks retries (the whole run is idempotent). No
    // withVideoFailureReport / task 'failed' state here — that's video-only.
    logger.error(
      { error, taskId, channelId },
      '[telegram/import-handler] import failed',
    );
    throw error;
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
    }
  }
};

export { importTelegramArchiveHandler };
