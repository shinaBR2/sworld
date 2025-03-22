import { graphql } from '../../../graphql';
import { AllPostsQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from './transformers';

const postsQuery = graphql(/* GraphQL */ `
  query AllPosts @cached {
    posts {
      brief
      id
      markdownContent
      readTimeInMinutes
      title
      slug
    }
  }
`);

const useLoadPosts = () => {
  const { data, isLoading, error } = useRequest<AllPostsQuery>({
    queryKey: ['posts'],
    document: postsQuery,
  });

  return {
    posts: data?.posts ? data.posts.map(p => transformPost(p)) : [],
    isLoading,
    error,
  };
};

export { useLoadPosts };
