import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notifyFailureHandler } from './index';
import { postToSlack } from 'src/services/slack';
import type { NotifyFailureRequest } from 'src/schema/videos/notify-failure';
import type { HandlerContext } from 'src/utils/requestHandler';

vi.mock('src/services/slack', () => ({
  postToSlack: vi.fn(),
}));

const buildContext = (
  data: NotifyFailureRequest['event']['data'],
): HandlerContext<NotifyFailureRequest> =>
  ({
    validatedData: {
      event: {
        data,
        metadata: { id: 'event-1', spanId: 'span-1', traceId: 'trace-1' },
      },
      contentTypeHeader: 'application/json',
      signatureHeader: 'test-signature',
    },
  }) as unknown as HandlerContext<NotifyFailureRequest>;

const failedData = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'My video',
  status: 'failed',
  metadata: {
    lastError: {
      code: 'CLIENT_ERROR',
      httpStatus: 403,
      message: 'Forbidden',
      at: '2026-06-14T00:00:00.000Z',
    },
  },
};

describe('notifyFailureHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts a Slack alert with the video id and error reason on failure', async () => {
    const result = await notifyFailureHandler(buildContext(failedData));

    expect(postToSlack).toHaveBeenCalledTimes(1);
    expect(postToSlack).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('My video'),
        fields: expect.objectContaining({
          'Video ID': failedData.id,
          Code: 'CLIENT_ERROR',
          'HTTP status': 403,
          Reason: 'Forbidden',
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: { id: failedData.id },
    });
  });

  it('does not alert on non-failed transitions (e.g. ready/processing)', async () => {
    const result = await notifyFailureHandler(
      buildContext({ ...failedData, status: 'ready' }),
    );

    expect(postToSlack).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: 'ignored',
      dataObject: { id: failedData.id, status: 'ready' },
    });
  });

  it('falls back gracefully when lastError / metadata is missing', async () => {
    const result = await notifyFailureHandler(
      buildContext({
        id: failedData.id,
        title: 'No-detail video',
        status: 'failed',
        metadata: null,
      }),
    );

    expect(postToSlack).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.objectContaining({
          Code: 'UNKNOWN_ERROR',
          Reason: 'No error detail recorded',
        }),
      }),
    );
    expect(result.success).toBe(true);
  });
});
