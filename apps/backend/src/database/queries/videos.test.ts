import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Video } from '../models/video';
import { finalizeVideo, getVideoById, getVideoMissingDuration, updateVideoDuration } from './videos';
import { Op, Transaction } from 'sequelize';

// Mock the Video model
vi.mock('../models/video', () => ({
  Video: {
    findByPk: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
  },
}));

describe('finalizeVideo', () => {
  const mockProps = {
    id: '123',
    source: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: 100,
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
        duration: mockProps.duration,
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

describe('getVideoMissingDuration', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  it('should query videos with null duration', async () => {
    // Mock the findAll method
    const mockVideos = [
      { id: '1', videoUrl: 'url1', duration: null },
      { id: '2', videoUrl: 'url2', duration: null },
    ];

    vi.spyOn(Video, 'findAll').mockResolvedValue(mockVideos);

    const result = await getVideoMissingDuration();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [{ duration: null }, { duration: 0 }],
      },
    });

    // Verify returned videos
    expect(result).toEqual(mockVideos);
    expect(result.length).toBe(2);
  });

  it('should query videos with zero duration', async () => {
    // Mock the findAll method
    const mockVideos = [
      { id: '3', videoUrl: 'url3', duration: 0 },
      { id: '4', videoUrl: 'url4', duration: 0 },
    ];

    vi.spyOn(Video, 'findAll').mockResolvedValue(mockVideos);

    const result = await getVideoMissingDuration();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [{ duration: null }, { duration: 0 }],
      },
    });

    // Verify returned videos
    expect(result).toEqual(mockVideos);
    expect(result.length).toBe(2);
  });

  it('should return an empty array when no videos without duration exist', async () => {
    // Mock the findAll method to return an empty array
    vi.spyOn(Video, 'findAll').mockResolvedValue([]);

    const result = await getVideoMissingDuration();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.or]: [{ duration: null }, { duration: 0 }],
      },
    });

    // Verify empty result
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should handle database query errors', async () => {
    // Mock the findAll method to throw an error
    const mockError = new Error('Database connection failed');
    vi.spyOn(Video, 'findAll').mockRejectedValue(mockError);

    // Expect the error to be thrown
    await expect(getVideoMissingDuration()).rejects.toThrow('Database connection failed');
  });
});

describe('getVideoById', () => {
  it('should return a video when found', async () => {
    const mockVideo = {
      id: '123',
      title: 'Test Video',
      duration: 100,
    };

    (Video.findByPk as Mock).mockResolvedValue(mockVideo);

    const result = await getVideoById('123');
    expect(result).toEqual(mockVideo);
    expect(Video.findByPk).toHaveBeenCalledWith('123');
  });

  it('should return null when video is not found', async () => {
    (Video.findByPk as Mock).mockResolvedValue(null);

    const result = await getVideoById('nonexistent');
    expect(result).toBeNull();
    expect(Video.findByPk).toHaveBeenCalledWith('nonexistent');
  });
});

describe('updateVideoDuration', () => {
  it('should update video duration successfully', async () => {
    const mockTransaction = {} as Transaction;
    (Video.update as Mock).mockResolvedValue([1]);

    const result = await updateVideoDuration({
      id: '123',
      duration: 120,
    });

    expect(result).toBe(1);
    expect(Video.update).toHaveBeenCalledWith(
      { duration: 120 },
      {
        where: { id: '123' },
        transaction: undefined,
      }
    );
  });

  it('should update video duration with transaction', async () => {
    const mockTransaction = {} as Transaction;
    (Video.update as Mock).mockResolvedValue([1]);

    const result = await updateVideoDuration({
      id: '123',
      duration: 120,
      transaction: mockTransaction,
    });

    expect(result).toBe(1);
    expect(Video.update).toHaveBeenCalledWith(
      { duration: 120 },
      {
        where: { id: '123' },
        transaction: mockTransaction,
      }
    );
  });

  it('should throw error when no video is updated', async () => {
    (Video.update as Mock).mockResolvedValue([0]);

    await expect(
      updateVideoDuration({
        id: 'nonexistent',
        duration: 120,
      })
    ).rejects.toThrow('Video with ID nonexistent not found');
  });
});
