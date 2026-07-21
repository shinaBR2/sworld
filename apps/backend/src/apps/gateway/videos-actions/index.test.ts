import type { Context } from 'hono';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { videoActionsRouter } from './index';

vi.mock('../videos/routes/set-thumbnail', () => ({
  setThumbnailAtTime: vi.fn(),
}));

vi.mock('src/utils/requestHandler', () => ({
  honoRequestHandler: vi.fn(
    (handler: (c: Context) => Promise<Response> | Response) => handler,
  ),
}));

vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn(
    () => (_c: Context, next: () => Promise<void>) => next(),
  ),
}));

describe('videoActionsRouter', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/videos-actions', videoActionsRouter);
  });

  it('registers the set-thumbnail POST route', async () => {
    const req = new Request('http://localhost/videos-actions/set-thumbnail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-action': 'setVideoThumbnailAtTime',
      },
      body: JSON.stringify({
        action: { name: 'setVideoThumbnailAtTime' },
        input: {
          input: {
            videoId: '550e8400-e29b-41d4-a716-446655440000',
            atSeconds: 12.5,
          },
        },
        session_variables: {
          'x-hasura-user-id': '550e8400-e29b-41d4-a716-446655440001',
        },
      }),
    });

    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('wires honoValidateRequest with setThumbnailAtTimeSchema', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );
    const { setThumbnailAtTimeSchema } = await import(
      'src/schema/videos/set-thumbnail-at-time'
    );

    await app.fetch(
      new Request('http://localhost/videos-actions/set-thumbnail', {
        method: 'POST',
      }),
    );

    expect(honoValidateRequest).toHaveBeenCalledWith(setThumbnailAtTimeSchema);
  });

  it('wires honoRequestHandler with setThumbnailAtTime', async () => {
    const { honoRequestHandler } = await import('src/utils/requestHandler');
    const { setThumbnailAtTime } = await import(
      '../videos/routes/set-thumbnail'
    );

    await app.fetch(
      new Request('http://localhost/videos-actions/set-thumbnail', {
        method: 'POST',
      }),
    );

    const mockRequestHandler = vi.mocked(honoRequestHandler);
    expect(mockRequestHandler).toHaveBeenCalled();
    expect(mockRequestHandler.mock.calls[0][0]).toBe(setThumbnailAtTime);
  });
});
