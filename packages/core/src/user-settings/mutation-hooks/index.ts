import { graphql } from '../../graphql';
import type {
  UpsertUserSettingsMutation,
  UpsertUserSettingsMutationVariables,
} from '../../graphql/graphql';
import { useQueryContext } from '../../providers/query';
import { useMutationRequest } from '../../universal/hooks/useMutation';
import { mergeUserSettings, type UserSettingsPatch } from '../merge';
import type { UserSettings } from '../types';

// Upsert the caller's settings row. `user_id` is preset server-side from the
// JWT, so the client only sends the blob; the first write creates the row,
// later writes update it.
const upsertUserSettingsMutation = graphql(/* GraphQL */ `
  mutation UpsertUserSettings($data: jsonb!) {
    insert_user_settings_one(
      object: { data: $data }
      on_conflict: { constraint: user_settings_pkey, update_columns: [data] }
    ) {
      user_id
      data
    }
  }
`);

interface SaveUserSettingsProps {
  getAccessToken: () => Promise<string>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const useSaveUserSettings = (props: SaveUserSettingsProps) => {
  const { getAccessToken, onSuccess, onError } = props;
  const { invalidateQuery } = useQueryContext();

  const { mutateAsync } = useMutationRequest<
    UpsertUserSettingsMutation,
    unknown,
    UpsertUserSettingsMutationVariables
  >({
    document: upsertUserSettingsMutation,
    getAccessToken,
    options: {
      onSuccess: () => {
        invalidateQuery(['user-settings']);
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Save user settings failed:', error);
        onError?.(error);
      },
    },
  });

  // Read-merge-write: patch the changed slice over current settings and send the
  // merged blob, so unrelated sites/keys are never clobbered. Returns the
  // promise so callers can await success before caching / reloading.
  const saveUserSettings = (current: UserSettings, patch: UserSettingsPatch) =>
    mutateAsync({ data: mergeUserSettings(current, patch) });

  return { saveUserSettings };
};

export { useSaveUserSettings };
