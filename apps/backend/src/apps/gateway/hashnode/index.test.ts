import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the handler
vi.mock('./routes/posts', () => ({
  postEventsHandler: 'mockPostEventsHandler',
}));

// Set up router mock with detailed tracking
const mockPost = vi.fn();
vi.mock('express', () => ({
  default: { Router: () => ({ post: mockPost }) },
  Router: () => ({ post: mockPost }),
}));

describe('hashnodeRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set up posts webhook route', async () => {
    // Import the module being tested
    await import('./index');

    // Verify the route was registered with the correct path
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe('/posts-webhook');

    // Verify we have the expected number of handlers
    expect(mockPost.mock.calls[0].length).toBe(3); // path + 2 middleware functions

    // Check the second handler is our mock handler
    expect(mockPost.mock.calls[0][2]).toBe('mockPostEventsHandler');
  });
});
