import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasuraClient } from '../../client';
import { insertSharedVideoRecipients } from './index';
import { InsertshareMutation } from '../../generated-graphql/graphql';

// Mock the hasura client
vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('insertSharedVideoRecipients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlaylistId = 'playlist-1';
  const mockEmails = ['user1@example.com', 'user2@example.com'];
  const mockObjects = [
    {
      videoId: 'video-1',
      playlistId: mockPlaylistId,
      receiverId: 'user-1',
    },
    {
      videoId: 'video-2',
      playlistId: mockPlaylistId,
      receiverId: 'user-2',
    },
  ];

  const mockResponse = {
    insert_shared_video_recipients: {
      returning: [{ id: 'record-1' }, { id: 'record-2' }],
    },
    update_playlist_by_pk: {
      id: mockPlaylistId,
      sharedRecipients: mockEmails,
    },
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await insertSharedVideoRecipients(mockObjects, mockPlaylistId, mockEmails);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('mutation insertshare'),
      variables: {
        objects: mockObjects,
        playlistId: mockPlaylistId,
        sharedRecipients: mockEmails,
      },
    });
  });

  it('should return both inserted records and updated playlist', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await insertSharedVideoRecipients(mockObjects, mockPlaylistId, mockEmails);

    expect(result).toEqual({
      insert_shared_video_recipients: mockResponse.insert_shared_video_recipients,
      update_playlist_by_pk: mockResponse.update_playlist_by_pk,
    });
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(insertSharedVideoRecipients(mockObjects, mockPlaylistId, mockEmails)).rejects.toThrow(mockError);
  });

  it('should throw an error when insert_shared_video_recipients is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      update_playlist_by_pk: mockResponse.update_playlist_by_pk,
    } as InsertshareMutation);

    await expect(insertSharedVideoRecipients(mockObjects, mockPlaylistId, mockEmails)).rejects.toThrow(
      'Failed to insert shared video recipients or update playlist'
    );
  });

  it('should throw an error when update_playlist_by_pk is missing', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({
      insert_shared_video_recipients: mockResponse.insert_shared_video_recipients,
    } as InsertshareMutation);

    await expect(insertSharedVideoRecipients(mockObjects, mockPlaylistId, mockEmails)).rejects.toThrow(
      'Failed to insert shared video recipients or update playlist'
    );
  });
});
