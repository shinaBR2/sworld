import { graphql } from '../../../graphql';
import { NotificationsSubscription } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';

const NOTIFICATIONS_SUBSCRIPTION = graphql(/* GraphQL */ `
  subscription Notifications {
    notifications(order_by: { createdAt: desc }) {
      id
      entityId
      entityType
      type
      readAt
      link
      metadata
    }
  }
`);

export function useNotificationsSubscription(url: string) {
  const { isSignedIn } = useAuthContext();
  const subscription = useSubscription<NotificationsSubscription>({
    hasuraUrl: url,
    query: NOTIFICATIONS_SUBSCRIPTION.toString(),
    enabled: isSignedIn,
  });

  return {
    data: subscription.isLoading ? null : subscription.data?.notifications || [],
    isLoading: subscription.isLoading,
    error: subscription.error,
  };
}
