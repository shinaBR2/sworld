import { describe, it, expect } from 'vitest';
import { formalize, buildVariables } from './utils';

describe('formalize', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const validEmail = 'test@example.com';

  it('should format valid inputs correctly', () => {
    const result = formalize(validUUID, [validUUID, validUUID], [validEmail, 'user@domain.com']);

    expect(result).toEqual({
      playlistId: validUUID,
      videoIds: [validUUID, validUUID],
      recipients: [validEmail, 'user@domain.com'],
    });
  });

  it('should throw error for invalid playlist ID', () => {
    expect(() => formalize('invalid-id', [validUUID], [validEmail])).toThrow('Invalid playlist ID');
  });

  it('should throw error for empty video IDs array', () => {
    expect(() => formalize(validUUID, [], [validEmail])).toThrow('Video IDs must be a non-empty array');
  });

  it('should throw error for invalid video ID', () => {
    expect(() => formalize(validUUID, [validUUID, 'invalid-id'], [validEmail])).toThrow(
      'Invalid video ID found in the array'
    );
  });

  it('should throw error for empty recipients array', () => {
    expect(() => formalize(validUUID, [validUUID], [])).toThrow('Recipients must be a non-empty array');
  });

  it('should throw error for invalid email', () => {
    expect(() => formalize(validUUID, [validUUID], [validEmail, 'invalid-email'])).toThrow(
      'Invalid email address found in recipients'
    );
  });
});

describe('buildVariables', () => {
  it('should build variables correctly', () => {
    const playlistId = '123';
    const videoIds = ['video1', 'video2'];
    const recipients = ['test@example.com'];

    const result = buildVariables(playlistId, videoIds, recipients);

    expect(result).toEqual({
      objects: [
        { playlistId: '123', videoId: 'video1', recipients: ['test@example.com'] },
        { playlistId: '123', videoId: 'video2', recipients: ['test@example.com'] },
      ],
    });
  });
});
