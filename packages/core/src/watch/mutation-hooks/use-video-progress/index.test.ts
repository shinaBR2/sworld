import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useVideoProgress } from './index';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

vi.mock('../../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));

describe('useVideoProgress', () => {
  const mockVideoId = 'test-video-123';
  const mockGetAccessToken = vi.fn().mockResolvedValue('test-token');
  const mockOnError = vi.fn();
  const mockMutate = vi.fn();
  let mockUseMutationOptions: { onError?: (error: unknown) => void };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockUseMutationOptions = {};
    vi.mocked(useMutationRequest).mockImplementation(params => {
      mockUseMutationOptions = params.options || {};
      return {
        mutate: mockMutate,
        isLoading: false,
      };
    });

    // vi.mocked(useMutationRequest).mockReturnValue({
    //   mutate: mockMutate,
    //   isLoading: false,
    // });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
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

  it('should handle periodic progress updates during playback', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();

    vi.advanceTimersByTime(14000);
    expect(mockMutate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 5,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should save progress immediately on pause', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 7.8 });
    result.current.handlePause();

    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 7,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should save progress immediately on seek', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleSeek(15.7);

    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 15,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should save progress on video end', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 100 });
    result.current.handleEnded();

    expect(mockMutate).toHaveBeenCalledWith({
      videoId: mockVideoId,
      progressSeconds: 100,
      lastWatchedAt: expect.any(String),
    });
  });

  it('should clear interval on cleanup', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();
    result.current.cleanup();

    vi.advanceTimersByTime(15000);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle error in mutation correctly', () => {
    const error = new Error('Update failed');
    renderVideoProgressHook();

    // Verify the onError callback was registered
    expect(mockUseMutationOptions.onError).toBeDefined();

    // Trigger the error callback
    act(() => {
      mockUseMutationOptions.onError?.(error);
    });

    // Verify error was logged and callback was called
    expect(console.error).toHaveBeenCalledWith('Failed to update video progress:', error);
    expect(mockOnError).toHaveBeenCalledWith(error);
  });

  it('should handle non-Error objects in error callback', () => {
    const nonErrorObject = { message: 'Custom error object' };
    renderVideoProgressHook();

    act(() => {
      mockUseMutationOptions.onError?.(nonErrorObject);
    });

    expect(console.error).toHaveBeenCalledWith('Failed to update video progress:', nonErrorObject);
    expect(mockOnError).toHaveBeenCalledWith(nonErrorObject);
  });

  it('should not throw if onError prop is not provided', () => {
    // Render hook without onError prop
    renderHook(() =>
      useVideoProgress({
        videoId: mockVideoId,
        getAccessToken: mockGetAccessToken,
      })
    );

    const error = new Error('Update failed');

    // Should not throw when calling error callback without onError prop
    expect(() => {
      act(() => {
        mockUseMutationOptions.onError?.(error);
      });
    }).not.toThrow();

    expect(console.error).toHaveBeenCalledWith('Failed to update video progress:', error);
  });

  it('should not start multiple intervals on repeated play calls', () => {
    const { result } = renderVideoProgressHook();

    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();
    result.current.handlePlay(); // Second call should be ignored

    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('should clear interval when pausing during playback', () => {
    const { result } = renderVideoProgressHook();

    // Start playback with interval
    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();

    // Verify interval is running
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Pause during playback
    result.current.handlePause();

    // Verify interval was cleared by checking no more mutations occur
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(2); // Only the immediate save from pause
  });

  it('should clear interval when seeking during playback', () => {
    const { result } = renderVideoProgressHook();

    // Start playback with interval
    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();

    // Verify interval is running
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Seek during playback
    result.current.handleSeek(10);

    // Verify interval was cleared by checking no more mutations occur
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(2); // Only the immediate save from seek
  });

  it('should handle seek-play sequence correctly', () => {
    const { result } = renderVideoProgressHook();

    // Start initial playback
    result.current.handleProgress({ playedSeconds: 5 });
    result.current.handlePlay();

    // Verify initial interval is running
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Simulate seek sequence:
    // 1. Seek occurs
    result.current.handleSeek(10);
    expect(mockMutate).toHaveBeenCalledTimes(2); // Immediate save from seek

    // 2. React Player automatically plays after seek
    result.current.handlePlay();

    // 3. Verify new interval is working
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(3); // New interval save

    // 4. Verify subsequent interval calls continue
    vi.advanceTimersByTime(15000);
    expect(mockMutate).toHaveBeenCalledTimes(4);
  });
});
