import type { MutationFunctionContext, UseMutationOptions } from '@tanstack/react-query';
import {
  DeletePlaylistDocument,
  type DeletePlaylistMutation,
  type DeletePlaylistMutationVariables,
} from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

type DeletePlaylistMutationOptions = UseMutationOptions<
  DeletePlaylistMutation,
  unknown,
  DeletePlaylistMutationVariables,
  unknown
>;

interface UseDeletePlaylistProps
  extends Pick<DeletePlaylistMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useDeletePlaylist = (props: UseDeletePlaylistProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: DeletePlaylistDocument,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: DeletePlaylistMutationVariables,
        onMutateResult: unknown,
        context: MutationFunctionContext,
      ) => {
        console.error('Delete playlist failed:', error);
        onError?.(error, variables, onMutateResult, context);
      },
    },
  });
};

export { useDeletePlaylist };
