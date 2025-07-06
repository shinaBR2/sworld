import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createBaseApp } from '../../utils/base-app';

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

vi.mock('./hashnode', () => ({
  hashnodeRouter: 'mockHashnodeRouter',
}));

vi.mock('./auth', () => ({
  authRouter: 'mockAuthRouter',
}));

// Mock base app
const mockSet = vi.fn();
const mockUse = vi.fn();
const mockBaseApp = {
  set: mockSet,
  use: mockUse,
};

vi.mock('../../utils/base-app', () => ({
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

  it('should set trust proxy', async () => {
    // Import the module to trigger the app configuration
    await import('./index');
    // Verify trust proxy setting
    expect(mockSet).toHaveBeenCalledWith('trust proxy', 1);
  });

  it('should set up videos route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const videoRouteCall = useCalls.find(call => call[0] === '/videos' && call[1] === 'mockVideosRouter');
    expect(videoRouteCall).toBeTruthy();
  });

  it('should set up auth route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const authRouteCall = useCalls.find(call => call[0] === '/auth' && call[1] === 'mockAuthRouter');
    expect(authRouteCall).toBeTruthy();
  });

  it('should set up hashnode route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const hashnodeRouteCall = useCalls.find(call => call[0] === '/hashnode' && call[1] === 'mockHashnodeRouter');
    expect(hashnodeRouteCall).toBeTruthy();
  });

  it('should set up middleware in correct order', async () => {
    await import('./index');
    const calls = mockUse.mock.calls;

    // Find the indexes of our middleware
    const videosRouterCallIndex = calls.findIndex(call => call[0] === '/videos' && call[1] === 'mockVideosRouter');
    const authRouterCallIndex = calls.findIndex(call => call[0] === '/auth' && call[1] === 'mockAuthRouter');
    const hashnodeRouterCallIndex = calls.findIndex(
      call => call[0] === '/hashnode' && call[1] === 'mockHashnodeRouter'
    );
    const errorHandlerCallIndex = calls.findIndex(call => call[0] === 'mockErrorHandler');

    // All middleware should be found
    expect(videosRouterCallIndex).not.toBe(-1);
    expect(authRouterCallIndex).not.toBe(-1);
    expect(hashnodeRouterCallIndex).not.toBe(-1);
    expect(errorHandlerCallIndex).not.toBe(-1);

    // Error handler should be after routes
    expect(errorHandlerCallIndex).toBeGreaterThan(videosRouterCallIndex);
    expect(errorHandlerCallIndex).toBeGreaterThan(authRouterCallIndex);
    expect(errorHandlerCallIndex).toBeGreaterThan(hashnodeRouterCallIndex);
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
    await expect(() => import('./index')).rejects.toThrow('Base app creation failed');
  });
});
