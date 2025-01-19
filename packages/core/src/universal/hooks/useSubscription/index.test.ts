import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSubscription } from './index';
import { AuthContextValue, useAuthContext } from '../../../providers/auth';
import { captureSubscriptionError, SubscriptionErrorType } from './helpers';

// Mock the dependencies
vi.mock('../../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../../error-boundary/errors', () => ({
  createAuthenticationError: vi.fn().mockImplementation(err => err),
  createConnectionError: vi.fn().mockImplementation(err => err),
}));

vi.mock('./helpers', () => ({
  captureSubscriptionError: vi.fn(),
  createExponentialBackoff: vi.fn().mockReturnValue({
    shouldRetry: vi.fn().mockReturnValue(true),
    getNextDelay: vi.fn().mockReturnValue(1000),
    reset: vi.fn(),
  }),
  SubscriptionErrorType: {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    DATA_PARSING_ERROR: 'DATA_PARSING_ERROR',
  },
}));

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = MockWebSocket.OPEN;
  send = vi.fn();
  close = vi.fn();

  constructor(public url: string, public protocol: string) {}
}

let mockWsInstance: MockWebSocket;

const MockWebSocketSpy = vi.fn().mockImplementation((url: string, protocol: string) => {
  mockWsInstance = new MockWebSocket(url, protocol);
  return mockWsInstance;
});

Object.assign(MockWebSocketSpy, {
  CONNECTING: MockWebSocket.CONNECTING,
  OPEN: MockWebSocket.OPEN,
  CLOSING: MockWebSocket.CLOSING,
  CLOSED: MockWebSocket.CLOSED,
});

vi.stubGlobal('WebSocket', MockWebSocketSpy);

describe('useSubscription', () => {
  const mockUrl = 'wss://hasura.example.com/graphql';
  const mockQuery = 'subscription { test }';
  const mockToken = 'mock-token';
  const mockVariables = { id: '123' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: vi.fn().mockResolvedValue(mockToken),
    } as unknown as AuthContextValue);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery));
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should establish connection and handle successful subscription flow', async () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery, mockVariables));

    // Initial connection
    await act(async () => {
      mockWsInstance.onopen?.();
    });

    // First message should be connection_init
    expect(mockWsInstance.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({
        type: 'connection_init',
        payload: {
          headers: { Authorization: `Bearer ${mockToken}` },
        },
      })
    );

    // Connection acknowledged, should start subscription
    await act(async () => {
      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'connection_ack' }),
      });
    });

    // Second message should be start subscription
    expect(mockWsInstance.send).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(
        /{"id":"[^"]+","type":"start","payload":{"query":"subscription { test }","variables":{"id":"123"}}}/
      )
    );

    // Receive data
    const mockData = { test: 'data' };
    await act(async () => {
      mockWsInstance.onmessage?.({
        data: JSON.stringify({
          type: 'data',
          payload: { data: mockData },
        }),
      });
    });

    expect(result.current).toEqual({
      data: mockData,
      isLoading: false,
      error: null,
    });
  });

  it('should handle authentication error', async () => {
    const mockError = new Error('Auth failed');
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: vi.fn().mockRejectedValue(mockError),
    } as unknown as AuthContextValue);

    renderHook(() => useSubscription(mockUrl, mockQuery, mockVariables));

    await act(async () => {
      mockWsInstance.onopen?.();
    });

    expect(captureSubscriptionError).toHaveBeenCalledWith({
      error: mockError,
      type: SubscriptionErrorType.AUTHENTICATION_FAILED,
      additionalContext: {
        query: mockQuery,
        variables: mockVariables,
      },
    });
  });

  it('should handle server error message', async () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery, mockVariables));

    await act(async () => {
      mockWsInstance.onopen?.();
      mockWsInstance.onmessage?.({
        data: JSON.stringify({
          type: 'error',
          payload: { message: 'Server error' },
        }),
      });
    });

    expect(captureSubscriptionError).toHaveBeenCalledWith({
      error: expect.any(Error),
      type: SubscriptionErrorType.DATA_PARSING_ERROR,
      additionalContext: {
        query: mockQuery,
        variables: mockVariables,
      },
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: expect.any(Error),
    });
  });

  it('should handle message parsing error', async () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery, mockVariables));

    await act(async () => {
      mockWsInstance.onmessage?.({
        data: 'invalid json',
      });
    });

    expect(captureSubscriptionError).toHaveBeenCalledWith({
      error: expect.any(Error),
      type: SubscriptionErrorType.DATA_PARSING_ERROR,
      additionalContext: {
        query: mockQuery,
        variables: mockVariables,
      },
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: expect.any(Error),
    });
  });

  it('should handle WebSocket errors with reconnection', async () => {
    vi.useFakeTimers(); // Use fake timers

    renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onerror?.();
    });

    // Advance timers to trigger reconnection
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should attempt reconnection
    expect(MockWebSocketSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers(); // Restore real timers
  });

  it('should handle connection complete message', async () => {
    renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'complete' }),
      });
    });

    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should clean up on unmount', async () => {
    const { unmount } = renderHook(() => useSubscription(mockUrl, mockQuery));

    unmount();

    expect(mockWsInstance.send).toHaveBeenCalledWith(expect.stringContaining('"type":"stop"'));
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should not send stop message if socket is not open on unmount', () => {
    const { unmount } = renderHook(() => useSubscription(mockUrl, mockQuery));

    mockWsInstance.readyState = WebSocket.CLOSED;
    unmount();

    expect(mockWsInstance.send).not.toHaveBeenCalled();
  });
});
