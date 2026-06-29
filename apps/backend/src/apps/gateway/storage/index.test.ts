import type { Context } from 'hono';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storageRouter } from './index';

// Mock the handler functions
vi.mock('./routes/signed-upload-url', () => ({
  createSignedUploadUrl: vi.fn(),
}));

// Mock the utilities
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

describe('storageRouter', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/storage', storageRouter);
  });

  it('should register the signed-upload-url POST route', async () => {
    const req = new Request('http://localhost/storage/signed-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-action': 'createSignedUploadUrl',
      },
      body: JSON.stringify({
        action: { name: 'createSignedUploadUrl' },
        input: {
          input: {
            site: 'watch',
            action: 'VIDEO_THUMBNAIL_UPLOAD',
            contentType: 'image/png',
          },
        },
        session_variables: {
          'x-hasura-user-id': '550e8400-e29b-41d4-a716-446655440001',
        },
      }),
    });

    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use honoValidateRequest with signedUploadUrlSchema', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );
    const { signedUploadUrlSchema } = await import(
      'src/schema/storage/signed-upload-url'
    );

    await app.fetch(
      new Request('http://localhost/storage/signed-upload-url', {
        method: 'POST',
      }),
    );

    expect(honoValidateRequest).toHaveBeenCalledWith(signedUploadUrlSchema);
  });

  it('should use honoRequestHandler with createSignedUploadUrl', async () => {
    const { honoRequestHandler } = await import('src/utils/requestHandler');
    const { createSignedUploadUrl } = await import(
      './routes/signed-upload-url'
    );

    await app.fetch(
      new Request('http://localhost/storage/signed-upload-url', {
        method: 'POST',
      }),
    );

    const mockRequestHandler = vi.mocked(honoRequestHandler);
    expect(mockRequestHandler).toHaveBeenCalled();
    expect(mockRequestHandler.mock.calls[0][0]).toBe(createSignedUploadUrl);
  });
});
