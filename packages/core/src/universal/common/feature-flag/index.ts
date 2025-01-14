import { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

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

  if (!userId?.trim()) {
    return false;
  }

  return allowedUserIds.includes(userId);
};

export { checkFeatureFlag };
