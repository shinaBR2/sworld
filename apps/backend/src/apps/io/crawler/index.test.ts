import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock Hono
const mockPost = vi.fn();
const mockHono = vi.fn(() => ({
  post: mockPost,
}));

vi.mock('hono', () => ({
  Hono: mockHono,
}));

// Mock dependencies
vi.mock('./routes/crawl', () => ({
  crawlHandler: 'mockCrawlHandler',
}));

vi.mock('src/schema/videos/crawl', () => ({
  crawlHandlerSchema: 'mockSchema',
}));

vi.mock('src/utils/validators/request', () => ({
  honoValidateRequest: vi.fn().mockReturnValue('mockMiddleware'),
}));

vi.mock('src/utils/requestHandler', () => ({
  honoRequestHandler: vi.fn().mockReturnValue('mockHandler'),
}));

describe('crawlerRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set up router correctly', async () => {
    // Import the module under test and its dependencies
    await import('./index');
    const { honoValidateRequest } = await import(
      'src/utils/validators/request'
    );
    const { honoRequestHandler } = await import('src/utils/requestHandler');

    // Verify Hono router was created
    expect(mockHono).toHaveBeenCalled();

    // Verify the route was set up correctly
    expect(mockPost).toHaveBeenCalledWith(
      '/crawl-handler',
      'mockMiddleware',
      'mockHandler',
    );

    // Verify middleware and handler were properly wrapped
    expect(honoValidateRequest).toHaveBeenCalledWith('mockSchema');
    expect(honoRequestHandler).toHaveBeenCalledWith('mockCrawlHandler');
  });
});
