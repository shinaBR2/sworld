import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CrawlData, CrawlParams } from './type';
import { buildVariables } from './utils';

describe('buildVariables', () => {
  const mockUserId = 'user-123';
  const mockTitle = 'Test Video';
  const mockSlugPrefix = 'test-';
  const mockTimestamp = 1234567890;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockResult: { data: CrawlData[] } = {
    data: [{ videoUrl: 'https://example.com/video1' }, { videoUrl: 'https://example.com/video2' }],
  };

  it('should build variables for single video with timestamp in slug', () => {
    const params: CrawlParams = {
      getSingleVideo: true,
      title: mockTitle,
      slugPrefix: mockSlugPrefix,
      userId: mockUserId,
    };

    const result = buildVariables(mockResult, params);

    expect(result).toEqual([
      {
        title: mockTitle,
        slug: `test-1--${mockTimestamp}`,
        video_url: 'https://example.com/video1',
        user_id: mockUserId,
      },
      {
        title: mockTitle,
        slug: `test-2--${mockTimestamp}`,
        video_url: 'https://example.com/video2',
        user_id: mockUserId,
      },
    ]);
  });

  it('should build variables for playlist videos with timestamp in slug', () => {
    const params: CrawlParams = {
      getSingleVideo: false,
      title: mockTitle,
      slugPrefix: mockSlugPrefix,
      userId: mockUserId,
    };

    const result = buildVariables(mockResult, params);

    expect(result).toEqual([
      {
        title: 'Test Video - 1',
        slug: `test-1--${mockTimestamp}`,
        video_url: 'https://example.com/video1',
        user_id: mockUserId,
      },
      {
        title: 'Test Video - 2',
        slug: `test-2--${mockTimestamp}`,
        video_url: 'https://example.com/video2',
        user_id: mockUserId,
      },
    ]);
  });

  it('should handle empty data array', () => {
    const params: CrawlParams = {
      getSingleVideo: true,
      title: mockTitle,
      slugPrefix: mockSlugPrefix,
      userId: mockUserId,
    };

    const emptyResult = { data: [] };
    const result = buildVariables(emptyResult, params);

    expect(result).toEqual([]);
  });

  it('should use same timestamp for all videos in batch', () => {
    const params: CrawlParams = {
      getSingleVideo: true,
      title: mockTitle,
      slugPrefix: mockSlugPrefix,
      userId: mockUserId,
    };

    const result = buildVariables(mockResult, params);
    const timestamps = result.map(video => video.slug.split('--')[1]);

    expect(new Set(timestamps).size).toBe(1);
    expect(timestamps[0]).toBe(mockTimestamp.toString());
  });
});
