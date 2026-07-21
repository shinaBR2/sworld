import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { streamFile } from '../gcp-cloud-storage';
import { fetchWithError } from 'src/utils/fetch';
import { buildRequestHeaders } from 'src/utils/http/buildRequestHeaders';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS } from 'src/utils/error-codes';
import { isRetryableError, withRetry } from 'src/utils/retry/withRetry';

interface StreamSubtitleOptions {
  /** The URL of the subtitle file to download */
  url: string;
  /** The storage path where the file should be saved in GCP */
  storagePath: string;
  /** Optional content type, defaults to 'text/vtt' */
  contentType?: string;
  /** Optional per-source request headers (e.g. Referer) from the parent video's metadata */
  customRequestHeaders?: Record<string, string>;
}

/**
 * Streams a subtitle file directly from a URL to GCP Cloud Storage
 */
const streamSubtitleFile = async (options: StreamSubtitleOptions) => {
  const {
    url,
    storagePath,
    contentType = 'text/vtt',
    customRequestHeaders,
  } = options;

  // Retry transient drops (socket/body timeouts, 5xx) — one flaky fetch must not
  // fail the subtitle permanently. A 4xx (shouldRetry: false) fails fast.
  return withRetry(
    async () => {
      // Always send a default browser UA, merged with any per-source headers.
      const response = await fetchWithError(url, {
        headers: buildRequestHeaders(customRequestHeaders),
      });

      const subtitleStream = response.body;

      if (!subtitleStream) {
        throw new CustomError('Failed to fetch subtitle', {
          errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
          shouldRetry: false,
          context: {
            url,
            storagePath,
            responseStatus: response.statusText,
            statusCode: response.status,
          },
        });
      }

      // Convert the web stream to a Node.js stream
      const nodeStream = Readable.fromWeb(
        subtitleStream as unknown as ReadableStream<Uint8Array>,
      );

      // Stream the response directly to GCP
      return streamFile({
        stream: nodeStream,
        storagePath,
        options: {
          contentType,
        },
      });
    },
    { label: `subtitle ${storagePath}`, isRetryable: isRetryableError },
  );
};

export { streamSubtitleFile, type StreamSubtitleOptions };
