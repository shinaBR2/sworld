import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRequest = vi.fn();
vi.mock('../../client', () => ({
  hasuraClient: { request: (...args: unknown[]) => mockRequest(...args) },
}));

import { CustomError } from 'src/utils/custom-error';
import { buildLastError, markVideoFailed } from './markFailed';

describe('buildLastError', () => {
  it('strips URLs out of the message and stamps code + time', () => {
    const le = buildLastError(
      new Error('Failed to fetch https://cdn.com/secret?token=abc now'),
    );

    expect(le.message).toBe('Failed to fetch [redacted-url] now');
    expect(le.code).toBe('UNKNOWN_ERROR');
    expect(le.at).toBeTruthy();
    expect(le.httpStatus).toBeUndefined();
  });

  it('uses the CustomError code + httpStatus from context', () => {
    const error = new CustomError('Client error: Forbidden', {
      errorCode: 'CLIENT_ERROR',
      context: { statusCode: 403 },
    });

    const le = buildLastError(error);

    expect(le.code).toBe('CLIENT_ERROR');
    expect(le.httpStatus).toBe(403);
  });
});

describe('markVideoFailed', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('merges lastError into existing metadata (preserving customRequestHeaders) and sets status=failed', async () => {
    mockRequest
      .mockResolvedValueOnce({
        videos_by_pk: {
          metadata: { customRequestHeaders: { Referer: 'https://x/' } },
        },
      })
      .mockResolvedValueOnce({ update_videos_by_pk: { id: 'v1' } });

    await markVideoFailed(
      'v1',
      new CustomError('boom', { errorCode: 'CLIENT_ERROR' }),
    );

    expect(mockRequest).toHaveBeenCalledTimes(2);
    const markVars = mockRequest.mock.calls[1][0].variables as {
      videoId: string;
      metadata: Record<string, unknown>;
    };
    expect(markVars.videoId).toBe('v1');
    expect(markVars.metadata.customRequestHeaders).toEqual({
      Referer: 'https://x/',
    });
    expect((markVars.metadata.lastError as { code: string }).code).toBe(
      'CLIENT_ERROR',
    );
  });

  it('handles NULL metadata (starts from an empty object)', async () => {
    mockRequest
      .mockResolvedValueOnce({ videos_by_pk: { metadata: null } })
      .mockResolvedValueOnce({ update_videos_by_pk: { id: 'v2' } });

    await markVideoFailed('v2', new Error('x'));

    const markVars = mockRequest.mock.calls[1][0].variables as {
      metadata: Record<string, unknown>;
    };
    expect(markVars.metadata.lastError).toBeTruthy();
  });
});
