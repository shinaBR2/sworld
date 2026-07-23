import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getToken } from './auth';
import {
  importTelegramArchive,
  listTelegramChannelVideos,
  requestTelegramLoginCode,
  submitTelegramLoginCode,
} from './telegram';

vi.mock('./auth', () => ({ getToken: vi.fn() }));
vi.mock('../../envConfig', () => ({
  hasuraConfig: { url: 'https://hasura.test/v1/graphql' },
}));

const mockFetch = vi.fn();

// Build a fetch response whose json() resolves to `body`.
const jsonResponse = (body: unknown) => ({ json: async () => body });

describe('background/telegram actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getToken).mockResolvedValue('jwt-token');
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listTelegramChannelVideos', () => {
    it('sends the bridged token and returns videos + nextCursor on success', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: {
            listTelegramChannelVideos: {
              success: true,
              message: 'ok',
              dataObject: {
                videos: [
                  { id: '10', filename: 'a.mp4', date: '2024-01-01T00:00:00Z' },
                ],
                nextCursor: '9',
              },
            },
          },
        }),
      );

      const result = await listTelegramChannelVideos('-123', '20');

      // Auth header + endpoint + variables are all correct.
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hasura.test/v1/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer jwt-token',
          }),
        }),
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables).toEqual({
        input: { channelId: '-123', cursor: '20' },
      });

      expect(result).toEqual({
        success: true,
        message: 'ok',
        videos: [{ id: '10', filename: 'a.mp4', date: '2024-01-01T00:00:00Z' }],
        nextCursor: '9',
      });
    });

    it('passes NO_SESSION through so the popup can show the login prompt', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: {
            listTelegramChannelVideos: {
              success: false,
              message: 'NO_SESSION',
              dataObject: null,
            },
          },
        }),
      );

      const result = await listTelegramChannelVideos('-123');
      expect(result).toEqual({
        success: false,
        message: 'NO_SESSION',
        videos: [],
        nextCursor: undefined,
      });
    });

    it('returns Not authenticated without calling fetch when there is no token', async () => {
      vi.mocked(getToken).mockResolvedValue(null);
      const result = await listTelegramChannelVideos('-123');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Not authenticated');
    });

    it('surfaces a GraphQL error message', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ errors: [{ message: 'permission denied' }] }),
      );
      const result = await listTelegramChannelVideos('-123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('permission denied');
    });

    it('surfaces a network error', async () => {
      mockFetch.mockRejectedValue(new Error('offline'));
      const result = await listTelegramChannelVideos('-123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('offline');
    });
  });

  describe('importTelegramArchive', () => {
    it('returns the taskId on success', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: {
            importTelegramArchive: {
              success: true,
              message: 'ok',
              dataObject: { taskId: 'task-1' },
            },
          },
        }),
      );

      const result = await importTelegramArchive('-123', ['10', '11']);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables).toEqual({
        input: { channelId: '-123', messageIds: ['10', '11'] },
      });
      expect(result).toEqual({
        success: true,
        message: 'ok',
        taskId: 'task-1',
      });
    });
  });

  describe('login actions', () => {
    it('requestTelegramLoginCode returns the success envelope', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: {
            requestTelegramLoginCode: { success: true, message: 'sent' },
          },
        }),
      );
      const result = await requestTelegramLoginCode();
      expect(result).toEqual({ success: true, message: 'sent' });
    });

    it('submitTelegramLoginCode sends the code and returns the envelope', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: { submitTelegramLoginCode: { success: true, message: 'ok' } },
        }),
      );
      const result = await submitTelegramLoginCode('12345');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables).toEqual({ input: { code: '12345' } });
      expect(result).toEqual({ success: true, message: 'ok' });
    });

    it('maps an invalid code failure through the message', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: {
            submitTelegramLoginCode: {
              success: false,
              message: 'INVALID_CODE',
            },
          },
        }),
      );
      const result = await submitTelegramLoginCode('00000');
      expect(result).toEqual({ success: false, message: 'INVALID_CODE' });
    });
  });
});
