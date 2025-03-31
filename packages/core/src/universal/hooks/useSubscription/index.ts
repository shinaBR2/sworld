import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../../../providers/auth';
import { createConnectionError } from '../../error-boundary/errors';
import { useTracker } from '../../tracker';
import { createExponentialBackoff, SubscriptionErrorType } from './helpers';
import type { SubscriptionState, WebSocketMessage } from './types';

interface ConnectionInfo {
  ws: WebSocket;
  subscriptionId: string;
}

export interface SubscriptionParams {
  hasuraUrl: string;
  query: string;
  variables?: Record<string, unknown>;
  enabled: boolean;
}

export function useSubscription<T>(params: SubscriptionParams): SubscriptionState<T> {
  const { hasuraUrl, query, variables, enabled } = params;
  const [state, setState] = useState<SubscriptionState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const { isSignedIn, getAccessToken } = useAuthContext();
  const backoff = useMemo(() => createExponentialBackoff(), []);
  const { captureError } = useTracker();

  const memoizedVariables = useMemo(
    () => variables,
    // Only recreate when the stringified version changes
    [JSON.stringify(variables)]
  );

  const errorContext = useMemo(
    () => ({
      query,
      variables: memoizedVariables,
    }),
    [query, memoizedVariables]
  );
  const fingerprint = ['{{ default }}', 'useSubscription'];

  const initializeConnection = useCallback(
    async (ws: WebSocket) => {
      try {
        const token = isSignedIn ? await getAccessToken() : undefined;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        ws.send(
          JSON.stringify({
            type: 'connection_init',
            payload: {
              headers,
            },
          })
        );

        backoff.reset(); // Reset on successful connection
      } catch (err) {
        const error = createConnectionError(err instanceof Error ? err : new Error('Failed to init connection'));

        captureError(error, {
          tags: [
            { key: 'category', value: 'websocket' },
            { key: 'error_type', value: SubscriptionErrorType.CONNECTION_INIT_FAILED },
          ],
          extras: {
            ...errorContext,
          },
          fingerprint,
        });

        handleConnectionError(createWebSocketConnection);
      }
    },
    [query, memoizedVariables, backoff, isSignedIn, getAccessToken]
  );

  const startSubscription = useCallback(
    (connection: ConnectionInfo) => {
      const { ws, subscriptionId } = connection;
      const startMessage: WebSocketMessage = {
        id: subscriptionId,
        type: 'start',
        payload: {
          query,
          variables: memoizedVariables,
        },
      };
      ws.send(JSON.stringify(startMessage));
    },
    [query, memoizedVariables]
  );

  const handleConnectionError = useCallback(
    (createWebSocketConnection: () => ConnectionInfo) => {
      if (backoff.shouldRetry()) {
        const delay = backoff.getNextDelay();
        setTimeout(createWebSocketConnection, delay);
      } else {
        setState({
          data: null,
          isLoading: false,
          error: createConnectionError(new Error('Max reconnection attempts exceeded')),
        });
      }
    },
    [backoff]
  );

  const handleSubscriptionMessage = useCallback(
    (connection: ConnectionInfo) => (event: MessageEvent) => {
      try {
        const { ws } = connection;
        const message = JSON.parse(event.data) as WebSocketMessage;

        switch (message.type) {
          case 'connection_ack': {
            startSubscription(connection);
            break;
          }

          case 'data': {
            setState({
              data: message.payload.data as T,
              isLoading: false,
              error: null,
            });
            break;
          }

          case 'error': {
            const errorMessage = message.payload?.message || 'Subscription error';
            const error = createConnectionError(new Error(errorMessage));

            captureError(error, {
              tags: [
                { key: 'category', value: 'websocket' },
                { key: 'error_type', value: SubscriptionErrorType.DATA_PARSING_ERROR },
              ],
              extras: {
                ...errorContext,
              },
              fingerprint,
            });

            setState({
              data: null,
              isLoading: false,
              error,
            });
            break;
          }

          case 'complete': {
            // Subscription has ended; handle cleanup if necessary
            try {
              ws.close();
            } catch (err) {
              const error = createConnectionError(err instanceof Error ? err : new Error('Failed to close connection'));
              captureError(error, {
                tags: [
                  { key: 'category', value: 'websocket' },
                  { key: 'error_type', value: SubscriptionErrorType.CONNECTION_CLOSED },
                ],
                extras: {
                  ...errorContext,
                },
                fingerprint,
              });
            }
            break;
          }

          default: {
            break;
          }
        }
      } catch (err) {
        const error = createConnectionError(err instanceof Error ? err : new Error('Parse websocket message error'));
        captureError(error, {
          tags: [
            { key: 'category', value: 'websocket' },
            { key: 'error_type', value: SubscriptionErrorType.DATA_PARSING_ERROR },
          ],
          extras: {
            ...errorContext,
          },
          fingerprint,
        });

        setState({
          data: null,
          isLoading: false,
          error,
        });
      }
    },
    [startSubscription]
  );

  const createWebSocketConnection = useCallback(() => {
    const wsUrl = hasuraUrl.replace('https://', 'wss://');
    const ws = new WebSocket(wsUrl, 'graphql-ws');
    const subscriptionId = Math.random().toString(36).substring(2, 11);
    const connection = { ws, subscriptionId };

    ws.onopen = async () => await initializeConnection(ws);
    ws.onerror = () => handleConnectionError(createWebSocketConnection);
    ws.onmessage = handleSubscriptionMessage(connection);

    return connection;
  }, [hasuraUrl, initializeConnection, handleConnectionError, handleSubscriptionMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const { ws, subscriptionId } = createWebSocketConnection();

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const stopMessage: WebSocketMessage = {
            id: subscriptionId,
            type: 'stop',
          };
          ws.send(JSON.stringify(stopMessage));
          ws.close();
        } catch (err) {
          const error = createConnectionError(err instanceof Error ? err : new Error('Cleanup failed'));
          captureError(error, {
            tags: [
              { key: 'category', value: 'websocket' },
              { key: 'error_type', value: SubscriptionErrorType.CLEANUP_ERROR },
            ],
            extras: {
              ...errorContext,
            },
            fingerprint,
          });
        }
      }
    };
  }, [createWebSocketConnection, enabled]);

  // Return initial state when not enabled
  if (!enabled) {
    return {
      data: null,
      isLoading: true,
      error: null,
    };
  }

  return state;
}
