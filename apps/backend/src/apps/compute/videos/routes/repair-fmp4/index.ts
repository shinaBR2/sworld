import {
  createReadStream,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Storage } from '@google-cloud/storage';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { finishVideoProcess } from 'src/services/hasura/mutations/videos/finalize';
import { repackageToFmp4 } from 'src/services/videos/processing/repackageToFmp4';
import type {
  Fmp4Artifacts,
  RepackageDeps,
  RepackagePort,
} from 'src/services/videos/processing/types';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import type { RepairFmp4HandlerRequest } from 'src/schema/videos/repair-fmp4-handler';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { envConfig } from 'src/utils/envConfig';
import { getCurrentLogger } from 'src/utils/logger';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const PLAYLIST_NAME = 'playlist.m3u8';
const FMP4_PLAYLIST_NAME = 'playlist-fmp4.m3u8';
const PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl';
const SOURCE = 'apps/compute/videos/routes/repair-fmp4/index.ts';

const buildFfmpegRepackage = (): RepackagePort => ({
  repackageToFmp4: async (sourceUrl: string) => {
    const tempDir = mkdtempSync(path.join(os.tmpdir(), 'fmp4-repair-'));
    const outputDir = path.join(tempDir, 'out');
    mkdirSync(outputDir, { recursive: true });
    const playlistPath = path.join(outputDir, PLAYLIST_NAME);

    await new Promise<void>((res, rej) => {
      ffmpeg(sourceUrl)
        .outputOptions([
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-ac',
          '2',
          '-ar',
          '44100',
          '-hls_time',
          '6',
          '-hls_playlist_type',
          'vod',
          '-hls_segment_type',
          'fmp4',
          '-hls_fmp4_init_filename',
          'init.mp4',
        ])
        .format('hls')
        .output(playlistPath)
        .on('end', () => res())
        .on('error', (err, _stdout, stderr) =>
          rej(
            new Error(
              `ffmpeg fMP4 remux failed: ${err.message}\n${stderr ?? ''}`,
            ),
          ),
        )
        .run();
    });

    const segmentNames = readdirSync(outputDir)
      .filter((name) => name.endsWith('.m4s'))
      .sort(
        (a, b) =>
          Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0),
      );

    const artifacts: Fmp4Artifacts = {
      init: {
        name: 'init.mp4',
        stream: createReadStream(path.join(outputDir, 'init.mp4')),
      },
      segments: segmentNames.map((name) => ({
        name,
        stream: createReadStream(path.join(outputDir, name)),
      })),
      playlistContent: readFileSync(playlistPath, 'utf-8'),
    };

    return {
      artifacts,
      cleanup: async () => {
        await rm(tempDir, { recursive: true, force: true });
      },
    };
  },
});

const buildRepairDeps = (): RepackageDeps => {
  const storage = new Storage();
  const bucket = storage.bucket(envConfig.storageBucket as string);

  return {
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
    const { playlistContent } = await repackageToFmp4(
      { storagePath },
      buildRepairDeps(),
    );

    const storage = new Storage();
    const bucket = storage.bucket(envConfig.storageBucket as string);
    const fmp4PlaylistPath = `${storagePath}/${FMP4_PLAYLIST_NAME}`;
    await bucket.file(fmp4PlaylistPath).save(playlistContent, {
      contentType: PLAYLIST_CONTENT_TYPE,
      metadata: { cacheControl: 'no-cache' },
    });

    const newSource = getDownloadUrl(fmp4PlaylistPath);

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
