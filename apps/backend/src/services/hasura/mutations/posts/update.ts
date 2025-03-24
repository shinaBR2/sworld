import { graphql } from '../../generated-graphql';
import { Posts_Set_Input, UpdatePostMutation } from '../../generated-graphql/graphql';
import { hasuraClient } from '../client';

const UPDATE_POST = graphql(/* GraphQL */ `
  mutation UpdatePost($hId: String!, $set: posts_set_input!) {
    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {
      returning {
        id
      }
    }
  }
`);

const updatePost = async (hId: string, post: Posts_Set_Input): Promise<any> => {
  const variables = {
    hId,
    set: post,
  };

  const response = await hasuraClient.request<UpdatePostMutation, any>({
    document: UPDATE_POST.toString(),
    variables,
  });
  return response.update_posts?.returning[0]?.id;
};

export { updatePost };
