import { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

const checkFeatureFlag = (
  flag: FeatureFlagItemConditions | null,
  userId: string
) => {
  if (!flag) {
    return true;
  }

  const { isGlobal, allowedUserIds } = flag;

  if (isGlobal || !flag) {
    return true;
  }

  return allowedUserIds.indexOf(userId) > -1;
};

export { checkFeatureFlag };
