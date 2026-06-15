import { CustomError } from 'src/utils/custom-error';
import { getCurrentLogger } from 'src/utils/logger';
import type { BusinessHandler } from 'src/utils/requestHandler';
import { AppResponse } from 'src/utils/schema';

/**
 * Flag a video `failed` when its processing task throws a TERMINAL error (which
 * fires the Slack alert via B2). "Terminal" = a non-retryable `CustomError`
 * (Option A) — e.g. a 403 hotlink block. Transient/retryable errors are left
 * alone so Cloud Tasks can retry and we don't alert on blips that self-heal.
 *
 * Never throws: a failed mark-failed must not take over the error response.
 *
 * This is invoked ONLY by `withVideoFailureReport` (below), so it is reached
 * exclusively from video-processing handlers — never from the shared request
 * pipeline that other (non-video) features run through.
 */
const reportVideoTaskFailure = async (
  error: unknown,
  videoId: string | undefined,
): Promise<void> => {
  const logger = getCurrentLogger();

  try {
    const isTerminal = error instanceof CustomError && !error.shouldRetry;
    if (!isTerminal) return;
    if (!videoId) return;

    // Imported lazily so wrapping a handler doesn't eagerly construct the
    // Hasura client, which throws at import when its env vars are absent.
    const { markVideoFailed } = await import(
      'src/services/hasura/mutations/videos/markFailed'
    );
    await markVideoFailed(videoId, error);
    logger.info({ videoId }, 'Marked video as failed');
  } catch (markError) {
    logger.error(markError, 'Failed to mark video as failed');
  }
};

/** The Cloud-Task payload shape shared by video-processing handlers. */
interface VideoTaskData {
  body?: { data?: { id?: string } };
}

/**
 * Wrap a VIDEO-PROCESSING business handler so a terminal failure flags the
 * video `failed` (which fires the Slack alert) and then ACKs the task with a 2xx
 * so Cloud Tasks stops retrying a permanent failure. Retryable errors are
 * re-thrown (→ 5xx) so Cloud Tasks retries transient blips.
 *
 * Apply this ONLY to ingest/processing entry points — `convert` (compute),
 * `stream-hls` and `import-platform` (io). Do NOT apply it to non-video
 * handlers, nor to `fix-duration`/`fix-thumbnail`: those run against videos
 * that are already `ready`, so a failure there must not flip them to `failed`.
 */
const withVideoFailureReport =
  <T, R>(handler: BusinessHandler<T, R>): BusinessHandler<T, R> =>
  async (context) => {
    try {
      return await handler(context);
    } catch (error) {
      const videoId = (context.validatedData as VideoTaskData | undefined)?.body
        ?.data?.id;
      await reportVideoTaskFailure(error, videoId);

      // A terminal (non-retryable) failure is permanent — we've already flagged
      // the video `failed` and alerted (above). ACK it to Cloud Tasks with a 2xx
      // so the task leaves the queue instead of retrying forever (re-firing the
      // same alert each time). Retryable errors re-throw → 5xx → Cloud Tasks
      // retries, which is what we want for transient blips.
      const isTerminal = error instanceof CustomError && !error.shouldRetry;
      if (isTerminal) {
        return AppResponse<R>(false, error.message);
      }
      throw error;
    }
  };

export { reportVideoTaskFailure, withVideoFailureReport };
