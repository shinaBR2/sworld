import type { UseMutationOptions } from '@tanstack/react-query';
import { graphql } from '../../../graphql';
import type {
  SaveSubtitleMutation,
  SaveSubtitleMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const saveSubtitleMutation = graphql(/* GraphQL */ `
  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {
    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
    }
  }
`);

type SaveSubtitleMutationOptions = UseMutationOptions<
  SaveSubtitleMutation,
  unknown,
  SaveSubtitleMutationVariables,
  unknown
>;

interface UseSaveSubtitleProps
  extends Pick<SaveSubtitleMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

// Example usage
// const { mutate: saveSubtitle } = useSaveSubtitle({
//   getAccessToken: async () => 'your-token-here',
//   onSuccess: (data, variables) => {
//     console.log('Subtitle saved:', data.update_subtitles_by_pk);
//     console.log('Variables used:', variables);
//   },
//   onError: (error) => {
//     console.error('Failed to save subtitle:', error);
//   }
// });

const useSaveSubtitle = (props: UseSaveSubtitleProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: saveSubtitleMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: SaveSubtitleMutationVariables,
        context: unknown,
      ) => {
        console.error('Save subtitle failed:', error);
        onError?.(error, variables, context);
      },
    },
  });
};

export { useSaveSubtitle };
