import { describe, expect, it, vi } from 'vitest';

// Create mock functions
const mockPost = vi.fn();
const mockRouter = { post: mockPost };
const mockValidateRequest = vi.fn().mockReturnValue('mockMiddleware');

// Mock dependencies
vi.mock('express', () => {
  const mockExpress = () => ({});
  mockExpress.Router = () => mockRouter;

  return {
    default: mockExpress,
    __esModule: true,
  };
});

vi.mock('src/utils/validator', () => ({
  validateRequest: mockValidateRequest,
}));

vi.mock('./routes/crawl', () => ({
  crawlHandler: 'mockCrawlHandler',
}));

vi.mock('src/schema/videos/crawl', () => ({
  crawlHandlerSchema: 'mockSchema',
  CrawlHandlerRequest: {},
}));

describe('crawlerRouter', () => {
  it('should set up router correctly', async () => {
    // Import the module under test
    const { crawlerRouter } = await import('./index');

    // Basic verification
    expect(crawlerRouter).toBe(mockRouter);
    expect(mockValidateRequest).toHaveBeenCalledWith('mockSchema');
    expect(mockPost).toHaveBeenCalledWith(
      '/crawl-handler',
      'mockMiddleware',
      'mockCrawlHandler',
    );
  });
});
