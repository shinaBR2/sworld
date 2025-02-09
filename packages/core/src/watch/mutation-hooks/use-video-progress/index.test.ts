import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVideoProgress } from './index';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

// Mock dependencies
vi.mock('../../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));

describe('useVideoProgress', () => {
  const mockVideoId = 'test-video-123';
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockOnError = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup default mock implementation
    vi.mocked(useMutationRequest).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderVideoProgressHook = () =>
    renderHook(() =>
      useVideoProgress({
        videoId: mockVideoId,
        getAccessToken: mockGetAccessToken,
        onError: mockOnError,
      })
    );

  it('should initialize with correct mutation config', () => {
    renderVideoProgressHook();

    expect(useMutationRequest).toHaveBeenCalledWith({
      document: expect.any(String),
      getAccessToken: mockGetAccessToken,
      options: expect.objectContaining({
        onError: expect.any(Function),
      }),
    });
  });

  it('should debounce progress updates', () => {
    const { result } = renderVideoProgressHook();

    // Call handleProgress multiple times
    result.current.handleProgress({ playedSeconds: 1 });
    result.current.handleProgress({ playedSeconds: 2 });
    result.current.handleProgress({ playedSeconds: 3 });

    // Fast-forward by 1 second
    vi.advanceTimersByTime(1000);
    expect(mockMutate).not.toHaveBeenCalled();

    // Fast-forward to trigger the debounced call
    vi.advanceTimersByTime(1000);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 3,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should cleanup timeout on unmount', () => {
    const { result, unmount } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 10 });

    // Run pending timers before unmounting
    vi.runOnlyPendingTimers();

    unmount();

    // Clear mock state after unmount
    mockMutate.mockClear();

    vi.advanceTimersByTime(2000);

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should floor played seconds in mutation', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 10.7 });
    vi.advanceTimersByTime(2000);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        progressSeconds: 10,
      })
    );
  });

  it('should clear existing timeout when new progress update comes in', () => {
    const { result } = renderVideoProgressHook();

    // Start first progress update
    result.current.handleProgress({ playedSeconds: 5 });

    // Advance timer partially
    vi.advanceTimersByTime(1000);

    // Start second progress update
    result.current.handleProgress({ playedSeconds: 10 });

    // Advance timer to when first update would have happened
    vi.advanceTimersByTime(1000);

    // First update should not have fired
    expect(mockMutate).not.toHaveBeenCalled();

    // Advance timer to when second update should happen
    vi.advanceTimersByTime(1000);

    // Only second update should have fired
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 10,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should handle cleanup explicitly', () => {
    const { result } = renderVideoProgressHook();

    // Start a progress update
    result.current.handleProgress({ playedSeconds: 5 });

    // Call cleanup explicitly
    result.current.cleanup();

    // Advance timer
    vi.advanceTimersByTime(2000);

    // Mutation should not be called after cleanup
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle multiple cleanups safely', () => {
    const { result } = renderVideoProgressHook();

    // Call cleanup multiple times
    result.current.cleanup();
    result.current.cleanup();

    // Should not throw
    expect(() => result.current.cleanup()).not.toThrow();
  });
});
