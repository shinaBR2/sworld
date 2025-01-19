import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthContext } from '../../../providers/auth';
import type { SubscriptionState, WebSocketMessage } from './types';
import { createAuthenticationError, createConnectionError } from '../../error-boundary/errors';
// import { AppError } from '../../error-boundary/app-error';
import { captureSubscriptionError, createExponentialBackoff, SubscriptionErrorType } from './helpers';

interface ConnectionInfo {
  ws: WebSocket;
  subscriptionId: string;
}

export function useSubscription<T>(
  hasuraUrl: string,
  query: string,
  variables?: Record<string, unknown>
): SubscriptionState<T> {
  const [state, setState] = useState<SubscriptionState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const { getAccessToken } = useAuthContext();
  const backoff = useMemo(() => createExponentialBackoff(), []);

  const initializeConnection = useCallback(
    async (ws: WebSocket) => {
      try {
        const token = await getAccessToken();
        ws.send(
          JSON.stringify({
            type: 'connection_init',
            payload: {
              headers: { Authorization: `Bearer ${token}` },
            },
          })
        );

        backoff.reset(); // Reset on successful connection
      } catch (err) {
        const error = createAuthenticationError(err instanceof Error ? err : new Error('Authentication failed'));

        captureSubscriptionError({
          error,
          type: SubscriptionErrorType.AUTHENTICATION_FAILED,
          additionalContext: { query, variables },
        });

        handleConnectionError(createWebSocketConnection);
      }
    },
    [query, variables, backoff]
  );

  const startSubscription = useCallback(
    (connection: ConnectionInfo) => {
      const { ws, subscriptionId } = connection;
      const startMessage: WebSocketMessage = {
        id: subscriptionId,
        type: 'start',
        payload: {
          query,
          variables,
        },
      };
      ws.send(JSON.stringify(startMessage));
    },
    [query, variables]
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

  const handleSubscriptionMessage = (connection: ConnectionInfo) => (event: MessageEvent) => {
    try {
      const { ws } = connection;
      const message = JSON.parse(event.data) as WebSocketMessage;

      switch (message.type) {
        case 'connection_ack':
          startSubscription(connection);
          break;

        case 'data':
          setState({
            data: message.payload.data as T,
            isLoading: false,
            error: null,
          });
          break;

        case 'error':
          const errorMessage = message.payload?.message || 'Subscription error';
          const error = createConnectionError(new Error(errorMessage));
          captureSubscriptionError({
            error,
            type: SubscriptionErrorType.DATA_PARSING_ERROR,
            additionalContext: {
              query,
              variables,
            },
          });

          setState({
            data: null,
            isLoading: false,
            error,
          });
          break;

        case 'complete':
          // Subscription has ended; handle cleanup if necessary
          ws.close();
          break;

        default:
          // Handle unexpected message types if needed
          break;
      }
    } catch (err) {
      const error = createConnectionError(err instanceof Error ? err : new Error('Parse websocket message error'));
      captureSubscriptionError({
        error,
        type: SubscriptionErrorType.DATA_PARSING_ERROR,
        additionalContext: {
          query,
          variables,
        },
      });

      setState({
        data: null,
        isLoading: false,
        error,
      });
    }
  };

  const createWebSocketConnection = useCallback(() => {
    console.log('Creating WebSocket Connection', { hasuraUrl, query, variables });
    const ws = new WebSocket(hasuraUrl, 'graphql-ws');
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    const connection = { ws, subscriptionId };

    ws.onopen = async () => await initializeConnection(ws);
    ws.onerror = () => handleConnectionError(createWebSocketConnection);
    ws.onmessage = handleSubscriptionMessage(connection);

    return connection;
  }, [hasuraUrl]);

  useEffect(() => {
    console.log('Effect triggered', { query, variables });
    const { ws, subscriptionId } = createWebSocketConnection();

    return () => {
      console.log('Cleaning up WebSocket');
      if (ws.readyState === WebSocket.OPEN) {
        const stopMessage: WebSocketMessage = {
          id: subscriptionId,
          type: 'stop',
        };
        ws.send(JSON.stringify(stopMessage));
        ws.close();
      }
    };
  }, [createWebSocketConnection]);

  // useEffect(() => {
  //   const ws = new WebSocket(hasuraUrl, 'graphql-ws');
  //   const subscriptionId = Math.random().toString(36).substr(2, 9);
  //   let timeoutId: NodeJS.Timeout;

  //   const handleTimeout = () => {
  //     if (ws.readyState !== WebSocket.OPEN && ws.readyState !== WebSocket.CONNECTING) {
  //       const error = createConnectionError(new Error('WebSocket connection timeout'));

  //       captureSubscriptionError({
  //         error,
  //         type: SubscriptionErrorType.NETWORK_ERROR,
  //         additionalContext: {
  //           query,
  //           variables,
  //         },
  //       });

  //       setState(prevState => ({
  //         ...prevState,
  //         data: null,
  //         isLoading: false,
  //         error,
  //       }));

  //       ws.close();
  //     }
  //   };

  //   timeoutId = setTimeout(handleTimeout, 10000);

  //   const initializeConnection = async () => {
  //     try {
  //       let token;
  //       try {
  //         token = await getAccessToken();
  //       } catch (err) {
  //         // Since getAccessToken has its own retry mechanisms
  //         // If it fails, it's likely a "terminal" auth error
  //         const error = createAuthenticationError(err instanceof Error ? err : new Error('Authentication failed'));
  //         captureSubscriptionError({
  //           error,
  //           type: SubscriptionErrorType.AUTHENTICATION_FAILED,
  //           additionalContext: {
  //             query,
  //             variables,
  //           },
  //         });

  //         throw error;
  //       }

  //       const initMessage: WebSocketMessage = {
  //         type: 'connection_init',
  //         payload: {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       };

  //       try {
  //         ws.send(JSON.stringify(initMessage));
  //       } catch (err) {
  //         const error = createConnectionError(
  //           err instanceof Error ? err : new Error('Failed to initialize WebSocket connection')
  //         );

  //         captureSubscriptionError({
  //           error,
  //           type: SubscriptionErrorType.CONNECTION_INIT_FAILED,
  //           additionalContext: {
  //             query,
  //             variables,
  //           },
  //         });

  //         throw error;
  //       }
  //     } catch (error: unknown) {
  //       setState({
  //         data: null,
  //         isLoading: false,
  //         error: error as AppError,
  //       });
  //       ws.close();
  //     }
  //   };

  //   const startSubscription = () => {
  //     const startMessage: WebSocketMessage = {
  //       id: subscriptionId,
  //       type: 'start',
  //       payload: {
  //         query,
  //         variables,
  //       },
  //     };
  //     ws.send(JSON.stringify(startMessage));
  //   };

  //   ws.onopen = async () => {
  //     await initializeConnection();
  //     clearTimeout(timeoutId);
  //   };

  //   ws.onmessage = event => {
  //     try {
  //       const message = JSON.parse(event.data) as WebSocketMessage;

  //       switch (message.type) {
  //         case 'connection_ack':
  //           startSubscription();
  //           break;

  //         case 'data':
  //           setState({
  //             data: message.payload.data as T,
  //             isLoading: false,
  //             error: null,
  //           });
  //           break;

  //         case 'error':
  //           const errorMessage = message.payload?.message || 'Subscription error';
  //           const error = createConnectionError(new Error(errorMessage));
  //           captureSubscriptionError({
  //             error,
  //             type: SubscriptionErrorType.DATA_PARSING_ERROR,
  //             additionalContext: {
  //               query,
  //               variables,
  //             },
  //           });

  //           setState({
  //             data: null,
  //             isLoading: false,
  //             error,
  //           });
  //           break;

  //         case 'complete':
  //           // Subscription has ended; handle cleanup if necessary
  //           ws.close();
  //           break;

  //         default:
  //           // Handle unexpected message types if needed
  //           break;
  //       }
  //     } catch (err) {
  //       const error = createConnectionError(err instanceof Error ? err : new Error('Parse websocket message error'));
  //       captureSubscriptionError({
  //         error,
  //         type: SubscriptionErrorType.DATA_PARSING_ERROR,
  //         additionalContext: {
  //           query,
  //           variables,
  //         },
  //       });

  //       setState({
  //         data: null,
  //         isLoading: false,
  //         error,
  //       });
  //     }
  //   };

  //   ws.onerror = () => {
  //     // Handle reconnect
  //     const error = createConnectionError(new Error('WebSocket connection failed'));
  //     captureSubscriptionError({
  //       error,
  //       type: SubscriptionErrorType.NETWORK_ERROR,
  //       additionalContext: {
  //         query,
  //         variables,
  //       },
  //     });
  //     setState({
  //       data: null,
  //       isLoading: false,
  //       error,
  //     });
  //     ws.close();
  //     clearTimeout(timeoutId);
  //   };

  //   return () => {
  //     if (ws.readyState === WebSocket.OPEN) {
  //       const stopMessage: WebSocketMessage = {
  //         id: subscriptionId,
  //         type: 'stop',
  //       };
  //       ws.send(JSON.stringify(stopMessage));
  //       ws.close();
  //     }
  //     clearTimeout(timeoutId);
  //   };
  // }, [hasuraUrl, query, variables, getAccessToken]);
  // TODO memorize the variables

  return state;
}
