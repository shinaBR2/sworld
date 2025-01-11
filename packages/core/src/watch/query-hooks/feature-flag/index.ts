import { useRequest } from '../../../universal/hooks/use-request';

const featureFlagQuery = `
  query FeatureFlag($site: String!, $name: String!) {
    feature_flag(where: {site: {_eq: $site}, name: {_eq: $name}}) {
      id
      conditions
    }
  }

`;

interface FeatureFlagItemConditions {
  isGlobal: boolean;
  allowedUserIds: string[];
}

interface FeatureFlag {
  id: string;
  conditions: FeatureFlagItemConditions;
}

interface useFeatureFlagProps {
  name: string;
  getAccessToken: () => Promise<string>;
}

interface FeatureFlagResponse {
  feature_flag: FeatureFlag[] | null;
}

const useFeatureFlag = (props: useFeatureFlagProps) => {
  const { name, getAccessToken } = props;

  const { data, isLoading } = useRequest<FeatureFlagResponse>({
    queryKey: ['feature-flag', name],
    getAccessToken,
    document: featureFlagQuery,
    variables: {
      name,
      site: 'watch',
    },
  });

  return {
    flag: data?.feature_flag?.[0] ? data.feature_flag[0] : null,
    isLoading,
  };
};

export { useFeatureFlag };
