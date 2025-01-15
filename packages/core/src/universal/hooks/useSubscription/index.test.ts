// packages/core/src/universal/hooks/useSubscription/index.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSubscription } from './index';
import { AuthContextValue, useAuthContext } from '../../../providers/auth0';

// Mock auth context
vi.mock('../../../providers/auth0', () => ({
  useAuthContext: vi.fn(),
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

  constructor(url: string, protocol: string) {
    // Constructor implementation
  }
}

// Keep track of the latest instance
let mockWsInstance: MockWebSocket;

// Create a constructor spy that saves the instance
const MockWebSocketSpy = vi
  .fn()
  .mockImplementation((url: string, protocol: string) => {
    mockWsInstance = new MockWebSocket(url, protocol);
    return mockWsInstance;
  });

// Add the static properties to the spy
MockWebSocketSpy.CONNECTING = MockWebSocket.CONNECTING;
MockWebSocketSpy.OPEN = MockWebSocket.OPEN;
MockWebSocketSpy.CLOSING = MockWebSocket.CLOSING;
MockWebSocketSpy.CLOSED = MockWebSocket.CLOSED;

vi.stubGlobal('WebSocket', MockWebSocketSpy);

describe('useSubscription', () => {
  const mockUrl = 'wss://hasura.example.com/graphql';
  const mockQuery = 'subscription { test }';
  const mockToken = 'mock-token';

  beforeEach(() => {
    vi.clearAllMocks();
    mockWsInstance?.close.mockClear();
    mockWsInstance?.send.mockClear();

    // Mock getAccessToken
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

  it('should establish connection and start subscription', async () => {
    renderHook(() => useSubscription(mockUrl, mockQuery));

    // Wait for initial WebSocket setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check connection init message
    expect(mockWsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('connection_init')
    );

    // Simulate connection acknowledgment
    await act(async () => {
      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'connection_ack' }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check subscription start message
    expect(mockWsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('start')
    );
  });

  it('should handle successful data message', async () => {
    const mockData = { test: 'data' };
    const { result } = renderHook(() =>
      useSubscription<{ test: string }>(mockUrl, mockQuery)
    );

    await act(async () => {
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'connection_ack' }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.onmessage?.({
        data: JSON.stringify({
          type: 'data',
          payload: { data: mockData },
        }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      data: mockData,
      isLoading: false,
      error: null,
    });
  });

  it('should handle subscription with variables', async () => {
    const variables = { id: '123' };
    renderHook(() => useSubscription(mockUrl, mockQuery, variables));

    await act(async () => {
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'connection_ack' }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(variables))
    );
  });

  it('should handle auth token error', async () => {
    const mockError = new Error('Auth error');
    vi.mocked(useAuthContext).mockReturnValue({
      getAccessToken: vi.fn().mockRejectedValue(mockError),
    } as unknown as AuthContextValue);

    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: mockError,
    });
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should handle WebSocket error', async () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onerror?.();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: new Error('WebSocket connection failed'),
    });
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should handle subscription error message', async () => {
    const { result } = renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.onmessage?.({
        data: JSON.stringify({
          type: 'error',
          payload: { message: 'Subscription failed' },
        }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toEqual({
      data: null,
      isLoading: false,
      error: new Error('Subscription failed'),
    });
  });

  it('should cleanup on unmount', async () => {
    const { unmount } = renderHook(() => useSubscription(mockUrl, mockQuery));

    await act(async () => {
      mockWsInstance.onopen?.();
      await new Promise(resolve => setTimeout(resolve, 0));

      mockWsInstance.onmessage?.({
        data: JSON.stringify({ type: 'connection_ack' }),
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    unmount();

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      expect.stringContaining('stop')
    );
    expect(mockWsInstance.close).toHaveBeenCalled();
  });

  it('should not cleanup if WebSocket is not open', () => {
    const { unmount } = renderHook(() => useSubscription(mockUrl, mockQuery));

    mockWsInstance.readyState = WebSocket.CLOSED;
    unmount();

    expect(mockWsInstance.send).not.toHaveBeenCalled();
    expect(mockWsInstance.close).not.toHaveBeenCalled();
  });
});
