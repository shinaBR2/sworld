import { createBaseApp } from 'src/utils/base-app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../utils/error-handler';

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

vi.mock('./crawler', () => ({
  crawlerRouter: 'mockCrawlerRouter',
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
    vi.resetModules();
  });

  it('should create base app', async () => {
    await import('./index');
    expect(createBaseApp).toHaveBeenCalled();
  });

  it('should set up videos route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const videoRouteCall = useCalls.find(call => call[0] === '/videos' && call[1] === 'mockVideosRouter');
    expect(videoRouteCall).toBeTruthy();
  });

  it('should set up crawler route', async () => {
    await import('./index');
    const useCalls = mockUse.mock.calls;
    const crawlerRouteCall = useCalls.find(call => call[0] === '/crawlers' && call[1] === 'mockCrawlerRouter');
    expect(crawlerRouteCall).toBeTruthy();
  });

  it('should set up error handler with logger', async () => {
    await import('./index');
    expect(errorHandler).toHaveBeenCalledWith('mockLogger');
    const errorHandlerCall = mockUse.mock.calls.find(call => call[0] === 'mockErrorHandler');
    expect(errorHandlerCall).toBeTruthy();
  });

  it('should set up middleware in correct order', async () => {
    await import('./index');
    const calls = mockUse.mock.calls;

    const videosRouterCallIndex = calls.findIndex(call => call[0] === '/videos' && call[1] === 'mockVideosRouter');
    const crawlerRouterCallIndex = calls.findIndex(call => call[0] === '/crawlers' && call[1] === 'mockCrawlerRouter');
    const errorHandlerCallIndex = calls.findIndex(call => call[0] === 'mockErrorHandler');

    expect(videosRouterCallIndex).not.toBe(-1);
    expect(crawlerRouterCallIndex).not.toBe(-1);
    expect(errorHandlerCallIndex).not.toBe(-1);

    expect(errorHandlerCallIndex).toBeGreaterThan(videosRouterCallIndex);
    expect(errorHandlerCallIndex).toBeGreaterThan(crawlerRouterCallIndex);
  });

  it('should export configured app', async () => {
    const { app } = await import('./index');
    expect(app).toBe(mockBaseApp);
  });

  it('should throw if createBaseApp fails', async () => {
    const error = new Error('Base app creation failed');
    vi.mocked(createBaseApp).mockImplementationOnce(() => {
      throw error;
    });

    await expect(() => import('./index')).rejects.toThrow('Base app creation failed');
  });
});
