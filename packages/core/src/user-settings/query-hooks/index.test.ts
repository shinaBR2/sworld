import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { DEFAULT_USER_SETTINGS } from '../types';
import { useLoadUserSettings } from './index';

vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

const mockAccessToken = vi
  .fn()
  .mockImplementation(() => Promise.resolve('test-token'));

describe('useLoadUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses the stored blob from the caller row', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { user_settings: [{ data: { watch: { standaloneMode: true } } }] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadUserSettings({ getAccessToken: mockAccessToken }),
    );

    expect(useRequest).toHaveBeenCalledWith({
      queryKey: ['user-settings'],
      getAccessToken: mockAccessToken,
      document: expect.anything(),
    });
    expect(result.current.settings).toEqual({
      watch: { standaloneMode: true },
    });
  });

  it('falls back to defaults when the caller has no settings row', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: { user_settings: [] },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadUserSettings({ getAccessToken: mockAccessToken }),
    );

    expect(result.current.settings).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('returns null settings while loading', () => {
    vi.mocked(useRequest).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useRequest>);

    const { result } = renderHook(() =>
      useLoadUserSettings({ getAccessToken: mockAccessToken }),
    );

    expect(result.current.settings).toBeNull();
  });
});
