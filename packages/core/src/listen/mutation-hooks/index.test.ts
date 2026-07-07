import { renderHook } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthContext } from '../../providers/auth';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import {
  useAddAudioToPlaylist,
  useCreatePlaylist,
  useDeleteAudio,
  useRemoveAudioFromPlaylist,
  useReorderPlaylistAudios,
  useUpdateAudio,
} from './index';

vi.mock('../../providers/auth');
vi.mock('../../providers/query');
vi.mock('../../universal/hooks/useMutation');

const mockAccessToken = vi.fn();
const mockInvalidateQuery = vi.fn();
const mockMutateAsync = vi.fn();

const originalConsoleError = console.error;
console.error = vi.fn();

// Grab the onSuccess wired into useMutationRequest for the most recent hook.
const getOnSuccess = () =>
  vi.mocked(useMutationRequest).mock.calls.at(-1)?.[0].options?.onSuccess;

describe('Listen playlist mutation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: mockAccessToken,
      isSignedIn: true,
    });
    vi.mocked(useQueryContext).mockReturnValue({
      invalidateQuery: mockInvalidateQuery,
    });
    vi.mocked(useMutationRequest).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('useCreatePlaylist', () => {
    it('stamps site=listen onto the insert object', () => {
      const { result } = renderHook(() => useCreatePlaylist());

      result.current({
        title: 'Chill',
        slug: 'chill',
        thumbnailUrl: 'thumb.jpg',
        description: 'relax',
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        object: {
          title: 'Chill',
          slug: 'chill',
          thumbnailUrl: 'thumb.jpg',
          description: 'relax',
          site: 'listen',
        },
      });
    });

    it('invalidates the playlists list on success', () => {
      const onSuccess = vi.fn();
      renderHook(() => useCreatePlaylist({ onSuccess }));

      const data = { insert_playlist_one: { id: '1', slug: 'chill' } };
      getOnSuccess()?.(data);

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['listen-playlists']);
      expect(onSuccess).toHaveBeenCalledWith(data);
    });
  });

  describe('useAddAudioToPlaylist', () => {
    it('builds the junction insert payload', () => {
      const { result } = renderHook(() => useAddAudioToPlaylist());

      result.current({ playlistId: 'p1', audioId: 'a1', position: 3 });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        object: { playlist_id: 'p1', audio_id: 'a1', position: 3 },
      });
    });

    it('invalidates the playlist detail on success', () => {
      renderHook(() => useAddAudioToPlaylist());

      getOnSuccess()?.({
        insert_playlist_audios_one: {
          playlist_id: 'p1',
          audio_id: 'a1',
          position: 3,
        },
      });

      expect(mockInvalidateQuery).toHaveBeenCalledWith([
        'listen-playlist-detail',
        'p1',
      ]);
    });
  });

  describe('useRemoveAudioFromPlaylist', () => {
    it('builds the by-pk delete variables', () => {
      const { result } = renderHook(() => useRemoveAudioFromPlaylist());

      result.current({ playlistId: 'p1', audioId: 'a1' });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        playlistId: 'p1',
        audioId: 'a1',
      });
    });

    it('invalidates the playlist detail on success', () => {
      renderHook(() => useRemoveAudioFromPlaylist());

      getOnSuccess()?.({
        delete_playlist_audios_by_pk: { playlist_id: 'p1', audio_id: 'a1' },
      });

      expect(mockInvalidateQuery).toHaveBeenCalledWith([
        'listen-playlist-detail',
        'p1',
      ]);
    });
  });

  describe('useReorderPlaylistAudios', () => {
    it('maps updates into per-row where/_set updates', () => {
      const { result } = renderHook(() => useReorderPlaylistAudios());

      result.current([
        { playlistId: 'p1', audioId: 'a1', position: 0 },
        { playlistId: 'p1', audioId: 'a2', position: 1 },
      ]);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        updates: [
          {
            where: { playlist_id: { _eq: 'p1' }, audio_id: { _eq: 'a1' } },
            _set: { position: 0 },
          },
          {
            where: { playlist_id: { _eq: 'p1' }, audio_id: { _eq: 'a2' } },
            _set: { position: 1 },
          },
        ],
      });
    });

    it('invalidates each affected playlist detail once on success', () => {
      renderHook(() => useReorderPlaylistAudios());

      getOnSuccess()?.({
        update_playlist_audios_many: [
          { returning: [{ playlist_id: 'p1' }, { playlist_id: 'p1' }] },
        ],
      });

      expect(mockInvalidateQuery).toHaveBeenCalledTimes(1);
      expect(mockInvalidateQuery).toHaveBeenCalledWith([
        'listen-playlist-detail',
        'p1',
      ]);
    });
  });

  describe('useUpdateAudio', () => {
    it('sends id plus only the provided fields as _set', () => {
      const { result } = renderHook(() => useUpdateAudio());

      result.current({ id: 'a1', name: 'New name', artistName: 'New artist' });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'a1',
        set: { name: 'New name', artistName: 'New artist' },
      });
    });

    it('invalidates the manage and home lists on success', () => {
      const onSuccess = vi.fn();
      renderHook(() => useUpdateAudio({ onSuccess }));

      const data = { update_audios_by_pk: { id: 'a1' } };
      getOnSuccess()?.(data);

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['listen-manage']);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['listen-home', true]);
      expect(onSuccess).toHaveBeenCalledWith(data);
    });

    it('does not invalidate when no row was updated', () => {
      const onSuccess = vi.fn();
      renderHook(() => useUpdateAudio({ onSuccess }));

      const data = { update_audios_by_pk: null };
      getOnSuccess()?.(data);

      expect(mockInvalidateQuery).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith(data);
    });
  });

  describe('useDeleteAudio', () => {
    it('passes the id as the delete variable', () => {
      const { result } = renderHook(() => useDeleteAudio());

      result.current('a1');

      expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'a1' });
    });

    it('invalidates the manage and home lists on success', () => {
      renderHook(() => useDeleteAudio());

      getOnSuccess()?.({ delete_audios_by_pk: { id: 'a1' } });

      expect(mockInvalidateQuery).toHaveBeenCalledWith(['listen-manage']);
      expect(mockInvalidateQuery).toHaveBeenCalledWith(['listen-home', true]);
    });

    it('does not invalidate when no row was deleted', () => {
      renderHook(() => useDeleteAudio());

      getOnSuccess()?.({ delete_audios_by_pk: null });

      expect(mockInvalidateQuery).not.toHaveBeenCalled();
    });
  });
});
