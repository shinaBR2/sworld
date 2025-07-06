import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDeviceRequest } from './routes/device';

let routeHandlers: { path: string; middlewares: any[] }[] = [];

vi.mock('express', () => {
  const mockRouter = {
    post: vi.fn((path, ...middlewares) => {
      routeHandlers.push({ path, middlewares });
    }),
  };

  const mockExpress = vi.fn();
  (mockExpress as any).Router = vi.fn(() => mockRouter);

  return {
    default: mockExpress,
    Router: mockExpress.Router,
    __esModule: true,
  };
});

vi.mock('src/utils/validators/request', () => ({
  validateRequest: vi.fn().mockImplementation(schema => {
    return (req: any, res: any, next: any) => {
      req.validatedData = {
        ...req.body,
        ip: 'fake-ip',
        userAgent: 'fake-user-agent',
      };
      next();
    };
  }),
}));

vi.mock('./routes/device', () => ({
  createDeviceRequest: vi.fn().mockResolvedValue({
    device_code: 'dev-1',
    user_code: 'user-1',
    verification_uri: 'https://watch.sworld.dev/pair',
    verification_uri_complete: 'https://watch.sworld.dev/pair?code=user-1',
    expires_in: 600,
    interval: 5,
  }),
}));

vi.mock('src/utils/requestHandler', () => ({
  requestHandler: vi.fn(fn => fn),
}));

describe('authRouter', () => {
  beforeEach(() => {
    routeHandlers = [];
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should set up /device route with correct middleware and handler', async () => {
    const { authRouter } = await import('./index');
    expect(authRouter).toBeDefined();

    const deviceRoute = routeHandlers.find(h => h.path === '/device');
    expect(deviceRoute).toBeDefined();
    // Should have 2 middlewares: validation and handler
    expect(deviceRoute?.middlewares).toHaveLength(2);
    // First is validateRequest, second is requestHandler-wrapped handler
    expect(typeof deviceRoute?.middlewares[0]).toBe('function');
    expect(typeof deviceRoute?.middlewares[1]).toBe('function');
  });

  it('should call createDeviceRequest with correct extensionId', async () => {
    const { authRouter } = await import('./index');
    const deviceRoute = routeHandlers.find(h => h.path === '/device');
    expect(deviceRoute).toBeDefined();
    const [validate, handler] = deviceRoute!.middlewares;

    // Mock req/res/next
    const req: any = { body: { input: { input: { extensionId: 'ext-123' } } } };
    const res: any = { json: vi.fn() };
    const next = vi.fn();

    // Simulate validation
    validate(req, res, next);
    // Simulate handler
    const result = await handler({ validatedData: req.validatedData });

    expect(createDeviceRequest).toHaveBeenCalledWith({
      extensionId: 'ext-123',
      ip: 'fake-ip',
      userAgent: 'fake-user-agent',
    });
    expect(result).toMatchObject({
      success: true,
      message: 'ok',
      dataObject: expect.objectContaining({
        device_code: 'dev-1',
        user_code: 'user-1',
      }),
    });
  });
});
