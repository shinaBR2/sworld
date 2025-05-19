import { describe, expect, it } from 'vitest';
import { DialogState } from './types';
import { buildVariables, canPlayUrls, CREATE_NEW_PLAYLIST, formalizeState } from './utils';

describe('formalizeState', () => {
  it('should trim string values in the dialog state', () => {
    const dialogState = {
      title: '  Test Title  ',
      description: ' Test Description ',
      url: '  https://example.com/video  ',
      subtitle: '  https://example.com/sub.vtt  ',
      playlistId: 'playlist-123',
      newPlaylistName: '  New Playlist  ',
      videoPositionInPlaylist: 5,
    } as DialogState;

    const result = formalizeState(dialogState);

    expect(result).toEqual({
      title: 'Test Title',
      description: 'Test Description',
      url: 'https://example.com/video',
      subtitle: 'https://example.com/sub.vtt',
      playlistId: 'playlist-123',
      newPlaylistName: 'New Playlist',
      videoPositionInPlaylist: 5,
    });
  });

  it('should handle null or undefined values', () => {
    const dialogState: DialogState = {
      title: undefined,
      description: '',
      url: '  https://example.com/video  ',
      // playlistId is missing
      newPlaylistName: undefined,
      videoPositionInPlaylist: 0,
    } as unknown as DialogState;

    const result = formalizeState(dialogState);

    expect(result).toEqual({
      title: undefined,
      description: '',
      url: 'https://example.com/video',
      subtitle: '',
      playlistId: undefined,
      newPlaylistName: undefined,
      videoPositionInPlaylist: 0,
    });
  });

  it('should preserve non-string values', () => {
    const dialogState: DialogState = {
      title: 'Test Title',
      url: 'https://example.com/video',
      playlistId: CREATE_NEW_PLAYLIST,
      videoPositionInPlaylist: 10,
    } as DialogState;

    const result = formalizeState(dialogState);

    expect(result).toEqual({
      title: 'Test Title',
      description: '',
      url: 'https://example.com/video',
      subtitle: '',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: undefined,
      videoPositionInPlaylist: 10,
    });
  });

  it('should preserve keepOriginalSource boolean value', () => {
    const dialogState: DialogState = {
      title: 'Test Title',
      url: 'https://example.com/video',
      keepOriginalSource: true,
    } as DialogState;

    const result = formalizeState(dialogState);

    expect(result).toEqual({
      title: 'Test Title',
      description: '',
      url: 'https://example.com/video',
      subtitle: '',
      playlistId: undefined,
      newPlaylistName: undefined,
      videoPositionInPlaylist: 0,
      keepOriginalSource: true,
    });
  });
});

describe('canPlayUrls', () => {
  it('should validate URLs correctly', () => {
    // Remove async
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/123456', // This should now fail
      'https://invalid-url.com',
      '  https://example.com/video.m3u8  ',
      'https://example.com/video.mp4',
      '  https://youtube.com/playlist?list=ABC123  ',
    ];

    const results = canPlayUrls(urls); // Remove await

    expect(results).toHaveLength(6);
    expect(results[0]).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isValid: true,
    });
    expect(results[1]).toEqual({
      url: 'https://vimeo.com/123456',
      isValid: false, // Now false as we don't support Vimeo
    });
    expect(results[2]).toEqual({
      url: 'https://invalid-url.com',
      isValid: false,
    });
    expect(results[3]).toEqual({
      url: 'https://example.com/video.m3u8',
      isValid: true,
    });
    expect(results[4]).toEqual({
      url: 'https://example.com/video.mp4',
      isValid: true,
    });
    expect(results[5]).toEqual({
      url: 'https://youtube.com/playlist?list=ABC123',
      isValid: true,
    });
  });

  it('should handle empty and whitespace-only inputs', () => {
    // Remove async
    const urls = ['', '   ', null, undefined];
    const results = canPlayUrls(urls as string[]); // Remove await
    expect(results).toHaveLength(0);
  });

  it('should trim whitespace from URLs', () => {
    // Remove async
    const urls = ['  https://example.com/video.mov?query=1  '];
    const results = canPlayUrls(urls); // Remove await
    expect(results[0].url).toBe('https://example.com/video.mov?query=1');
  });
});

