import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContextValue, useAuthContext } from '../../../providers/auth';
import { useTracker } from '../../tracker';
import { SubscriptionErrorType } from './helpers';
import { useSubscription } from './index';

// Mock the dependencies
vi.mock('../../../providers/auth', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../../error-boundary/errors', () => ({
  createConnectionError: vi.fn().mockImplementation(err => err),
}));

vi.mock('../../tracker', () => ({
  useTracker: vi.fn(),
}));

vi.mock('./helpers', () => ({
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
  const mockCaptureError = vi.fn();
  const fingerprint = ['{{ default }}', 'useSubscription'];
  const extras = {
    query: mockQuery,
    variables: mockVariables,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      getAccessToken: vi.fn().mockResolvedValue(mockToken),
    } as unknown as AuthContextValue);
    vi.mocked(useTracker).mockReturnValue({
      captureError: mockCaptureError,
    });
  });

  it('should initialize connection without token when user is not signed in', async () => {
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: vi.fn(),
      isSignedIn: false,
    } as unknown as AuthContextValue);

    renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    // Initial connection
    await act(async () => {
      mockWsInstance.onopen?.();
    });

    // Should send connection_init with empty headers
    expect(mockWsInstance.send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({
        type: 'connection_init',
        payload: {
          headers: {},
        },
      })
    );
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('should establish connection and handle successful subscription flow', async () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

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

  // Update these test cases to use object params
  it('should handle authentication error', async () => {
    const mockError = new Error('Auth failed');
    vi.mocked(useAuthContext).mockReturnValue({
      isSignedIn: true,
      getAccessToken: vi.fn().mockRejectedValue(mockError),
    } as unknown as AuthContextValue);

    renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    await act(async () => {
      mockWsInstance.onopen?.();
    });

    expect(mockCaptureError).toHaveBeenCalledWith(mockError, {
      tags: [
        { key: 'category', value: 'websocket' },
        { key: 'error_type', value: SubscriptionErrorType.CONNECTION_INIT_FAILED },
      ],
      extras,
      fingerprint,
    });
  });

  it('should handle server error message', async () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    await act(async () => {
      mockWsInstance.onopen?.();
      mockWsInstance.onmessage?.({
        data: JSON.stringify({
          type: 'error',
          payload: { message: 'Server error' },
        }),
      });
    });

    expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), {
      tags: [
        { key: 'category', value: 'websocket' },
        { key: 'error_type', value: SubscriptionErrorType.DATA_PARSING_ERROR },
      ],
      extras,
      fingerprint,
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: expect.any(Error),
    });
  });

  it('should handle message parsing error', async () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    await act(async () => {
      mockWsInstance.onmessage?.({
        data: 'invalid json',
      });
    });

    expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), {
      tags: [
        { key: 'category', value: 'websocket' },
        { key: 'error_type', value: SubscriptionErrorType.DATA_PARSING_ERROR },
      ],
      extras,
      fingerprint,
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: expect.any(Error),
    });
  });

  it('should handle WebSocket errors with reconnection', async () => {
    vi.useFakeTimers();

    renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );

    await act(async () => {
      mockWsInstance.onerror?.();
    });

    // Advance timers to trigger reconnection
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should attempt reconnection
    expect(MockWebSocketSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should handle connection complete message', async () => {
    renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );

    await act(async () => {
      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'complete' }),
      });
    });

    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should clean up on unmount', async () => {
    const { unmount } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );

    unmount();

    expect(mockWsInstance.send).toHaveBeenCalledWith(expect.stringContaining('"type":"stop"'));
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should not send stop message if socket is not open on unmount', () => {
    const { unmount } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );

    mockWsInstance.readyState = WebSocket.CLOSED;
    unmount();

    expect(mockWsInstance.send).not.toHaveBeenCalled();
  });

  it('should handle error when closing WebSocket after complete message', async () => {
    renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    // Set up close to throw an error
    mockWsInstance.close.mockImplementationOnce(() => {
      throw new Error('Failed to close connection');
    });

    await act(async () => {
      mockWsInstance.onopen?.();
      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'complete' }),
      });
    });

    expect(mockWsInstance.close).toHaveBeenCalled();
    expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), {
      tags: [
        { key: 'category', value: 'websocket' },
        { key: 'error_type', value: SubscriptionErrorType.CONNECTION_CLOSED },
      ],
      extras,
      fingerprint,
    });
  });

  it('should handle error during cleanup on unmount', async () => {
    const { unmount } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: true,
      })
    );

    // Ensure the WebSocket is in OPEN state and properly initialized
    await act(async () => {
      mockWsInstance.onopen?.();
    });

    // Set up send to throw an error during cleanup
    mockWsInstance.send.mockImplementationOnce(() => {
      throw new Error('Cleanup failed');
    });

    // Trigger the cleanup
    unmount();

    expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), {
      tags: [
        { key: 'category', value: 'websocket' },
        { key: 'error_type', value: SubscriptionErrorType.CLEANUP_ERROR },
      ],
      extras,
      fingerprint,
    });
  });

  it('should convert HTTP/HTTPS URLs to WS/WSS', () => {
    const httpsUrl = 'https://hasura.example.com/graphql';

    renderHook(() =>
      useSubscription({
        hasuraUrl: httpsUrl,
        query: mockQuery,
        enabled: true,
      })
    );

    expect(MockWebSocketSpy).toHaveBeenLastCalledWith('wss://hasura.example.com/graphql', 'graphql-ws');
  });

  // Replace the disabled test cases with enabled ones
  it('should not initialize connection when enabled is false', () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        variables: mockVariables,
        enabled: false,
      })
    );

    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
    expect(MockWebSocketSpy).not.toHaveBeenCalled();
  });

  it('should cleanup and stop connection when enabled changes to false', async () => {
    const { rerender } = renderHook(
      ({ enabled }) =>
        useSubscription({
          hasuraUrl: mockUrl,
          query: mockQuery,
          variables: mockVariables,
          enabled,
        }),
      { initialProps: { enabled: true } }
    );

    await act(async () => {
      mockWsInstance.onopen?.();
    });

    rerender({ enabled: false });

    expect(mockWsInstance.send).toHaveBeenLastCalledWith(expect.stringContaining('"type":"stop"'));
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should initialize with loading state when enabled', () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: true,
      })
    );
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  it('loading state should be true when enabled is false', () => {
    const { result } = renderHook(() =>
      useSubscription({
        hasuraUrl: mockUrl,
        query: mockQuery,
        enabled: false,
      })
    );
    expect(result.current).toEqual({
      data: null,
      isLoading: true,
      error: null,
    });
  });
});
