import { graphql } from '../../../graphql';
import type { AllPostsQuery } from '../../../graphql/graphql';
import { useAuthContext } from '../../../providers/auth';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from '../transformers';

const postsQuery = graphql(/* GraphQL */ `
  query AllPosts @cached {
    posts(order_by: { slug: desc }) {
      brief
      id
      markdownContent
      readTimeInMinutes
      title
      slug
      created_at
      status
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
