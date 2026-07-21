import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockMarkVideoFailed = vi.fn();
vi.mock('src/services/hasura/mutations/videos/markFailed', () => ({
  markVideoFailed: (...args: unknown[]) => mockMarkVideoFailed(...args),
}));
vi.mock('src/utils/logger', () => ({
  getCurrentLogger: () => ({ info: vi.fn(), error: vi.fn() }),
}));

import type { HandlerContext } from 'src/utils/requestHandler';
import { CustomError } from 'src/utils/custom-error';
import { reportVideoTaskFailure, withVideoFailureReport } from './index';

const terminal = () =>
  new CustomError('Client error: Forbidden', {
    errorCode: 'CLIENT_ERROR',
    shouldRetry: false,
  });

const videoCtx = (videoId?: string): HandlerContext =>
  ({ validatedData: { body: { data: { id: videoId } } } }) as HandlerContext;

describe('reportVideoTaskFailure', () => {
  beforeEach(() => {
    mockMarkVideoFailed.mockReset();
  });

  it('marks failed on a terminal (non-retryable) CustomError with a videoId', async () => {
    const error = terminal();
    await reportVideoTaskFailure(error, 'v1');
    expect(mockMarkVideoFailed).toHaveBeenCalledWith('v1', error);
  });

  it('does NOT mark a retryable CustomError', async () => {
    const error = new CustomError('Server error', {
      errorCode: 'SERVER_ERROR',
      shouldRetry: true,
    });
    await reportVideoTaskFailure(error, 'v1');
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });

  it('does NOT mark a plain (non-CustomError) Error', async () => {
    await reportVideoTaskFailure(new Error('boom'), 'v1');
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });

  it('does NOT mark when there is no videoId', async () => {
    await reportVideoTaskFailure(terminal(), undefined);
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });

  it('never throws even if markVideoFailed fails', async () => {
    mockMarkVideoFailed.mockRejectedValueOnce(new Error('hasura down'));
    await expect(
      reportVideoTaskFailure(terminal(), 'v1'),
    ).resolves.toBeUndefined();
  });
});

describe('withVideoFailureReport', () => {
  beforeEach(() => {
    mockMarkVideoFailed.mockReset();
  });

  it('returns the handler result on success and never marks failed', async () => {
    const handler = vi.fn().mockResolvedValue({ success: true });
    const wrapped = withVideoFailureReport(handler);

    const result = await wrapped(videoCtx('v1'));

    expect(result).toEqual({ success: true });
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });

  it('marks the video failed on a terminal error, then ACKs (no throw)', async () => {
    const error = terminal();
    const wrapped = withVideoFailureReport(async () => {
      throw error;
    });

    // Resolves (2xx ack) so Cloud Tasks stops retrying a permanent failure.
    await expect(wrapped(videoCtx('v1'))).resolves.toEqual({
      success: false,
      message: 'Client error: Forbidden',
    });
    expect(mockMarkVideoFailed).toHaveBeenCalledWith('v1', error);
  });

  it('ACKs a terminal error even when the payload carries no video id', async () => {
    const error = terminal();
    const wrapped = withVideoFailureReport(async () => {
      throw error;
    });

    await expect(wrapped(videoCtx(undefined))).resolves.toEqual({
      success: false,
      message: 'Client error: Forbidden',
    });
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });

  it('re-throws a RETRYABLE error so Cloud Tasks retries (no ack, no mark)', async () => {
    const error = new CustomError('Server error', {
      errorCode: 'SERVER_ERROR',
      shouldRetry: true,
    });
    const wrapped = withVideoFailureReport(async () => {
      throw error;
    });

    await expect(wrapped(videoCtx('v1'))).rejects.toBe(error);
    expect(mockMarkVideoFailed).not.toHaveBeenCalled();
  });
});
