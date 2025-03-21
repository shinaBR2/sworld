import { describe, expect, it, vi } from 'vitest';
import { DialogState } from './types';
import { buildVariables, canPlayUrls, CREATE_NEW_PLAYLIST } from './utils';

// First, we need to export the formalizeState function from utils.ts
// Add this to the exports in utils.ts:
// export { buildVariables, canPlayUrls, CLOSE_DELAY_MS, CREATE_NEW_PLAYLIST, formalizeState };

// Then import it in the test file
import { formalizeState } from './utils';

// Mock react-player
vi.mock('react-player', () => ({
  default: {
    canPlay: vi.fn((url: string) => {
      // Simulate canPlay logic for testing
      return url.includes('youtube.com') || url.includes('vimeo.com');
    }),
  },
}));

// Add tests for formalizeState
describe('formalizeState', () => {
  it('should trim string values in the dialog state', () => {
    const dialogState = {
      title: '  Test Title  ',
      description: ' Test Description ',
      url: '  https://example.com/video  ',
      playlistId: 'playlist-123',
      newPlaylistName: '  New Playlist  ',
      videoPositionInPlaylist: 5,
    } as DialogState;

    const result = formalizeState(dialogState);

    expect(result).toEqual({
      title: 'Test Title',
      description: 'Test Description',
      url: 'https://example.com/video',
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
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: undefined,
      videoPositionInPlaylist: 10,
    });
  });
});

describe('canPlayUrls', () => {
  it('should validate URLs correctly', async () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/123456',
      'https://invalid-url.com',
      '  https://www.youtube.com/watch?v=abc123  ',
    ];

    const results = await canPlayUrls(urls);

    expect(results).toHaveLength(4);
    expect(results[0]).toEqual({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isValid: true,
    });
    expect(results[1]).toEqual({
      url: 'https://vimeo.com/123456',
      isValid: true,
    });
    expect(results[2]).toEqual({
      url: 'https://invalid-url.com',
      isValid: false,
    });
    expect(results[3]).toEqual({
      url: 'https://www.youtube.com/watch?v=abc123',
      isValid: true,
    });
  });

  it('should handle empty and whitespace-only inputs', async () => {
    const urls = ['', '   ', null, undefined];

    const results = await canPlayUrls(urls as string[]);

    expect(results).toHaveLength(0);
  });

  it('should trim whitespace from URLs', async () => {
    const urls = ['  https://www.youtube.com/watch?v=dQw4w9WgXcQ  '];

    const results = await canPlayUrls(urls);

    expect(results[0].url).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
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
        },
      ],
    });
  });

  it('should add playlist data when playlistId is provided (isUseExistedPlaylist)', () => {
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

  it('should use provided videoPositionInPlaylist for existing playlist (isUseExistedPlaylist)', () => {
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

  it('should create new playlist when playlistId is CREATE_NEW_PLAYLIST and newPlaylistName is provided (isCreateNewPlaylist)', () => {
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

  it('should use provided videoPositionInPlaylist for new playlist (isCreateNewPlaylist)', () => {
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
          // No playlist_videos property
        },
      ],
    });
  });

  it('should prioritize existing playlist when both playlistId and newPlaylistName are provided (isUseExistedPlaylist)', () => {
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
});
