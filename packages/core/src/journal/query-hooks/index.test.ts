import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRequest } from '../../universal/hooks/use-request';
import { useLoadJournalById, useLoadJournalsByMonth } from './index';

// Mock the useRequest hook
vi.mock('../../universal/hooks/use-request', () => ({
  useRequest: vi.fn(),
}));

const mockAccessToken = vi.fn().mockImplementation(() => Promise.resolve('test-token'));

describe('Journal Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLoadJournalsByMonth', () => {
    const mockData = {
      journals: [
        {
          id: '1',
          date: '2023-01-15',
          content: 'Test content',
          mood: 'happy',
          tags: ['test'],
        },
      ],
      happy_aggregate: { aggregate: { count: 5 } },
      neutral_aggregate: { aggregate: { count: 3 } },
      sad_aggregate: { aggregate: { count: 2 } },
      oldest_aggregate: [{ date: '2023-01-01' }],
    };

    it('should fetch and transform data correctly', async () => {
      vi.mocked(useRequest).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() =>
        useLoadJournalsByMonth({
          getAccessToken: mockAccessToken,
          month: 1,
          year: 2023,
        })
      );

      // In the 'should fetch and transform data correctly' test case
      expect(useRequest).toHaveBeenCalledWith({
        queryKey: ['journals', 1, 2023],
        getAccessToken: mockAccessToken,
        document: expect.anything(),
        variables: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      });

      expect(result.current).toEqual({
        data: {
          journals: mockData.journals,
          stats: {
            categories: [
              { mood: 'happy', count: 5 },
              { mood: 'neutral', count: 3 },
              { mood: 'sad', count: 2 },
              { mood: 'total', count: 10 },
            ],
            oldest: { month: 1, year: 2023 },
          },
        },
        isLoading: false,
        error: null,
      });
    });

    it('should handle loading state', () => {
      vi.mocked(useRequest).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() =>
        useLoadJournalsByMonth({
          getAccessToken: mockAccessToken,
          month: 1,
          year: 2023,
        })
      );

      expect(result.current).toEqual({
        data: null,
        isLoading: true,
        error: null,
      });
    });

    it('should handle error state', () => {
      const mockError = new Error('API error');
      vi.mocked(useRequest).mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
      });

      const { result } = renderHook(() =>
        useLoadJournalsByMonth({
          getAccessToken: mockAccessToken,
          month: 1,
          year: 2023,
        })
      );

      expect(result.current).toEqual({
        data: null,
        isLoading: false,
        error: mockError,
      });
    });
  });

  describe('useLoadJournalById', () => {
    const mockData = {
      journals_by_pk: {
        id: '1',
        date: '2023-01-15',
        content: 'Test content',
        mood: 'happy',
      },
    };

    it('should fetch journal by ID', () => {
      vi.mocked(useRequest).mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() =>
        useLoadJournalById({
          getAccessToken: mockAccessToken,
          id: '1',
        })
      );

      expect(useRequest).toHaveBeenCalledWith({
        queryKey: ['journal', '1'],
        getAccessToken: mockAccessToken,
        document: expect.anything(),
        variables: { id: '1' },
      });

      expect(result.current).toEqual({
        data: mockData.journals_by_pk,
        isLoading: false,
        error: null,
      });
    });
  });
});
