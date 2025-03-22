import { graphql } from '../../../graphql';
import { PostQuery } from '../../../graphql/graphql';
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
    }
  }
`);

const useLoadPostDetail = (id: string) => {
  const { data, isLoading, error } = useRequest<PostQuery, { id: string }>({
    queryKey: ['post', id],
    document: postDetailQuery,
    variables: {
      id,
    },
  });

  return {
    post: data?.posts_by_pk ? transformPost(data.posts_by_pk) : null,
    isLoading,
    error,
  };
};

export { useLoadPostDetail };
