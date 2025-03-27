import { Op, Transaction } from 'sequelize';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { Video } from '../models/video';
import {
  getVideoById,
  getVideoMissingDuration,
  getVideoMissingThumbnail,
  updateVideoDuration,
  updateVideoThumbnail,
} from './videos';

// Mock the Video model
vi.mock('../models/video', () => ({
  Video: {
    findByPk: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
  },
}));

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

describe('getVideoMissingThumbnail', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
  });

  it('should query videos with null thumbnail_url', async () => {
    // Mock the findAll method
    const mockVideos = [
      { id: '1', videoUrl: 'url1', thumbnail_url: null },
      { id: '2', videoUrl: 'url2', thumbnail_url: null },
    ];

    vi.spyOn(Video, 'findAll').mockResolvedValue(mockVideos);

    const result = await getVideoMissingThumbnail();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.and]: [{ status: 'ready' }, { [Op.or]: [{ thumbnail_url: null }, { thumbnail_url: '' }] }],
      },
    });

    // Verify returned videos
    expect(result).toEqual(mockVideos);
    expect(result.length).toBe(2);
  });

  it('should query videos with zero thumbnail_url', async () => {
    // Mock the findAll method
    const mockVideos = [
      { id: '3', videoUrl: 'url3', thumbnail_url: '' },
      { id: '4', videoUrl: 'url4', thumbnail_url: '' },
    ];

    vi.spyOn(Video, 'findAll').mockResolvedValue(mockVideos);

    const result = await getVideoMissingThumbnail();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.and]: [{ status: 'ready' }, { [Op.or]: [{ thumbnail_url: null }, { thumbnail_url: '' }] }],
      },
    });

    // Verify returned videos
    expect(result).toEqual(mockVideos);
    expect(result.length).toBe(2);
  });

  it('should return an empty array when no videos without thumbnail_url exist', async () => {
    // Mock the findAll method to return an empty array
    vi.spyOn(Video, 'findAll').mockResolvedValue([]);

    const result = await getVideoMissingThumbnail();

    // Verify findAll was called with correct query
    expect(Video.findAll).toHaveBeenCalledWith({
      where: {
        [Op.and]: [{ status: 'ready' }, { [Op.or]: [{ thumbnail_url: null }, { thumbnail_url: '' }] }],
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
    await expect(getVideoMissingThumbnail()).rejects.toThrow('Database connection failed');
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

describe('updateVideoThumbnail', () => {
  it('should update video thumbnailUrl successfully', async () => {
    const mockTransaction = {} as Transaction;
    (Video.update as Mock).mockResolvedValue([1]);

    const result = await updateVideoThumbnail({
      id: '123',
      thumbnailUrl: 'thumbnail-url',
    });

    expect(result).toBe(1);
    expect(Video.update).toHaveBeenCalledWith(
      { thumbnail_url: 'thumbnail-url' },
      {
        where: { id: '123' },
        transaction: undefined,
      }
    );
  });

  it('should update video thumbnailUrl with transaction', async () => {
    const mockTransaction = {} as Transaction;
    (Video.update as Mock).mockResolvedValue([1]);

    const result = await updateVideoThumbnail({
      id: '123',
      thumbnailUrl: 'thumbnail-url',
      transaction: mockTransaction,
    });

    expect(result).toBe(1);
    expect(Video.update).toHaveBeenCalledWith(
      { thumbnail_url: 'thumbnail-url' },
      {
        where: { id: '123' },
        transaction: mockTransaction,
      }
    );
  });

  it('should throw error when no video is updated', async () => {
    (Video.update as Mock).mockResolvedValue([0]);

    await expect(
      updateVideoThumbnail({
        id: 'nonexistent',
        thumbnailUrl: 'thumbnail-url',
      })
    ).rejects.toThrow('Video with ID nonexistent not found');
  });
});
