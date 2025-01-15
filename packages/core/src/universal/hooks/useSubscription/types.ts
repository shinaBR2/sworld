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
  payload?: any;
  id?: string;
}
