import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasuraClient } from '../../client';
import { getPlaylistVideos, getUsers } from './index';
import { PlaylistDetailQuery, UsersQuery } from '../../generated-graphql/graphql';

// Mock the hasura client
vi.mock('../../client', () => {
  const mockRequest = vi.fn();
  return {
    hasuraClient: {
      request: mockRequest,
    },
  };
});

describe('getPlaylistVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPlaylistId = 'test-playlist-id';
  const mockEmails = ['user1@example.com', 'user2@example.com'];

  const mockResponse = {
    playlist_by_pk: {
      playlist_videos: [
        {
          video: {
            id: 'video-1',
            status: 'ready',
          },
        },
      ],
    },
    users: [
      {
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        username: 'user2',
      },
    ],
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    await getPlaylistVideos(mockPlaylistId, mockEmails);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.stringContaining('query PlaylistDetail'),
      variables: {
        id: mockPlaylistId,
        emails: mockEmails,
      },
    });
  });

  it('should return playlist_by_pk from the response', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockResponse);

    const result = await getPlaylistVideos(mockPlaylistId, mockEmails);

    expect(result).toEqual(mockResponse);
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(getPlaylistVideos(mockPlaylistId, mockEmails)).rejects.toThrow(mockError);
  });
});

describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEmails = ['user1@example.com', 'user2@example.com'];

  const mockUsersResponse: UsersQuery = {
    users: [
      {
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        username: 'user2',
      },
    ],
  };

  it('should call hasuraClient.request with correct parameters', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockUsersResponse);

    await getUsers(mockEmails);

    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.any(String),
      variables: {
        emails: mockEmails,
      },
    });
  });

  it('should return users data from the response', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce(mockUsersResponse);

    const result = await getUsers(mockEmails);

    expect(result).toEqual(mockUsersResponse);
  });

  it('should throw an error when hasuraClient.request fails', async () => {
    const mockError = new Error('GraphQL request failed');
    vi.mocked(hasuraClient.request).mockRejectedValueOnce(mockError);

    await expect(getUsers(mockEmails)).rejects.toThrow(mockError);
  });

  it('should handle empty email array', async () => {
    vi.mocked(hasuraClient.request).mockResolvedValueOnce({ users: [] });

    const result = await getUsers([]);

    expect(result).toEqual({ users: [] });
    expect(hasuraClient.request).toHaveBeenCalledWith({
      document: expect.any(String),
      variables: {
        emails: [],
      },
    });
  });
});
