import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasuraClient } from '../../client';
import { sharePlaylist, shareVideo } from './index';
import type {
  SharePlaylistMutation,
  ShareVideoMutation,
} from '../../generated-graphql/graphql';

// Mock the hasura client
vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('sharePlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlaylistId = 'playlist-1';
  const mockEmails = ['user1@example.com', 'user2@example.com'];
  const mockObjects = [
    {
      playlistId: mockPlaylistId,
      recipientId: 'user-1',
    },
    {
      playlistId: mockPlaylistId,
      recipientId: 'user-2',
    },
  ];

  const mockResponse = {
    insert_shared_playlist_recipients: {
      returning: [{ id: 'record-1' }, { id: 'record-2' }],
    },
    update_playlist_by_pk: {
      id: mockPlaylistId,
      sharedRecipients: mockEmails,
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await sharePlaylist(mockObjects, mockPlaylistId, mockEmails);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation sharePlaylist'),
      variables: {
        objects: mockObjects,
        playlistId: mockPlaylistId,
        sharedRecipients: mockEmails,
      },
    });
  });

  it('should return both inserted records and updated playlist', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await sharePlaylist(mockObjects, mockPlaylistId, mockEmails);

    expect(result).toEqual({
      insert_shared_playlist_recipients: {
        returning: mockResponse.insert_shared_playlist_recipients.returning.map(
          (record) => ({
            id: String(record.id),
          }),
        ),
      },
      update_playlist_by_pk: {
        id: mockResponse.update_playlist_by_pk.id,
        sharedRecipients: mockResponse.update_playlist_by_pk.sharedRecipients,
      },
    });
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(
      sharePlaylist(mockObjects, mockPlaylistId, mockEmails),
    ).rejects.toThrow(mockError);
  });

  it('should throw an error when insert_shared_playlist_recipients is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_playlist_by_pk: mockResponse.update_playlist_by_pk,
    } as SharePlaylistMutation);

    await expect(
      sharePlaylist(mockObjects, mockPlaylistId, mockEmails),
    ).rejects.toThrow(
      'Failed to insert shared playlist recipients or update playlist',
    );
  });

  it('should throw an error when update_playlist_by_pk is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      insert_shared_playlist_recipients:
        mockResponse.insert_shared_playlist_recipients,
    } as SharePlaylistMutation);

    await expect(
      sharePlaylist(mockObjects, mockPlaylistId, mockEmails),
    ).rejects.toThrow(
      'Failed to insert shared playlist recipients or update playlist',
    );
  });
});

describe('shareVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVideoId = 'video-1';
  const mockEmails = ['user1@example.com', 'user2@example.com'];
  const mockObjects = [
    {
      videoId: mockVideoId,
      recipientId: 'user-1',
    },
    {
      videoId: mockVideoId,
      recipientId: 'user-2',
    },
  ];

  const mockResponse = {
    insert_shared_video_recipients: {
      returning: [{ id: 'record-1' }, { id: 'record-2' }],
    },
    update_videos_by_pk: {
      id: mockVideoId,
      sharedRecipients: mockEmails,
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await shareVideo(mockObjects, mockVideoId, mockEmails);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation shareVideo'),
      variables: {
        objects: mockObjects,
        videoId: mockVideoId,
        sharedRecipients: mockEmails,
      },
    });
  });

  it('should return both inserted records and updated video', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await shareVideo(mockObjects, mockVideoId, mockEmails);

    expect(result).toEqual({
      insert_shared_video_recipients: {
        returning: mockResponse.insert_shared_video_recipients.returning.map(
          (record) => ({
            id: String(record.id),
          }),
        ),
      },
      update_videos_by_pk: {
        id: mockResponse.update_videos_by_pk.id,
        sharedRecipients: mockResponse.update_videos_by_pk.sharedRecipients,
      },
    });
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(
      shareVideo(mockObjects, mockVideoId, mockEmails),
    ).rejects.toThrow(mockError);
  });

  it('should throw an error when insert_shared_video_recipients is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_videos_by_pk: mockResponse.update_videos_by_pk,
    } as ShareVideoMutation);

    await expect(
      shareVideo(mockObjects, mockVideoId, mockEmails),
    ).rejects.toThrow(
      'Failed to insert shared video recipients or update video',
    );
  });

  it('should throw an error when update_videos_by_pk is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      insert_shared_video_recipients:
        mockResponse.insert_shared_video_recipients,
    } as ShareVideoMutation);

    await expect(
      shareVideo(mockObjects, mockVideoId, mockEmails),
    ).rejects.toThrow(
      'Failed to insert shared video recipients or update video',
    );
  });
});
