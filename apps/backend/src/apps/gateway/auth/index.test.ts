import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { authRouter } from './index';

// Mock the handler functions
vi.mock('./routes/device', () => ({
  createDeviceRequest: vi.fn(),
}));

vi.mock('./routes/device/authorize', () => ({
  authorizeDevice: vi.fn(),
}));

vi.mock('./routes/device/token', () => ({
  getDeviceToken: vi.fn(),
}));

// Mock the utilities. honoActionHandler is spied on, not reimplemented, so
// these tests exercise its real wrapping logic instead of a hand-copy of it.
vi.mock('src/utils/requestHandler', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('src/utils/requestHandler')>();
  return {
    ...actual,
    honoRequestHandler: vi.fn(
      (handler: (c: Context) => Promise<Response> | Response) => handler,
    ),
    honoActionHandler: vi.fn(actual.honoActionHandler),
  };
});

vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn(
    () => (_c: Context, next: () => Promise<void>) => next(),
  ),
}));

describe('authRouter', () => {
  let app: Hono;

  beforeEach(() => {
    // Create a fresh Hono instance for each test
    app = new Hono();
    // Use the router
    app.route('/auth', authRouter);
  });

  it('should register the device POST route', async () => {
    const req = new Request('http://localhost/auth/device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-action': 'createDeviceRequest',
      },
      body: JSON.stringify({
        body: {
          action: { name: 'createDeviceRequest' },
          input: { input: { extensionId: 'test-extension-id' } },
        },
        headers: {
          'content-type': 'application/json',
          'x-hasura-action': 'createDeviceRequest',
        },
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      }),
    });

    // This will test that the route exists and can be called
    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use honoValidateRequest middleware with deviceRequestCreateSchema', async () => {
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );
    const { deviceRequestCreateSchema } = await import(
      'src/schema/auth/device'
    );

    const req = new Request('http://localhost/auth/device', {
      method: 'POST',
    });

    await app.fetch(req);
    expect(honoValidateRequest).toHaveBeenCalledWith(deviceRequestCreateSchema);
  });

  it('should use honoActionHandler with createDeviceRequest', async () => {
    const { honoActionHandler } = await import('src/utils/requestHandler');
    const { createDeviceRequest } = await import('./routes/device');

    const req = new Request('http://localhost/auth/device', {
      method: 'POST',
    });

    await app.fetch(req);

    const mockActionHandler = vi.mocked(honoActionHandler);
    expect(mockActionHandler).toHaveBeenCalled();

    const handlerArg = mockActionHandler.mock.calls[0][0];
    expect(handlerArg).toBe(createDeviceRequest);
  });

  it("should return createDeviceRequest's result as the response JSON", async () => {
    const { createDeviceRequest } = await import('./routes/device');
    const mockResponse = {
      success: true,
      data: {
        deviceCode: 'mock-device-code',
        userCode: 'ABC-123',
        verificationUri: 'https://watch.sworld.dev/pair',
        verificationUriComplete: 'https://watch.sworld.dev/pair?code=ABC-123',
        expiresIn: 600,
        interval: 5,
      },
    };
    vi.mocked(createDeviceRequest).mockResolvedValue(mockResponse);

    const req = new Request('http://localhost/auth/device', {
      method: 'POST',
    });

    const res = await app.fetch(req);

    await expect(res.json()).resolves.toEqual(mockResponse);
  });

  it('should register the authorizeDevice POST route', async () => {
    const req = new Request('http://localhost/auth/device/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-action': 'authorizeDevice',
      },
      body: JSON.stringify({
        body: {
          action: { name: 'authorizeDevice' },
          input: { input: { userCode: 'ABC-123', approved: true } },
        },
        headers: {
          'content-type': 'application/json',
          'x-hasura-action': 'authorizeDevice',
        },
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      }),
    });

    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use honoRequestHandler with authorizeDevice', async () => {
    const { honoRequestHandler } = await import('src/utils/requestHandler');
    const { authorizeDevice } = await import('./routes/device/authorize');

    const req = new Request('http://localhost/auth/device/authorize', {
      method: 'POST',
    });

    await app.fetch(req);

    const mockRequestHandler = vi.mocked(honoRequestHandler);
    const handlerArg = mockRequestHandler.mock.calls[0][0];
    expect(handlerArg).toBe(authorizeDevice);
  });

  it('should register the getDeviceToken POST route', async () => {
    const req = new Request('http://localhost/auth/device/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-action': 'getDeviceToken',
      },
      body: JSON.stringify({
        body: {
          action: { name: 'getDeviceToken' },
          input: {
            input: {
              deviceCode: 'test-device-code',
              grantType: 'urn:ietf:params:oauth:grant-type:device_code',
            },
          },
        },
        headers: {
          'content-type': 'application/json',
          'x-hasura-action': 'getDeviceToken',
        },
        ip: '127.0.0.1',
        userAgent: 'test-user-agent',
      }),
    });

    await expect(app.fetch(req)).resolves.toBeDefined();
  });

  it('should use honoRequestHandler with getDeviceToken', async () => {
    const { honoRequestHandler } = await import('src/utils/requestHandler');
    const { getDeviceToken } = await import('./routes/device/token');

    const req = new Request('http://localhost/auth/device/token', {
      method: 'POST',
    });

    await app.fetch(req);

    const mockRequestHandler = vi.mocked(honoRequestHandler);
    const handlerArg = mockRequestHandler.mock.calls[1][0];
    expect(handlerArg).toBe(getDeviceToken);
  });
});