describe('buildVariables', () => {
  it('should build basic video variables without playlist info', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
        },
      ],
    });
  });

  it('should handle missing description by using empty string', () => {
    const dialogState = {
      title: 'Test Video',
      url: 'https://example.com/video',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: '',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
        },
      ],
    });
  });

  it('should add playlist data when playlistId is provided', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: 'playlist-123',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                playlist_id: 'playlist-123',
                position: 0, // Default position
              },
            ],
          },
        },
      ],
    });
  });

  it('should use provided videoPositionInPlaylist for existing playlist', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: 'playlist-123',
      videoPositionInPlaylist: 5,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                playlist_id: 'playlist-123',
                position: 5,
              },
            ],
          },
        },
      ],
    });
  });

  it('should create new playlist when playlistId is CREATE_NEW_PLAYLIST and newPlaylistName is provided', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: 'My New Playlist',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                position: 0, // Default position
                playlist: {
                  data: {
                    title: 'My New Playlist',
                    slug: 'my-new-playlist',
                  },
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('should use provided videoPositionInPlaylist for new playlist', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: 'My New Playlist',
      videoPositionInPlaylist: 3,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                position: 3,
                playlist: {
                  data: {
                    title: 'My New Playlist',
                    slug: 'my-new-playlist',
                  },
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('should not add playlist data when playlistId is CREATE_NEW_PLAYLIST but newPlaylistName is missing', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: CREATE_NEW_PLAYLIST,
      // newPlaylistName is missing
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          // No playlist_videos property
        },
      ],
    });
  });

  it('should prioritize existing playlist when both playlistId and newPlaylistName are provided', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      playlistId: 'playlist-123', // Not CREATE_NEW_PLAYLIST
      newPlaylistName: 'My New Playlist', // This should be ignored
      videoPositionInPlaylist: 2,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                playlist_id: 'playlist-123',
                position: 2,
              },
            ],
          },
        },
      ],
    });
  });

  // Add new tests for subtitle handling
  it('should add subtitle data when subtitle URL is provided', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      subtitle: 'https://example.com/subtitle.vtt',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          subtitles: {
            data: [
              {
                url: 'https://example.com/subtitle.vtt',
                lang: 'vi',
                isDefault: true,
              },
            ],
          },
        },
      ],
    });
  });

  it('should not add subtitle data when subtitle URL is empty', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      subtitle: '',
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          // No subtitles property
        },
      ],
    });
  });

  it('should handle both subtitle and playlist data together', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      subtitle: 'https://example.com/subtitle.vtt',
      playlistId: 'playlist-123',
      videoPositionInPlaylist: 2,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
          playlist_videos: {
            data: [
              {
                playlist_id: 'playlist-123',
                position: 2,
              },
            ],
          },
          subtitles: {
            data: [
              {
                url: 'https://example.com/subtitle.vtt',
                lang: 'vi',
                isDefault: true,
              },
            ],
          },
        },
      ],
    });
  });

  it('should include keepOriginalSource in the output when true', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      keepOriginalSource: true,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: true,
        },
      ],
    });
  });

  it('should include false keepOriginalSource in the output when false', () => {
    const dialogState = {
      title: 'Test Video',
      description: 'Test Description',
      url: 'https://example.com/video',
      keepOriginalSource: false,
    } as DialogState;

    const result = buildVariables(dialogState);

    expect(result).toEqual({
      objects: [
        {
          title: 'Test Video',
          description: 'Test Description',
          slug: 'test-video',
          video_url: 'https://example.com/video',
          keepOriginalSource: false,
        },
      ],
    });
  });
});
