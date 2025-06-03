import { graphql } from '../../generated-graphql';
import { InsertPostMutation, Posts_Insert_Input } from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const INSERT_POST = graphql(/* GraphQL */ `
  mutation InsertPost($object: posts_insert_input!) {
    insert_posts_one(object: $object) {
      id
    }
  }
`);

const insertPost = async (post: Posts_Insert_Input): Promise<any> => {
  const variables = {
    object: post,
  };

  const response = await hasuraClient.request<InsertPostMutation, any>({
    document: INSERT_POST.toString(),
    variables,
  });
  return response.insert_posts_one?.id;
};

export { insertPost };
