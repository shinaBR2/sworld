import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { streamFile } from '../gcp-cloud-storage';
import { fetchWithError } from 'src/utils/fetch';
import { CustomError } from 'src/utils/custom-error';
import { HTTP_ERRORS } from 'src/utils/error-codes';

interface StreamSubtitleOptions {
  /** The URL of the subtitle file to download */
  url: string;
  /** The storage path where the file should be saved in GCP */
  storagePath: string;
  /** Optional content type, defaults to 'text/vtt' */
  contentType?: string;
}

/**
 * Streams a subtitle file directly from a URL to GCP Cloud Storage
 */
const streamSubtitleFile = async (options: StreamSubtitleOptions) => {
  const { url, storagePath, contentType = 'text/vtt' } = options;

  // Fetch the subtitle file with enhanced error handling and timeout
  const response = await fetchWithError(url);

  // Get the response body as a stream
  const subtitleStream = response.body;

  if (!subtitleStream) {
    throw new CustomError('Failed to fetch subtitle', {
      errorCode: HTTP_ERRORS.EMPTY_RESPONSE,
      shouldRetry: false,
      context: { url, storagePath, responseStatus: response.statusText, statusCode: response.status },
    });
  }

  // Convert the web stream to a Node.js stream
  const nodeStream = Readable.fromWeb(subtitleStream as unknown as ReadableStream<Uint8Array>);

  // Stream the response directly to GCP
  return streamFile({
    stream: nodeStream,
    storagePath,
    options: {
      contentType,
    },
  });
};

export { streamSubtitleFile, type StreamSubtitleOptions };
