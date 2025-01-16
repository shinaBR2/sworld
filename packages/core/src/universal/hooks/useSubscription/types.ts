export interface SubscriptionState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export type WebSocketMessage =
  | { type: 'connection_init'; payload: { headers: { Authorization: string } } }
  | { type: 'connection_ack' }
  | {
      type: 'start';
      id: string;
      payload: { query: string; variables?: Record<string, unknown> };
    }
  | { type: 'stop'; id: string }
  | { type: 'data'; payload: { data: { [key: string]: unknown } } }
  | { type: 'error'; payload?: { message?: string } }
  | { type: 'complete' };
