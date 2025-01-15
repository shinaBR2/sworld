export interface SubscriptionState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface WebSocketMessage {
  type:
    | 'connection_init'
    | 'connection_ack'
    | 'start'
    | 'data'
    | 'error'
    | 'stop';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  id?: string;
}
