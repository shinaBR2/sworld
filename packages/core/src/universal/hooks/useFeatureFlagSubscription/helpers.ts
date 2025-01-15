import { FeatureFlagItemConditions } from './types';

const checkFeatureFlag = (
  flag: FeatureFlagItemConditions | null,
  userId: string
) => {
  if (!flag) {
    return false;
  }

  const { isGlobal, allowedUserIds } = flag;

  if (isGlobal) {
    return true;
  }

  if (!allowedUserIds) {
    return false;
  }

  if (!userId?.trim()) {
    return false;
  }

  return allowedUserIds.includes(userId);
};

export { checkFeatureFlag };
