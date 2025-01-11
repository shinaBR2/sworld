import { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

const checkFeatureFlag = (flag: FeatureFlagItemConditions, userId: string) => {
  const { isGlobal, allowedUserIds } = flag;

  if (isGlobal) {
    return true;
  }

  return allowedUserIds.indexOf(userId) > -1;
};

export { checkFeatureFlag };
