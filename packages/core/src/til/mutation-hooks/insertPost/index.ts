import { graphql } from '../../../graphql';
import type {
  InsertPostMutation,
  InsertPostMutationVariables,
} from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useQueryContext } from '../../../providers/query';
import { useMutationRequest } from '../../../universal/hooks/useMutation';

const insertPostMutation = graphql(/* GraphQL */ `
  mutation InsertPost($object: posts_insert_input!) {
    insert_posts_one(object: $object) {
      id
      title
      slug
      brief
      markdownContent
      readTimeInMinutes
      created_at
      updated_at
    }
  }
`);

interface MutationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

const useInsertPost = (props: MutationProps) => {
  const { getAccessToken } = useAuthContext();
  const { invalidateQuery } = useQueryContext();
  const { onSuccess, onError } = props;

  const { mutateAsync: insertPost } = useMutationRequest<
    InsertPostMutation,
    unknown,
    InsertPostMutationVariables
  >({
    document: insertPostMutation,
    getAccessToken,
    options: {
      onSuccess: (data) => {
        // Invalidate posts query to refresh the list
        invalidateQuery(['posts']);
        onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Insert post failed:', error);
        onError?.(error);
      },
    },
  });

  return insertPost;
};

export { useInsertPost };
