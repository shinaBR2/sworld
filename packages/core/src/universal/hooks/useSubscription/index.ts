import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../providers/auth0';
import type { SubscriptionState, WebSocketMessage } from './types';

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

  useEffect(() => {
    const ws = new WebSocket(hasuraUrl, 'graphql-ws');
    const subscriptionId = Math.random().toString(36).substr(2, 9);

    const initializeConnection = async () => {
      try {
        const token = await getAccessToken();
        const initMessage: WebSocketMessage = {
          type: 'connection_init',
          payload: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        };
        ws.send(JSON.stringify(initMessage));
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error : new Error('Failed to get token'),
        });
        ws.close();
      }
    };

    const startSubscription = () => {
      const startMessage: WebSocketMessage = {
        id: subscriptionId,
        type: 'start',
        payload: {
          query,
          variables,
        },
      };
      ws.send(JSON.stringify(startMessage));
    };

    ws.onopen = () => {
      initializeConnection();
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data) as WebSocketMessage;

      switch (message.type) {
        case 'connection_ack':
          startSubscription();
          break;

        case 'data':
          setState({
            data: message.payload.data,
            isLoading: false,
            error: null,
          });
          break;

        case 'error':
          setState({
            data: null,
            isLoading: false,
            error: new Error(message.payload?.message || 'Subscription error'),
          });
          break;
      }
    };

    ws.onerror = () => {
      setState({
        data: null,
        isLoading: false,
        error: new Error('WebSocket connection failed'),
      });
      ws.close();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        const stopMessage: WebSocketMessage = {
          id: subscriptionId,
          type: 'stop',
        };
        ws.send(JSON.stringify(stopMessage));
        ws.close();
      }
    };
  }, [hasuraUrl, query, variables, getAccessToken]);

  return state;
}
