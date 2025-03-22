import { graphql } from '../../../graphql';
import { PostQuery } from '../../../graphql/graphql';
import { useRequest } from '../../../universal/hooks/use-request';
import { transformPost } from '../transformers';

const postDetailQuery = graphql(/* GraphQL */ `
  query Post($id: uuid!) @cached {
    posts {
      title
      readTimeInMinutes
      markdownContent
      id
      brief
      slug
    }
  }
`);

const useLoadPostDetail = (id: string) => {
  const { data, isLoading, error } = useRequest<PostQuery, { id: string }>({
    queryKey: ['posts'],
    document: postDetailQuery,
    variables: {
      id,
    },
  });

  return {
    posts: data?.posts ? data.posts.map(p => transformPost(p)) : [],
    isLoading,
    error,
  };
};

export { useLoadPostDetail };
