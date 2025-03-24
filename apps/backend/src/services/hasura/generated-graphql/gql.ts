/* eslint-disable */
import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n': typeof types.DeletePostDocument;
  '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n': typeof types.InsertPostDocument;
  '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n': typeof types.UpdatePostDocument;
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n': typeof types.InsertVideosDocument;
};
const documents: Documents = {
  '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n':
    types.DeletePostDocument,
  '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n':
    types.InsertPostDocument,
  '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n':
    types.UpdatePostDocument,
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n':
    types.InsertVideosDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n'
): typeof import('./graphql').DeletePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n'
): typeof import('./graphql').InsertPostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n'
): typeof import('./graphql').UpdatePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n'
): typeof import('./graphql').InsertVideosDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
