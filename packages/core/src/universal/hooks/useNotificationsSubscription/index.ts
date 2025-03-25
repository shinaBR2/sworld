import { graphql } from '../../../graphql';
import { NotificationsSubscription } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';

const NOTIFICATIONS_SUBSCRIPTION = graphql(/* GraphQL */ `
  subscription Notifications {
    notifications {
      id
      entityId
      entityType
      type
      readAt
      message
      link
      metadata
      title
    }
  }
`);

export function useNotificationsSubscription(url: string) {
  const { isSignedIn, isLoading } = useAuthContext();
  console.log(`'auth loading`, isLoading);
  console.log(`'auth isSignedIn`, isSignedIn);
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
