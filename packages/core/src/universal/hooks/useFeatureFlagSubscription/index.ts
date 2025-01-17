import { useMemo } from 'react';
import { useSubscription } from '../useSubscription';
import type { FeatureFlagsData, FeatureFlagsResponse } from './types';
import { checkFeatureFlag } from './helpers';
import { useAuthContext } from '../../../providers/auth';

const FEATURE_FLAGS_SUBSCRIPTION = `
  subscription FeatureFlags {
    feature_flag {
      id
      name
      conditions
    }
  }
`;

export function useFeatureFlagSubscription(url: string) {
  const { user } = useAuthContext();
  const subscription = useSubscription<FeatureFlagsResponse>(
    url,
    FEATURE_FLAGS_SUBSCRIPTION
  );

  const processedFlags = useMemo(() => {
    if (!subscription.data) {
      return null;
    }

    return subscription.data.feature_flag.reduce<FeatureFlagsData>(
      (acc, flag) => {
        acc[flag.name] = checkFeatureFlag(flag.conditions, user?.id || '');

        return acc;
      },
      {}
    );
  }, [subscription.data, user?.id]);

  return {
    data: processedFlags,
    isLoading: subscription.isLoading,
    error: subscription.error,
  };
}
