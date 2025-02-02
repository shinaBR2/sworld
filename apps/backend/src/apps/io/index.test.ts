import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../utils/error-handler';
import { createBaseApp } from 'src/utils/base-app';

// Mock dependencies
vi.mock('../../utils/error-handler', () => ({
  errorHandler: vi.fn(() => 'mockErrorHandler'),
}));

vi.mock('../../utils/logger', () => ({
  logger: 'mockLogger',
}));

vi.mock('./videos', () => ({
  videosRouter: 'mockVideosRouter',
}));

// Mock base app
const mockSet = vi.fn();
const mockUse = vi.fn();
const mockBaseApp = {
  set: mockSet,
  use: mockUse,
};

vi.mock('src/utils/base-app', () => ({
  createBaseApp: vi.fn(() => mockBaseApp),
}));

describe('app', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear module cache to ensure fresh import
    vi.resetModules();
  });

  it('should create base app', async () => {
    await import('./index');
    expect(createBaseApp).toHaveBeenCalled();
  });

  it('should set up videos route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const videoRouteCall = useCalls.find(
      call => call[0] === '/videos' && call[1] === 'mockVideosRouter'
    );
    expect(videoRouteCall).toBeTruthy();
  });

  it('should set up error handler with logger', async () => {
    await import('./index');
    expect(errorHandler).toHaveBeenCalledWith('mockLogger');
    // Find the error handler middleware registration
    const errorHandlerCall = mockUse.mock.calls.find(
      call => call[0] === 'mockErrorHandler'
    );
    expect(errorHandlerCall).toBeTruthy();
  });

  it('should set up middleware in correct order', async () => {
    await import('./index');
    const calls = mockUse.mock.calls;

    // Find the indexes of our middleware
    const videosRouterCallIndex = calls.findIndex(
      call => call[0] === '/videos' && call[1] === 'mockVideosRouter'
    );
    const errorHandlerCallIndex = calls.findIndex(
      call => call[0] === 'mockErrorHandler'
    );

    // Both middleware should be found
    expect(videosRouterCallIndex).not.toBe(-1);
    expect(errorHandlerCallIndex).not.toBe(-1);

    // Error handler should be after routes
    expect(errorHandlerCallIndex).toBeGreaterThan(videosRouterCallIndex);
  });

  it('should export configured app', async () => {
    const { app } = await import('./index');
    expect(app).toBe(mockBaseApp);
  });

  it('should throw if createBaseApp fails', async () => {
    // Setup error for this specific test
    const error = new Error('Base app creation failed');
    vi.mocked(createBaseApp).mockImplementationOnce(() => {
      throw error;
    });

    // The import should now fail
    await expect(() => import('./index')).rejects.toThrow(
      'Base app creation failed'
    );
  });
});
