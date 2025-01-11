import { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';
import { useAuthContext } from '../../../providers/auth0';
import { checkFeatureFlag } from '../../../universal/common/feature-flag';
import { useRequest } from '../../../universal/hooks/use-request';

const featureFlagQuery = `
  query FeatureFlag($site: String!, $name: String!) {
    feature_flag(where: {site: {_eq: $site}, name: {_eq: $name}}) {
      id
      conditions
    }
  }

`;

interface FeatureFlag {
  id: string;
  conditions: FeatureFlagItemConditions | null;
}

interface useFeatureFlagProps {
  name: string;
  getAccessToken?: () => Promise<string>;
}

interface FeatureFlagResponse {
  feature_flag: FeatureFlag[] | null;
}

const useFeatureFlag = (props: useFeatureFlagProps) => {
  const { name, getAccessToken } = props;

  const { user, isLoading: userLoading } = useAuthContext();
  const { data, isLoading } = useRequest<FeatureFlagResponse>({
    queryKey: ['feature-flag', name],
    getAccessToken,
    document: featureFlagQuery,
    variables: {
      name,
      site: 'watch',
    },
  });

  if (isLoading || userLoading || !data?.feature_flag?.length || !user?.id) {
    return {
      enabled: false,
      isLoading,
    };
  }

  return {
    enabled: checkFeatureFlag(data.feature_flag[0].conditions, user.id),
    isLoading,
  };
};

export { useFeatureFlag };
