import { beforeEach, describe, expect, it, vi } from 'vitest';
import { texts } from './texts';
import { DialogState } from './types';
import { canPlayUrls, CREATE_NEW_PLAYLIST, formalizeState } from './utils';
import { validateForm } from './validate';

// Mock dependencies
vi.mock('./utils', () => ({
  canPlayUrls: vi.fn(),
  CREATE_NEW_PLAYLIST: '__create-new',
  formalizeState: vi.fn(state => ({
    ...state,
    title: state.title?.trim(),
    url: state.url?.trim(),
    newPlaylistName: state.newPlaylistName?.trim(),
  })),
}));

vi.mock('./texts', () => ({
  texts: {
    errors: {
      emptyTitle: 'Title is required',
      emptyNewPlaylistName: 'Playlist name is required',
      invalidUrl: 'Invalid URL',
    },
  },
}));

describe('validateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when title is empty', async () => {
    const state = {
      title: '   ',
      url: 'https://example.com/video',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValue({
      ...state,
      title: '',
      url: 'https://example.com/video',
    } as ReturnType<typeof formalizeState>);

    const result = await validateForm(state);
    expect(result).toBe(texts.errors.emptyTitle);
    expect(formalizeState).toHaveBeenCalledWith(state);
  });

  it('should return error when creating new playlist but name is empty', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://example.com/video',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: '   ',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://example.com/video',
      newPlaylistName: '',
    } as ReturnType<typeof formalizeState>);

    const result = await validateForm(state);
    expect(result).toBe(texts.errors.emptyNewPlaylistName);
    expect(formalizeState).toHaveBeenCalledWith(state);
  });

  it('should return error when URL is invalid', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://example.com/video',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://example.com/video',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockResolvedValueOnce([{ url: 'https://example.com/video', isValid: false }]);

    const result = await validateForm(state);
    expect(result).toBe(texts.errors.invalidUrl);
    expect(canPlayUrls).toHaveBeenCalledWith(['https://example.com/video']);
  });

  it('should return null when all validations pass', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockResolvedValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = await validateForm(state);
    expect(result).toBeNull();
  });

  it('should return null when using existing playlist with valid data', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      playlistId: 'existing-playlist-id',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockResolvedValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = await validateForm(state);
    expect(result).toBeNull();
  });

  it('should return null when creating new playlist with valid data', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: 'My New Playlist',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      newPlaylistName: 'My New Playlist',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockResolvedValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = await validateForm(state);
    expect(result).toBeNull();
  });
});
