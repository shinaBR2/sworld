import { graphql } from '../../graphql';
import type {
  GetUserSettingsQuery,
  GetUserSettingsQueryVariables,
} from '../../graphql/graphql';
import { useRequest } from '../../universal/hooks/use-request';
import { parseUserSettings } from '../parse';
import type { UserSettings } from '../types';

// Owner-scoped by Hasura permission: returns at most the caller's own row
// (empty for a user who has never saved a setting). This is an app/session-level
// read, not page content — it isn't tied to any route.
const userSettingsQuery = graphql(/* GraphQL */ `
  query GetUserSettings {
    user_settings {
      data
    }
  }
`);

interface LoadUserSettingsProps {
  getAccessToken: () => Promise<string>;
}

const useLoadUserSettings = (props: LoadUserSettingsProps) => {
  const { getAccessToken } = props;

  const { data, isLoading, error } = useRequest<
    GetUserSettingsQuery,
    GetUserSettingsQueryVariables
  >({
    queryKey: ['user-settings'],
    getAccessToken,
    document: userSettingsQuery,
  });

  const settings: UserSettings | null =
    !isLoading && data ? parseUserSettings(data.user_settings[0]?.data) : null;

  return { settings, isLoading, error };
};

export { useLoadUserSettings };
