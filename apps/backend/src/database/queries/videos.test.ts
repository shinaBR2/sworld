import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Video } from '../models/video';
import { finalizeVideo } from './videos';

// Mock the Video model
vi.mock('../models/video', () => ({
  Video: {
    update: vi.fn(),
  },
}));

describe('finalizeVideo', () => {
  const mockProps = {
    id: '123',
    source: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update video with correct parameters', async () => {
    // Setup mock return value
    const mockUpdateResult = [1]; // Sequelize usually returns affected rows count
    (Video.update as any).mockResolvedValue(mockUpdateResult);

    // Execute
    const result = await finalizeVideo(mockProps);

    // Verify
    expect(Video.update).toHaveBeenCalledTimes(1);
    expect(Video.update).toHaveBeenCalledWith(
      {
        source: mockProps.source,
        status: 'ready',
        thumbnail_url: mockProps.thumbnailUrl,
      },
      {
        where: {
          id: mockProps.id,
        },
      }
    );
    expect(result).toBe(1);
  });

  it('should throw error when video is not found', async () => {
    (Video.update as Mock).mockResolvedValue([0]);

    await expect(finalizeVideo(mockProps)).rejects.toThrow(`Video with ID ${mockProps.id} not found`);
  });

  it('should handle database errors', async () => {
    // Setup mock to throw error
    const mockError = new Error('Database error');
    (Video.update as any).mockRejectedValue(mockError);

    // Execute and verify
    await expect(finalizeVideo(mockProps)).rejects.toThrow('Database error');
    expect(Video.update).toHaveBeenCalledTimes(1);
  });
});
