import { graphql } from '../../../graphql';
import type { PostQuery } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from '../transformers';

const postDetailQuery = graphql(/* GraphQL */ `
  query Post($id: uuid!) @cached {
    posts_by_pk(id: $id) {
      title
      readTimeInMinutes
      markdownContent
      id
      brief
      slug
      created_at
      status
    }
  }
`);

const useLoadPostDetail = (id: string) => {
  const { getAccessToken, isSignedIn } = useAuthContext();
  const { data, isLoading, error } = useRequest<PostQuery, { id: string }>({
    queryKey: ['post', id],
    document: postDetailQuery,
    variables: {
      id,
    },
    getAccessToken: isSignedIn ? getAccessToken : undefined,
  });

  return {
    post: data?.posts_by_pk ? transformPost(data.posts_by_pk) : null,
    isLoading,
    error,
  };
};

export { useLoadPostDetail };
