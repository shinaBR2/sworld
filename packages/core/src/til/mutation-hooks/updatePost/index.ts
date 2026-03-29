import { graphql } from '../../../graphql';
import type {
  UpdatePostMutation,
  UpdatePostMutationVariables,
} from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useQueryContext } from '../../../providers/query';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const updatePostMutation = graphql(/* GraphQL */ `
  mutation UpdatePost($id: uuid!, $object: posts_set_input!) {
    update_posts_by_pk(pk_columns: { id: $id }, _set: $object) {
      id
      title
      slug
      brief
      markdownContent
      readTimeInMinutes
      created_at
      updated_at
      status
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: UpdatePostMutation) => void;
  onError?: (error: unknown) => void;
}

const useUpdatePost = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: updatePost, isPending } = useMutationRequest<
    UpdatePostMutation,
    unknown,
    UpdatePostMutationVariables
  >({
    document: updatePostMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        invalidateQuery(['post', data.update_posts_by_pk?.id]);
        invalidateQuery(['posts']);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Update post failed:', error);
        onError?.(error);
      },
    },
  });

  return { updatePost, isPending };
};

export { useUpdatePost };
