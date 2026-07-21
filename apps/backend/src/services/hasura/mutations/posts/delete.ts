import { graphql } from '../../generated-graphql';
import type { DeletePostMutation } from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const DELETE_POST = graphql(/* GraphQL */ `
  mutation DeletePost($hId: String!) {
    delete_posts(where: { hId: { _eq: $hId } }) {
      returning {
        id
      }
    }
  }
`);

const deletePost = async (hId: string): Promise<any> => {
  const variables = {
    hId,
  };

  const response = await hasuraClient.request<DeletePostMutation, any>({
    document: DELETE_POST.toString(),
    variables,
  });
  return response.delete_posts?.returning[0]?.id;
};

export { deletePost };
