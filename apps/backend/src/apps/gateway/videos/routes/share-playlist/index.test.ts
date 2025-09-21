import { describe, it, vi, expect, beforeEach } from 'vitest';
import { AppError, AppResponse } from 'src/utils/schema';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { verifySignature } from 'src/services/videos/convert/validator';
import * as CustomErrorModule from 'src/utils/custom-error';
import { getPlaylistVideos } from 'src/services/hasura/queries/share';
import { sharePlaylist } from 'src/services/hasura/mutations/share-videos';
import { sharePlaylistHandler } from './index';

vi.mock('src/utils/envConfig', () => ({
  envConfig: {
    computeServiceUrl: 'http://compute',
    ioServiceUrl: 'http://io',
  },
}));

vi.mock('src/services/videos/convert/validator', () => ({
  verifySignature: vi.fn(),
}));

vi.mock('src/services/hasura/queries/share', () => ({
  getPlaylistVideos: vi.fn(),
}));

vi.mock('src/services/hasura/mutations/share-videos', () => ({
  sharePlaylist: vi.fn(),
}));

describe('sharePlaylistHandler', () => {
  let mockValidatedData: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CustomErrorModule.CustomError, 'critical');
    mockValidatedData = {
      validatedData: {
        signatureHeader: 'valid-signature',
        event: {
          data: {
            id: 'playlist-1',
            sharedRecipientsInput: ['user1@example.com', 'user2@example.com'],
          },
          metadata: {
            id: 'event-1',
          },
        },
      },
    };
  });

  it('should return error if no valid emails are provided', async () => {
    mockValidatedData.validatedData.event.data.sharedRecipientsInput = [
      'invalid-email',
    ];

    const result = await sharePlaylistHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('Invalid email', {
        eventId: 'event-1',
      }),
    );
  });

  it('should return error if playlist is not found', async () => {
    vi.mocked(getPlaylistVideos).mockResolvedValue({
      playlist_by_pk: null,
      users: [],
    });

    const result = await sharePlaylistHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('Playlist not found', {
        eventId: 'event-1',
      }),
    );
  });

  it('should return error if no ready videos found in playlist', async () => {
    vi.mocked(getPlaylistVideos).mockResolvedValue({
      playlist_by_pk: {
        playlist_videos: [],
      },
      users: [],
    });

    const result = await sharePlaylistHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('No ready videos found in playlist', {
        eventId: 'event-1',
      }),
    );
  });

  it('should return error if no valid users found', async () => {
    vi.mocked(getPlaylistVideos).mockResolvedValue({
      playlist_by_pk: {
        playlist_videos: [{ video: { id: 'video-1', status: 'ready' } }],
      },
      users: null,
    });

    const result = await sharePlaylistHandler(mockValidatedData);

    expect(result).toEqual(
      AppError('No valid users found', {
        eventId: 'event-1',
      }),
    );
  });

  it('should throw CustomError when sharePlaylist fails', async () => {
    vi.mocked(getPlaylistVideos).mockResolvedValue({
      playlist_by_pk: {
        playlist_videos: [{ video: { id: 'video-1', status: 'ready' } }],
      },
      users: [{ id: 'user-1', email: 'user1@example.com' }],
    });

    const mockError = new Error('Database error');
    vi.mocked(sharePlaylist).mockRejectedValue(mockError);

    await expect(sharePlaylistHandler(mockValidatedData)).rejects.toThrow(
      'Playlist share failed',
    );

    expect(CustomErrorModule.CustomError.critical).toHaveBeenCalledWith(
      'Playlist share failed',
      expect.objectContaining({
        errorCode: VIDEO_ERRORS.SHARE_FAILED,
        originalError: mockError,
        context: {
          data: mockValidatedData.validatedData.event.data,
          metadata: mockValidatedData.validatedData.event.metadata,
        },
        source: 'apps/gateway/videos/routes/share/index.ts',
      }),
    );
  });

  it('should successfully share playlist with valid users', async () => {
    vi.mocked(getPlaylistVideos).mockResolvedValue({
      playlist_by_pk: {
        playlist_videos: [
          { video: { id: 'video-1', status: 'ready' } },
          { video: { id: 'video-2', status: 'ready' } },
        ],
      },
      users: [
        { id: 'user-1', email: 'user1@example.com' },
        { id: 'user-2', email: 'user2@example.com' },
      ],
    });
    vi.mocked(sharePlaylist).mockResolvedValue({
      insert_shared_playlist_recipients: {
        returning: [{ id: 'record-1' }, { id: 'record-2' }],
      },
      update_playlist_by_pk: {
        id: 'playlist-1',
        sharedRecipients: ['user1@example.com', 'user2@example.com'],
      },
    });

    const result = await sharePlaylistHandler(mockValidatedData);

    expect(result).toEqual(AppResponse(true, 'ok'));

    expect(sharePlaylist).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          playlistId: 'playlist-1',
          recipientId: expect.any(String),
        }),
      ]),
      'playlist-1',
      ['user1@example.com', 'user2@example.com'],
    );
  });
});
