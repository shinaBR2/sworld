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
      invalidSubtitleFormat: 'Subtitle must be a .vtt file',
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

    const result = validateForm(state);
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

    const result = validateForm(state);
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

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://example.com/video', isValid: false }]);

    const result = validateForm(state);
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

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
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

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
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

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
    expect(result).toBeNull();
  });

  // Add new tests for subtitle validation
  it('should return error when subtitle is not a .vtt file', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.srt',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.srt',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
    expect(result).toBe(texts.errors.invalidSubtitleFormat);
  });

  it('should return null when subtitle has valid .vtt extension', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.vtt',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.vtt',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
    expect(result).toBeNull();
  });

  it('should return null when subtitle has valid .VTT extension (case insensitive)', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.VTT',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: 'https://example.com/subtitle.VTT',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
    expect(result).toBeNull();
  });

  it('should ignore subtitle validation when subtitle is empty', async () => {
    const state: DialogState = {
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: '',
    } as DialogState;

    vi.mocked(formalizeState).mockReturnValueOnce({
      ...state,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=123',
      subtitle: '',
    } as ReturnType<typeof formalizeState>);

    vi.mocked(canPlayUrls).mockReturnValueOnce([{ url: 'https://youtube.com/watch?v=123', isValid: true }]);

    const result = validateForm(state);
    expect(result).toBeNull();
  });
});
