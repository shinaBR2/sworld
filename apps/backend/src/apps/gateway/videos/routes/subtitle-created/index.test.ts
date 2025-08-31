import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from 'vitest';
import { subtitleCreatedHandler } from './index';
import { streamSubtitleFile } from 'src/services/videos/helpers/subtitle';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { saveSubtitle } from 'src/services/hasura/mutations/videos/save-subtitle';
import type { SubtitleCreatedRequest } from 'src/schema/videos/subtitle-created';

// Mock dependencies with proper typing
vi.mock('src/services/videos/helpers/subtitle', () => ({
  streamSubtitleFile: vi.fn(),
}));

vi.mock('src/services/videos/helpers/gcp-cloud-storage', () => ({
  getDownloadUrl: vi
    .fn()
    .mockImplementation(
      (path: string) => `https://storage.googleapis.com/test-bucket/${path}`,
    ),
}));

vi.mock('src/services/hasura/mutations/videos/save-subtitle', () => ({
  saveSubtitle: vi.fn(),
}));

// Type the mocks for better type safety
const mockStreamSubtitleFile = streamSubtitleFile as MockedFunction<
  typeof streamSubtitleFile
>;
const mockGetDownloadUrl = getDownloadUrl as MockedFunction<
  typeof getDownloadUrl
>;
const mockSaveSubtitle = saveSubtitle as MockedFunction<typeof saveSubtitle>;

describe('subtitleCreatedHandler', () => {
  const mockData: SubtitleCreatedRequest = {
    event: {
      data: {
        id: 'subtitle-123',
        videoId: 'video-123',
        userId: 'user-123',
        lang: 'en',
        url: 'https://example.com/subtitle.vtt',
        isDefault: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      metadata: {
        id: 'event-123',
        span_id: 'span-123',
        trace_id: 'trace-123',
      },
    },
    contentTypeHeader: 'application/json',
    signatureHeader: 'test-signature',
  };

  const mockSubtitle = {
    id: 'subtitle-123',
    url: 'https://storage.example.com/videos/user-123/video-123/en.vtt',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStreamSubtitleFile.mockResolvedValue(undefined);
    mockGetDownloadUrl.mockImplementation(
      (path: string) => `https://storage.googleapis.com/test-bucket/${path}`,
    );
    mockSaveSubtitle.mockResolvedValue(mockSubtitle);
  });

  it('should process subtitle created event successfully', async () => {
    const expectedStoragePath = 'videos/user-123/video-123/en.vtt';
    const expectedDownloadUrl = `https://storage.googleapis.com/test-bucket/${expectedStoragePath}`;

    const result = await subtitleCreatedHandler(mockData);

    // Verify streamSubtitleFile was called with correct parameters
    expect(mockStreamSubtitleFile).toHaveBeenCalledWith({
      url: mockData.event.data.url,
      storagePath: expectedStoragePath,
      contentType: 'text/vtt',
    });

    // Verify getDownloadUrl was called with the correct storage path
    expect(mockGetDownloadUrl).toHaveBeenCalledWith(expectedStoragePath);

    // Verify saveSubtitle was called with the correct parameters
    expect(mockSaveSubtitle).toHaveBeenCalledWith(mockData.event.data.id, {
      url: expectedDownloadUrl,
    });

    // Verify the response
    expect(result).toEqual({
      success: true,
      message: 'ok',
      dataObject: mockSubtitle,
    });
  });

  it('should throw an error if streamSubtitleFile fails', async () => {
    const error = new Error('Stream failed');
    mockStreamSubtitleFile.mockRejectedValueOnce(error);

    await expect(subtitleCreatedHandler(mockData)).rejects.toThrow(error);
    expect(mockSaveSubtitle).not.toHaveBeenCalled();
  });

  it('should throw an error if saveSubtitle fails', async () => {
    const error = new Error('Save failed');
    mockSaveSubtitle.mockRejectedValueOnce(error);

    await expect(subtitleCreatedHandler(mockData)).rejects.toThrow(error);
    expect(mockStreamSubtitleFile).toHaveBeenCalled();
  });
});
