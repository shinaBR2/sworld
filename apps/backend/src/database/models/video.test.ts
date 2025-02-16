import { describe, it, expect } from 'vitest';
import { Video } from './video';
import { DataTypes } from 'sequelize';

describe('Video Model', () => {
  const attributes = Video.rawAttributes;

  it('should have all required fields', () => {
    expect(attributes).toHaveProperty('id');
    expect(attributes).toHaveProperty('videoUrl');
    expect(attributes).toHaveProperty('source');
    expect(attributes).toHaveProperty('thumbnail_url');
    expect(attributes).toHaveProperty('status');
    expect(attributes).toHaveProperty('duration');
    expect(attributes).toHaveProperty('user_id');
  });

  describe('Field Configurations', () => {
    it('should configure id correctly', () => {
      const field = attributes.id;
      expect(field.type).toBe(DataTypes.UUID);
      expect(field.primaryKey).toBe(true);
    });

    it('should configure videoUrl correctly', () => {
      const field = attributes.videoUrl;
      expect(field.type).toBe(DataTypes.STRING);
    });

    it('should configure source correctly', () => {
      const field = attributes.source;
      expect(field.type).toBe(DataTypes.STRING);
    });

    it('should configure thumbnail_url correctly', () => {
      const field = attributes.thumbnail_url;
      expect(field.type).toBe(DataTypes.STRING);
      expect(field.allowNull).toBe(true);
    });

    it('should configure status correctly', () => {
      const field = attributes.status;
      expect(field.type).toBe(DataTypes.STRING);
    });

    it('should configure duration correctly', () => {
      const field = attributes.duration;
      expect(field.type).toBe(DataTypes.INTEGER);
      expect(field.allowNull).toBe(true);
      expect(field.defaultValue).toBe(null);
    });

    it('should configure user_id correctly', () => {
      const field = attributes.user_id;
      expect(field.type).toBe(DataTypes.STRING);
    });
  });

  describe('Model Configuration', () => {
    it('should use underscored naming', () => {
      expect(Video.options.underscored).toBe(true);
    });

    it('should enable timestamps', () => {
      expect(Video.options.timestamps).toBe(true);
      expect(Video.options.createdAt).toBe('created_at');
      expect(Video.options.updatedAt).toBe('updated_at');
    });
  });

  it('should create a valid video instance', () => {
    const videoData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      videoUrl: 'https://example.com/video.mp4',
      source: 'youtube',
      thumbnail_url: 'https://example.com/thumbnail.jpg',
      status: 'ready',
      duration: 100,
      user_id: '223e4567-13dd-12d3-a456-426614174000',
    };

    const video = Video.build(videoData);

    // Test each property individually
    expect(video).toHaveProperty('id', videoData.id);
    expect(video).toHaveProperty('videoUrl', videoData.videoUrl);
    expect(video).toHaveProperty('source', videoData.source);
    expect(video).toHaveProperty('thumbnail_url', videoData.thumbnail_url);
    expect(video).toHaveProperty('status', videoData.status);
    expect(video).toHaveProperty('duration', videoData.duration);
    expect(video).toHaveProperty('user_id', videoData.user_id);
  });
});
