import { pipeline } from 'node:stream/promises';
import { Storage } from '@google-cloud/storage';
import type { RepairFmp4HandlerRequest } from 'src/schema/videos/repair-fmp4-handler';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { buildFfmpegRepackage } from 'src/services/videos/processing/ffmpegRepackageAdapter';
import { planReprocess } from 'src/services/videos/processing/planReprocess';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import type { RepackageDeps } from 'src/services/videos/processing/types';
import { CustomError } from 'src/utils/custom-error';
import { envConfig } from 'src/utils/envConfig';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

// ffmpeg resolves from PATH — apt-installed (>= 7) in the compute image (SWO-633).

const SOURCE = 'apps/compute/videos/routes/repair-fmp4/index.ts';

const buildRepairDeps = (
  bucket: ReturnType<Storage['bucket']>,
): RepackageDeps => ({
  storage: {
    uploadStream: ({ stream, storagePath, contentType }) =>
      pipeline(
        stream,
        bucket.file(storagePath).createWriteStream({
          contentType,
          metadata: { cacheControl: 'public, max-age=31536000' },
        }),
      ),
    getDownloadUrl: (storagePath) => getDownloadUrl(storagePath),
  },
  repackage: buildFfmpegRepackage(),
  logger: getCurrentLogger(),
});

const repairFmp4Handler = async (
  context: HandlerContext<RepairFmp4HandlerRequest>,
) => {
  const logger = getCurrentLogger();
  const { validatedData } = context;
  const { body, headers } = validatedData;
  const taskId = headers['x-task-id'] as string;
  const { videoId, userId } = body.data;

  try {
    logger.info(
      { videoId, userId, taskId },
      `[/videos/repair-fmp4-handler] start processing video "${videoId}"`,
    );

    const storagePath = `videos/${userId}/${videoId}`;
    const storage = new Storage();
    const bucket = storage.bucket(envConfig.storageBucket as string);

    // Plan a cache-safe reprocess from what's stored: the source to remux and a
    // fresh `v<N>/` dir for ALL outputs, so nothing overwrites a 1-year-cached
    // object (SWO-639).
    const [files] = await bucket.getFiles({ prefix: `${storagePath}/` });
    const { source, outputStoragePath } = planReprocess(
      files.map((file) => ({
        name: file.name,
        size: Number(file.metadata?.size ?? 0),
      })),
      storagePath,
      (path) => getDownloadUrl(path),
    );

    const { manifestStoragePath } = await repackageToFmp4(
      { source, outputStoragePath },
      buildRepairDeps(bucket),
    );

    const newSource = getDownloadUrl(manifestStoragePath);

    await finishVideoProcess({
      taskId,
      notificationObject: {
        type: 'video-ready',
        entityId: videoId,
        entityType: 'video',
        user_id: userId,
      },
      videoId,
      videoUpdates: {
        source: newSource,
        status: 'ready',
      },
    });

    return AppResponse(true, 'ok', { playableVideoUrl: newSource });
  } catch (error) {
    throw CustomError.critical('fMP4 repair failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.CONVERSION_FAILED,
      context: { videoId, userId, taskId },
      source: SOURCE,
    });
  }
};

export { repairFmp4Handler };
