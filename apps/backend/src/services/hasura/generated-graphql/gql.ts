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
  '\n  mutation createDeviceRequest($object: device_requests_insert_input!) {\n    insert_device_requests_one(object: $object) {\n      id\n      deviceCode\n      userCode\n    }\n  }\n': typeof types.CreateDeviceRequestDocument;
  '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n': typeof types.DeletePostDocument;
  '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n': typeof types.InsertPostDocument;
  '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n': typeof types.UpdatePostDocument;
  '\n  mutation sharePlaylist(\n    $objects: [shared_playlist_recipients_insert_input!]!\n    $playlistId: uuid!\n    $sharedRecipients: jsonb!\n  ) {\n    insert_shared_playlist_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_playlist_recipients_playlist_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_playlist_by_pk(pk_columns: { id: $playlistId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n': typeof types.SharePlaylistDocument;
  '\n  mutation shareVideo($objects: [shared_video_recipients_insert_input!]!, $videoId: uuid!, $sharedRecipients: jsonb!) {\n    insert_shared_video_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_video_recipients_video_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n': typeof types.ShareVideoDocument;
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n': typeof types.InsertVideosDocument;
  '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n': typeof types.FinalizeVideoDocument;
  '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n': typeof types.PlaylistDetailDocument;
  '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n': typeof types.UsersDocument;
};
const documents: Documents = {
  '\n  mutation createDeviceRequest($object: device_requests_insert_input!) {\n    insert_device_requests_one(object: $object) {\n      id\n      deviceCode\n      userCode\n    }\n  }\n':
    types.CreateDeviceRequestDocument,
  '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n':
    types.DeletePostDocument,
  '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n':
    types.InsertPostDocument,
  '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n':
    types.UpdatePostDocument,
  '\n  mutation sharePlaylist(\n    $objects: [shared_playlist_recipients_insert_input!]!\n    $playlistId: uuid!\n    $sharedRecipients: jsonb!\n  ) {\n    insert_shared_playlist_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_playlist_recipients_playlist_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_playlist_by_pk(pk_columns: { id: $playlistId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n':
    types.SharePlaylistDocument,
  '\n  mutation shareVideo($objects: [shared_video_recipients_insert_input!]!, $videoId: uuid!, $sharedRecipients: jsonb!) {\n    insert_shared_video_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_video_recipients_video_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n':
    types.ShareVideoDocument,
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n':
    types.InsertVideosDocument,
  '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n':
    types.FinalizeVideoDocument,
  '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n':
    types.PlaylistDetailDocument,
  '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n':
    types.UsersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createDeviceRequest($object: device_requests_insert_input!) {\n    insert_device_requests_one(object: $object) {\n      id\n      deviceCode\n      userCode\n    }\n  }\n'
): typeof import('./graphql').CreateDeviceRequestDocument;
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
  source: '\n  mutation sharePlaylist(\n    $objects: [shared_playlist_recipients_insert_input!]!\n    $playlistId: uuid!\n    $sharedRecipients: jsonb!\n  ) {\n    insert_shared_playlist_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_playlist_recipients_playlist_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_playlist_by_pk(pk_columns: { id: $playlistId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n'
): typeof import('./graphql').SharePlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation shareVideo($objects: [shared_video_recipients_insert_input!]!, $videoId: uuid!, $sharedRecipients: jsonb!) {\n    insert_shared_video_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_video_recipients_video_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n'
): typeof import('./graphql').ShareVideoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n'
): typeof import('./graphql').InsertVideosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n'
): typeof import('./graphql').FinalizeVideoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n'
): typeof import('./graphql').PlaylistDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n'
): typeof import('./graphql').UsersDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
