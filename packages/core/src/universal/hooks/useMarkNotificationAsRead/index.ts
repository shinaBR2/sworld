import { graphql } from '../../../graphql';
import { useMutationRequest } from '../useMutation';

const MARK_AS_READ_MUTATION = graphql(/* GraphQL */ `
  mutation MarkNotificationAsRead($notificationId: uuid!) {
    update_notifications_by_pk(pk_columns: { id: $notificationId }, _set: { readAt: "now()" }) {
      id
      readAt
    }
  }
`);

const MARK_NOTIFICATIONS_AS_READ_MUTATION = graphql(/* GraphQL */ `
  mutation MarkNotificationsAsRead($ids: [uuid!]!) {
    update_notifications(where: { id: { _in: $ids }, readAt: { _is_null: true } }, _set: { readAt: "now()" }) {
      affected_rows
      returning {
        id
        readAt
      }
    }
  }
`);

interface UseMarkNotificationAsReadProps {
  getAccessToken: () => Promise<string>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

const useMarkNotificationAsRead = (props: UseMarkNotificationAsReadProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  const { mutateAsync: markSingleAsRead } = useMutationRequest({
    document: MARK_AS_READ_MUTATION,
    getAccessToken,
    options: {
      onSuccess,
      onError: (error) => {
        console.error('Mark as read failed:', error);
        onError?.(error);
      },
    },
  });

  const { mutateAsync: markAllAsRead } = useMutationRequest({
    document: MARK_NOTIFICATIONS_AS_READ_MUTATION,
    getAccessToken,
    options: {
      onSuccess,
      onError: (error) => {
        console.error('Mark all as read failed:', error);
        onError?.(error);
      },
    },
  });

  return {
    markAsRead: markSingleAsRead,
    markAllAsRead: markAllAsRead,
  };
};

export { useMarkNotificationAsRead };
