import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import { DEFAULT_USER_SETTINGS } from '../types';
import { useSaveUserSettings } from './index';

vi.mock('../../universal/hooks/useMutation', () => ({
  useMutationRequest: vi.fn(),
}));
vi.mock('../../providers/query', () => ({ useQueryContext: vi.fn() }));

const mutateAsync = vi.fn().mockResolvedValue({});
const invalidateQuery = vi.fn();
const getAccessToken = vi.fn();

describe('useSaveUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMutationRequest).mockReturnValue({
      mutateAsync,
    } as unknown as ReturnType<typeof useMutationRequest>);
    vi.mocked(useQueryContext).mockReturnValue({
      invalidateQuery,
    } as unknown as ReturnType<typeof useQueryContext>);
  });

  it('sends the merged blob (patch layered over current)', async () => {
    const { result } = renderHook(() =>
      useSaveUserSettings({ getAccessToken }),
    );

    await result.current.saveUserSettings(DEFAULT_USER_SETTINGS, {
      watch: { standaloneMode: true },
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      data: { watch: { standaloneMode: true } },
    });
  });

  it('invalidates the user-settings query on success', () => {
    renderHook(() => useSaveUserSettings({ getAccessToken }));

    const options = vi.mocked(useMutationRequest).mock.calls[0][0].options;
    options?.onSuccess?.({} as never, {} as never, undefined as never);

    expect(invalidateQuery).toHaveBeenCalledWith(['user-settings']);
  });
});
