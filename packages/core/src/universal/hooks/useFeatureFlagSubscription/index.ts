import { useMemo } from 'react';
import { graphql } from '../../../graphql';
import { FeatureFlagsSubscription } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useSubscription } from '../useSubscription';
import { checkFeatureFlag } from './helpers';
import type { FeatureFlagsData } from './types';

export const FEATURE_FLAGS_SUBSCRIPTION = graphql(/* GraphQL */ `
  subscription FeatureFlags {
    feature_flag {
      id
      name
      conditions
    }
  }
`);

export function useFeatureFlagSubscription(url: string) {
  const { user } = useAuthContext();
  const subscription = useSubscription<FeatureFlagsSubscription>({
    hasuraUrl: url,
    query: FEATURE_FLAGS_SUBSCRIPTION.toString(),
  });

  const processedFlags = useMemo(() => {
    if (!subscription.data) {
      return null;
    }

    return subscription.data.feature_flag.reduce<FeatureFlagsData>((acc, flag) => {
      acc[flag.name] = checkFeatureFlag(flag.conditions, user?.id || '');

      return acc;
    }, {});
  }, [subscription.data, user?.id]);

  return {
    data: processedFlags,
    isLoading: subscription.isLoading,
    error: subscription.error,
  };
}
