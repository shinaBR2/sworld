import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CrawlData, CrawlParams } from './type';
import { buildVariables } from './utils';

describe('buildVariables', () => {
  const mockUserId = 'user-123';
  const mockTitle = 'Test Video';
  const mockSlugPrefix = 'test-';
  const mockTimestamp = 1234567890;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockTimestamp)); // Change this line to use new Date()
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockResult: { data: CrawlData[] } = {
    data: [
      { videoUrl: 'https://example.com/video1' },
      { videoUrl: 'https://example.com/video2' },
    ],
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
        slug: `${mockSlugPrefix}-${mockTimestamp}`,
        video_url: 'https://example.com/video1',
        user_id: mockUserId,
      },
      {
        title: mockTitle,
        slug: `${mockSlugPrefix}-${mockTimestamp}`,
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
        title: `${mockTitle} - Tập 1`,
        slug: `${mockSlugPrefix}1--${mockTimestamp}`,
        video_url: 'https://example.com/video1',
        user_id: mockUserId,
        playlist_videos: {
          data: [
            {
              position: 1,
              playlist: {
                data: {
                  title: mockTitle,
                  slug: `${mockSlugPrefix}--${mockTimestamp}`,
                  user_id: mockUserId,
                },
                on_conflict: {
                  constraint: 'playlist_user_id_slug_key',
                  update_columns: ['updated_at'],
                },
              },
            },
          ],
        },
      },
      {
        title: `${mockTitle} - Tập 2`,
        slug: `${mockSlugPrefix}2--${mockTimestamp}`,
        video_url: 'https://example.com/video2',
        user_id: mockUserId,
        playlist_videos: {
          data: [
            {
              position: 2,
              playlist: {
                data: {
                  title: mockTitle,
                  slug: `${mockSlugPrefix}--${mockTimestamp}`,
                  user_id: mockUserId,
                },
                on_conflict: {
                  constraint: 'playlist_user_id_slug_key',
                  update_columns: ['updated_at'],
                },
              },
            },
          ],
        },
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
    const timestamps = result.map((video) => video.slug.split('--')[1]);

    expect(new Set(timestamps).size).toBe(1);
    expect(timestamps[0]).toBe(mockTimestamp.toString());
  });
});
