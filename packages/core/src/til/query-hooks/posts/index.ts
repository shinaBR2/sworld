import { graphql } from '../../../graphql';
import type { AllPostsQuery } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from '../transformers';

const postsQuery = graphql(/* GraphQL */ `
  query AllPosts {
    posts(order_by: { created_at: desc }) {
      brief
      id
      markdownContent
      readTimeInMinutes
      title
      slug
      created_at
      status
      visibility
    }
  }
`);

const useLoadPosts = () => {
  const { getAccessToken, isSignedIn } = useAuthContext();
  const { data, isLoading, error } = useRequest<AllPostsQuery>({
    queryKey: ['posts'],
    document: postsQuery,
    getAccessToken: isSignedIn ? getAccessToken : undefined,
  });

  return {
    posts: data?.posts ? data.posts.map((p) => transformPost(p)) : [],
    isLoading,
    error,
  };
};

export { useLoadPosts };
