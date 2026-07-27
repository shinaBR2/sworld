import { pipeline } from 'node:stream/promises';
import { Storage } from '@google-cloud/storage';
import type { RepairFmp4HandlerRequest } from 'src/schema/videos/repair-fmp4-handler';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { buildFfmpegRepackage } from 'src/services/videos/processing/ffmpegRepackageAdapter';
import { planReprocessSource } from 'src/services/videos/processing/planReprocessSource';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import type { StoredPart } from 'src/services/videos/processing/selectFmp4Parts';
import type {
  RepackageDeps,
  RepackageSource,
} from 'src/services/videos/processing/types';
import { nextVersionDir } from 'src/services/videos/processing/versioning';
import { CustomError } from 'src/utils/custom-error';
import { envConfig } from 'src/utils/envConfig';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

// ffmpeg resolves from PATH — apt-installed (>= 7) in the compute image (SWO-633).

const PLAYLIST_NAME = 'playlist.m3u8';
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

/** Objects stored directly under `basePath` (excludes any `v<N>/` rendition). */
const listStoredObjects = async (
  bucket: ReturnType<Storage['bucket']>,
  basePath: string,
): Promise<{ relativeNames: string[]; topLevel: StoredPart[] }> => {
  const [files] = await bucket.getFiles({ prefix: `${basePath}/` });
  const relative = files
    .map((file) => ({
      name: file.name.slice(basePath.length + 1),
      size: Number(file.metadata?.size ?? 0),
    }))
    .filter((part) => part.name.length > 0);
  return {
    relativeNames: relative.map((part) => part.name),
    topLevel: relative.filter((part) => !part.name.includes('/')),
  };
};

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

    const { relativeNames, topLevel } = await listStoredObjects(
      bucket,
      storagePath,
    );
    // Fresh versioned dir for ALL outputs — never overwrites a 1-year-cached
    // object (SWO-639).
    const outputStoragePath = `${storagePath}/${nextVersionDir(relativeNames)}`;

    const plan = planReprocessSource(topLevel);
    const source: RepackageSource =
      plan.kind === 'hls-ts'
        ? {
            kind: 'hls-url',
            url: getDownloadUrl(`${storagePath}/${PLAYLIST_NAME}`),
          }
        : {
            kind: 'fmp4-parts',
            partUrls: plan.partNames.map((name) =>
              getDownloadUrl(`${storagePath}/${name}`),
            ),
          };

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
