import type {
  MutationFunctionContext,
  UseMutationOptions,
} from '@tanstack/react-query';
import { TypedDocumentString } from '../../../graphql/graphql';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

interface DeleteVideoVariables {
  id: string;
}

interface DeleteVideoData {
  delete_videos_by_pk?: { __typename?: 'videos'; id: unknown } | null;
}

const deleteVideoMutation = new TypedDocumentString(`
  mutation DeleteVideo($id: uuid!) {
    delete_videos_by_pk(id: $id) {
      id
    }
  }
`) as unknown as TypedDocumentString<DeleteVideoData, DeleteVideoVariables>;

type DeleteVideoMutationOptions = UseMutationOptions<
  DeleteVideoData,
  unknown,
  DeleteVideoVariables,
  unknown
>;

interface UseDeleteVideoProps
  extends Pick<DeleteVideoMutationOptions, 'onSuccess' | 'onError'> {
  getAccessToken: () => Promise<string>;
}

const useDeleteVideo = (props: UseDeleteVideoProps) => {
  const { getAccessToken, onSuccess, onError } = props;

  return useMutationRequest({
    document: deleteVideoMutation,
    getAccessToken,
    options: {
      onSuccess,
      onError: (
        error: unknown,
        variables: DeleteVideoVariables,
        onMutateResult: unknown,
        context: MutationFunctionContext,
      ) => {
        console.error('Delete video failed:', error);
        onError?.(error, variables, onMutateResult, context);
      },
    },
  });
};

export { useDeleteVideo };
export type { DeleteVideoVariables };
