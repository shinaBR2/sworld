import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';
import { envConfig } from 'src/utils/envConfig';
import { AppError } from 'src/utils/schema';
import { validateRequest } from 'src/utils/validator';
import { logger } from 'src/utils/logger';
import { createCloudTasks } from '../../../utils/cloud-task';
import { verifySignature } from '../../../services/videos/convert/validator';

// Mock dependencies
// let routeHandlers: { path: string; middlewares: Function[] }[] = [];
type RouteHandler = (req: Request, res: Response, next: NextFunction) => void;
let routeHandlers: { path: string; middlewares: RouteHandler[] }[] = [];

vi.mock('express', () => {
  const mockRouter = {
    post: vi.fn((path, ...middlewares) => {
      routeHandlers.push({ path, middlewares });
    }),
  };

  const mockExpress = vi.fn();
  mockExpress.Router = vi.fn(() => mockRouter);
  mockExpress.json = vi.fn();

  return {
    default: mockExpress,
    Router: mockExpress.Router,
    __esModule: true,
  };
});

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    computeServiceUrl: 'http://test-compute-service',
  },
}));

vi.mock('src/utils/schema', () => ({
  AppError: vi.fn((message, details) => {
    const error = new Error(message);
    (error as any).details = details;
    return error;
  }),
  AppResponse: vi.fn((success, message, data) => ({ success, message, data })),
}));

vi.mock('src/utils/validator', () => ({
  validateRequest: vi.fn().mockReturnValue((req: any, res: any, next: any) => {
    req.validatedData = req.body;
    next();
  }),
}));

vi.mock('src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

vi.mock('../../../utils/cloud-task', () => ({
  createCloudTasks: vi.fn(),
}));

vi.mock('../../../services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
}));

describe('videosRouter', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;
  let routeHandler: RouteHandler;
  let validationMiddleware: RouteHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    routeHandlers = [];

    // Reset modules to ensure clean state
    vi.resetModules();

    // Reset mocks
    vi.mocked(envConfig).computeServiceUrl = 'http://test-compute-service';
    vi.mocked(verifySignature).mockReturnValue(true);
    vi.mocked(createCloudTasks).mockResolvedValue({ taskId: 'test-task' });

    // Import to trigger route setup
    await import('./index');

    // Get the handlers for the /convert route
    const convertRoute = routeHandlers.find(h => h.path === '/convert');
    if (!convertRoute) {
      throw new Error('Convert route not found in handlers');
    }
    [validationMiddleware, routeHandler] = convertRoute.middlewares;

    // Setup request and response mocks
    mockReq = {
      validatedData: {
        signatureHeader: 'test-signature',
        event: {
          data: { videoId: 'test-video' },
          metadata: { id: 'test-event' },
        },
      },
    };

    mockRes = {
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('POST /convert', () => {
    it('should set up route with validation middleware', async () => {
      const convertRoute = routeHandlers.find(h => h.path === '/convert');
      expect(convertRoute).toBeTruthy();
      expect(validateRequest).toHaveBeenCalled();
    });

    it('should create cloud task when signature is valid', async () => {
      expect(routeHandler).toBeDefined();
      await routeHandler(mockReq, mockRes, mockNext);

      expect(createCloudTasks).toHaveBeenCalledWith({
        url: 'http://test-compute-service/videos/convert-handler',
        queue: 'convert-video',
        payload: mockReq.validatedData.event,
      });

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'ok',
          data: { taskId: 'test-task' },
        })
      );
    });

    it('should throw error when signature is invalid', async () => {
      vi.mocked(verifySignature).mockReturnValue(false);

      await expect(routeHandler(mockReq, mockRes, mockNext)).rejects.toThrow(
        'Invalid webhook signature for event'
      );
      expect(createCloudTasks).not.toHaveBeenCalled();
    });

    it('should throw error when compute service URL is missing', async () => {
      const mockEnvConfig = vi.mocked(envConfig);
      mockEnvConfig.computeServiceUrl = undefined;

      await expect(routeHandler(mockReq, mockRes, mockNext)).rejects.toThrow(
        'Missing environment variable: computeServiceUrl'
      );
      expect(createCloudTasks).not.toHaveBeenCalled();
    });

    it('should handle cloud task creation failure', async () => {
      const error = new Error('Task creation failed');
      vi.mocked(createCloudTasks).mockRejectedValue(error);

      await expect(routeHandler(mockReq, mockRes, mockNext)).rejects.toThrow(
        'Failed to create conversion task'
      );

      expect(AppError).toHaveBeenCalledWith(
        'Failed to create conversion task',
        expect.objectContaining({
          eventId: mockReq.validatedData.event.metadata.id,
          error,
        })
      );
    });

    it('should validate request data', async () => {
      const convertRoute = routeHandlers.find(h => h.path === '/convert');
      expect(convertRoute).toBeDefined();

      // Test the validation middleware
      const testReq = { body: { someData: 'test' } };
      const testRes = {};
      const testNext = vi.fn();

      await validationMiddleware(testReq, testRes, testNext);

      expect(testReq).toHaveProperty('validatedData');
      expect(testNext).toHaveBeenCalled();
    });
  });
});
