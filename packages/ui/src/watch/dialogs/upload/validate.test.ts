import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateForm } from './validate';
import { texts } from './texts';
import { DialogState } from './types';
import { canPlayUrls, CREATE_NEW_PLAYLIST } from './utils';

// Mock dependencies
vi.mock('./utils', () => ({
  canPlayUrls: vi.fn(),
  CREATE_NEW_PLAYLIST: 'create_new',
}));

describe('validateForm', () => {
  // Default valid state for testing
  const validState = {
    title: 'Test Video',
    url: 'https://example.com/video.mp4',
    description: 'Test description',
    playlistId: 'existing-playlist',
    isSubmitting: false,
    error: null,
  } as DialogState;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for canPlayUrls to return valid by default
    vi.mocked(canPlayUrls).mockResolvedValue([{ url: 'https://example.com/video.mp4', isValid: true }]);
  });

  it('should return null for valid input', async () => {
    const result = await validateForm(validState);
    expect(result).toBeNull();
    expect(canPlayUrls).toHaveBeenCalledWith([validState.url]);
  });

  it('should return error for empty title', async () => {
    const invalidState = { ...validState, title: '' };
    const result = await validateForm(invalidState);
    expect(result).toBe(texts.errors.emptyTitle);
    expect(canPlayUrls).not.toHaveBeenCalled();
  });

  it('should return error for empty new playlist name when creating new playlist', async () => {
    const invalidState = {
      ...validState,
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: '',
    };

    const result = await validateForm(invalidState);
    expect(result).toBe(texts.errors.emptyNewPlaylistName);
    expect(canPlayUrls).not.toHaveBeenCalled();
  });

  it('should validate properly with new playlist selected and name provided', async () => {
    const state = {
      ...validState,
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: 'My New Playlist',
    };

    const result = await validateForm(state);
    expect(result).toBeNull();
    expect(canPlayUrls).toHaveBeenCalledWith([state.url]);
  });

  it('should return error for invalid URL', async () => {
    vi.mocked(canPlayUrls).mockResolvedValue([{ url: 'invalid-url', isValid: false }]);

    const result = await validateForm(validState);
    expect(result).toBe(texts.errors.invalidUrl);
    expect(canPlayUrls).toHaveBeenCalledWith([validState.url]);
  });

  it('should handle empty URL case', async () => {
    // Even though the URL is empty, we'll still try to validate it
    const stateWithEmptyUrl = { ...validState, url: '' };
    vi.mocked(canPlayUrls).mockResolvedValue([{ url: '', isValid: false }]);

    const result = await validateForm(stateWithEmptyUrl);
    expect(result).toBe(texts.errors.invalidUrl);
    expect(canPlayUrls).toHaveBeenCalledWith(['']);
  });

  it('should handle errors from canPlayUrls', async () => {
    vi.mocked(canPlayUrls).mockRejectedValue(new Error('Network error'));

    // The function should catch the error and treat it as an invalid URL
    await expect(validateForm(validState)).rejects.toThrow('Network error');
  });

  it('should handle unexpected response from canPlayUrls', async () => {
    // Empty response
    vi.mocked(canPlayUrls).mockResolvedValue([]);

    const result = await validateForm(validState);
    expect(result).toBe(texts.errors.invalidUrl);

    // Multiple responses
    vi.mocked(canPlayUrls).mockResolvedValue([
      { url: 'https://example.com/1.mp4', isValid: true },
      { url: 'https://example.com/2.mp4', isValid: true },
    ]);

    const result2 = await validateForm(validState);
    expect(result2).toBe(texts.errors.invalidUrl);
  });
});
