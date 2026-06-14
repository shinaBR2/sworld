import { CustomError } from 'src/utils/custom-error';
import { graphql } from '../../generated-graphql';
import type {
  MarkVideoFailedMutation,
  MarkVideoFailedMutationVariables,
  VideoMetadataQuery,
  VideoMetadataQueryVariables,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const VIDEO_METADATA = graphql(/* GraphQL */ `
  query VideoMetadata($videoId: uuid!) {
    videos_by_pk(id: $videoId) {
      metadata
    }
  }
`);

const MARK_VIDEO_FAILED = graphql(/* GraphQL */ `
  mutation MarkVideoFailed($videoId: uuid!, $metadata: jsonb!) {
    update_videos_by_pk(
      pk_columns: { id: $videoId }
      _set: { status: "failed", metadata: $metadata }
    ) {
      id
    }
  }
`);

interface LastError {
  code: string;
  httpStatus?: number;
  message: string;
  at: string;
}

// Strip URLs (hotlink targets, query tokens) from operator-facing messages.
const URL_PATTERN = /https?:\/\/[^\s'"]+/gi;
const sanitizeMessage = (message: string): string =>
  message.replace(URL_PATTERN, '[redacted-url]');

const extractHttpStatus = (error: unknown): number | undefined => {
  if (!(error instanceof CustomError)) return undefined;
  for (const ctx of error.contexts ?? []) {
    const status = (ctx?.data as Record<string, unknown> | undefined)
      ?.statusCode;
    if (typeof status === 'number') return status;
  }
  return undefined;
};

/**
 * Build the operator-safe failure record stored in `metadata.lastError` and
 * surfaced to Slack (B2). No raw URLs/headers — just code, optional httpStatus,
 * a sanitized message, and a timestamp.
 */
const buildLastError = (error: unknown): LastError => {
  const message = error instanceof Error ? error.message : String(error);
  const httpStatus = extractHttpStatus(error);

  return {
    code: error instanceof CustomError ? error.errorCode : 'UNKNOWN_ERROR',
    ...(httpStatus !== undefined ? { httpStatus } : {}),
    message: sanitizeMessage(message),
    at: new Date().toISOString(),
  };
};

/**
 * Flag a video as `failed` and record `metadata.lastError`. Reads the current
 * metadata first and merges, so `customRequestHeaders` (and any NULL metadata)
 * are handled correctly. The `status -> failed` transition is what fires the
 * Slack alert (B2).
 */
const markVideoFailed = async (
  videoId: string,
  error: unknown,
): Promise<void> => {
  const current = await hasuraClient.request<
    VideoMetadataQuery,
    VideoMetadataQueryVariables
  >({
    document: VIDEO_METADATA.toString(),
    variables: { videoId },
  });

  const metadata = {
    ...((current.videos_by_pk?.metadata as Record<string, unknown> | null) ??
      {}),
    lastError: buildLastError(error),
  };

  await hasuraClient.request<
    MarkVideoFailedMutation,
    MarkVideoFailedMutationVariables
  >({
    document: MARK_VIDEO_FAILED.toString(),
    variables: { videoId, metadata },
  });
};

export { buildLastError, markVideoFailed };
