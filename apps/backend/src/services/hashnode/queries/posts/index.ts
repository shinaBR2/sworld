import { getHashnodeClient } from '../../client';
import { graphql } from '../../generated-graphql';
import { GetPostQuery } from '../../generated-graphql/graphql';

const GET_POST = graphql(/* GraphQL */ `
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      subtitle
      brief
      url
      slug
      content {
        markdown
      }
      readTimeInMinutes
    }
  }
`);

const getPost = async (id: string) => {
  const variables = {
    id,
  };

  const response = await getHashnodeClient().request<GetPostQuery>(GET_POST.toString(), variables);

  return response.post;
};

export { getPost };
