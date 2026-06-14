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
  '\n  mutation CreateTask($object: tasks_insert_input!) {\n    insert_tasks_one(\n      object: $object\n      on_conflict: { constraint: tasks_task_id_key, update_columns: [task_id] }\n    ) {\n      id\n      task_id\n      status\n      completed\n    }\n  }\n': typeof types.CreateTaskDocument;
  '\n  mutation UpdateTaskStatus($taskId: uuid!, $status: String!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: $status }\n    ) {\n      affected_rows\n    }\n  }\n': typeof types.UpdateTaskStatusDocument;
  '\n  mutation CompleteTask($taskId: uuid!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n': typeof types.CompleteTaskDocument;
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n': typeof types.InsertVideosDocument;
  '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n': typeof types.FinalizeVideoDocument;
  '\n  mutation FixVideoDuration($id: uuid!, $duration: Int!, $taskId: uuid!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { duration: $duration }) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n': typeof types.FixVideoDurationDocument;
  '\n  mutation FixVideoThumbnail($id: uuid!, $thumbnailUrl: String!, $taskId: uuid!) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n': typeof types.FixVideoThumbnailDocument;
  '\n  query VideoMetadata($videoId: uuid!) {\n    videos_by_pk(id: $videoId) {\n      metadata\n    }\n  }\n': typeof types.VideoMetadataDocument;
  '\n  mutation MarkVideoFailed($videoId: uuid!, $metadata: jsonb!) {\n    update_videos_by_pk(\n      pk_columns: { id: $videoId }\n      _set: { status: "failed", metadata: $metadata }\n    ) {\n      id\n    }\n  }\n': typeof types.MarkVideoFailedDocument;
  '\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n': typeof types.SaveSubtitleDocument;
  '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n': typeof types.PlaylistDetailDocument;
  '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n': typeof types.UsersDocument;
  '\n  query GetVideoById($id: uuid!) {\n    videos_by_pk(id: $id) {\n      id\n      source\n      status\n      user_id\n      duration\n      thumbnailUrl\n      metadata\n    }\n  }\n': typeof types.GetVideoByIdDocument;
  '\n  query GetVideosMissingDuration {\n    videos(\n      where: { _or: [{ duration: { _is_null: true } }, { duration: { _eq: 0 } }] }\n    ) {\n      id\n    }\n  }\n': typeof types.GetVideosMissingDurationDocument;
  '\n  query GetVideosMissingThumbnail {\n    videos(\n      where: {\n        status: { _eq: "ready" }\n        _or: [\n          { thumbnailUrl: { _is_null: true } }\n          { thumbnailUrl: { _eq: "" } }\n        ]\n      }\n    ) {\n      id\n    }\n  }\n': typeof types.GetVideosMissingThumbnailDocument;
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
  '\n  mutation CreateTask($object: tasks_insert_input!) {\n    insert_tasks_one(\n      object: $object\n      on_conflict: { constraint: tasks_task_id_key, update_columns: [task_id] }\n    ) {\n      id\n      task_id\n      status\n      completed\n    }\n  }\n':
    types.CreateTaskDocument,
  '\n  mutation UpdateTaskStatus($taskId: uuid!, $status: String!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: $status }\n    ) {\n      affected_rows\n    }\n  }\n':
    types.UpdateTaskStatusDocument,
  '\n  mutation CompleteTask($taskId: uuid!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n':
    types.CompleteTaskDocument,
  '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n':
    types.InsertVideosDocument,
  '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n':
    types.FinalizeVideoDocument,
  '\n  mutation FixVideoDuration($id: uuid!, $duration: Int!, $taskId: uuid!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { duration: $duration }) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n':
    types.FixVideoDurationDocument,
  '\n  mutation FixVideoThumbnail($id: uuid!, $thumbnailUrl: String!, $taskId: uuid!) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n':
    types.FixVideoThumbnailDocument,
  '\n  query VideoMetadata($videoId: uuid!) {\n    videos_by_pk(id: $videoId) {\n      metadata\n    }\n  }\n':
    types.VideoMetadataDocument,
  '\n  mutation MarkVideoFailed($videoId: uuid!, $metadata: jsonb!) {\n    update_videos_by_pk(\n      pk_columns: { id: $videoId }\n      _set: { status: "failed", metadata: $metadata }\n    ) {\n      id\n    }\n  }\n':
    types.MarkVideoFailedDocument,
  '\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n':
    types.SaveSubtitleDocument,
  '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n':
    types.PlaylistDetailDocument,
  '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n':
    types.UsersDocument,
  '\n  query GetVideoById($id: uuid!) {\n    videos_by_pk(id: $id) {\n      id\n      source\n      status\n      user_id\n      duration\n      thumbnailUrl\n      metadata\n    }\n  }\n':
    types.GetVideoByIdDocument,
  '\n  query GetVideosMissingDuration {\n    videos(\n      where: { _or: [{ duration: { _is_null: true } }, { duration: { _eq: 0 } }] }\n    ) {\n      id\n    }\n  }\n':
    types.GetVideosMissingDurationDocument,
  '\n  query GetVideosMissingThumbnail {\n    videos(\n      where: {\n        status: { _eq: "ready" }\n        _or: [\n          { thumbnailUrl: { _is_null: true } }\n          { thumbnailUrl: { _eq: "" } }\n        ]\n      }\n    ) {\n      id\n    }\n  }\n':
    types.GetVideosMissingThumbnailDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation createDeviceRequest($object: device_requests_insert_input!) {\n    insert_device_requests_one(object: $object) {\n      id\n      deviceCode\n      userCode\n    }\n  }\n',
): typeof import('./graphql').CreateDeviceRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation DeletePost($hId: String!) {\n    delete_posts(where: { hId: { _eq: $hId } }) {\n      returning {\n        id\n      }\n    }\n  }\n',
): typeof import('./graphql').DeletePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InsertPost($object: posts_insert_input!) {\n    insert_posts_one(object: $object) {\n      id\n    }\n  }\n',
): typeof import('./graphql').InsertPostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdatePost($hId: String!, $set: posts_set_input!) {\n    update_posts(where: { hId: { _eq: $hId } }, _set: $set) {\n      returning {\n        id\n      }\n    }\n  }\n',
): typeof import('./graphql').UpdatePostDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation sharePlaylist(\n    $objects: [shared_playlist_recipients_insert_input!]!\n    $playlistId: uuid!\n    $sharedRecipients: jsonb!\n  ) {\n    insert_shared_playlist_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_playlist_recipients_playlist_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_playlist_by_pk(pk_columns: { id: $playlistId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n',
): typeof import('./graphql').SharePlaylistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation shareVideo($objects: [shared_video_recipients_insert_input!]!, $videoId: uuid!, $sharedRecipients: jsonb!) {\n    insert_shared_video_recipients(\n      objects: $objects\n      on_conflict: { constraint: shared_video_recipients_video_id_recipient_id_key, update_columns: [] }\n    ) {\n      returning {\n        id\n      }\n    }\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: { sharedRecipients: $sharedRecipients }) {\n      id\n      sharedRecipients\n    }\n  }\n',
): typeof import('./graphql').ShareVideoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CreateTask($object: tasks_insert_input!) {\n    insert_tasks_one(\n      object: $object\n      on_conflict: { constraint: tasks_task_id_key, update_columns: [task_id] }\n    ) {\n      id\n      task_id\n      status\n      completed\n    }\n  }\n',
): typeof import('./graphql').CreateTaskDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateTaskStatus($taskId: uuid!, $status: String!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: $status }\n    ) {\n      affected_rows\n    }\n  }\n',
): typeof import('./graphql').UpdateTaskStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CompleteTask($taskId: uuid!) {\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n',
): typeof import('./graphql').CompleteTaskDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n',
): typeof import('./graphql').InsertVideosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation FinalizeVideo(\n    $taskId: uuid!\n    $notificationObject: notifications_insert_input!\n    $videoId: uuid!\n    $videoUpdates: videos_set_input!\n  ) {\n    # Update task status to completed\n    update_tasks(where: { task_id: { _eq: $taskId } }, _set: { status: "completed" }) {\n      affected_rows\n      returning {\n        id\n      }\n    }\n\n    # Add notification\n    insert_notifications_one(object: $notificationObject) {\n      id\n    }\n\n    # Finalize video using the input type\n    update_videos_by_pk(pk_columns: { id: $videoId }, _set: $videoUpdates) {\n      id\n    }\n  }\n',
): typeof import('./graphql').FinalizeVideoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation FixVideoDuration($id: uuid!, $duration: Int!, $taskId: uuid!) {\n    update_videos_by_pk(pk_columns: { id: $id }, _set: { duration: $duration }) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n',
): typeof import('./graphql').FixVideoDurationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation FixVideoThumbnail($id: uuid!, $thumbnailUrl: String!, $taskId: uuid!) {\n    update_videos_by_pk(\n      pk_columns: { id: $id }\n      _set: { thumbnailUrl: $thumbnailUrl }\n    ) {\n      id\n    }\n    update_tasks(\n      where: { task_id: { _eq: $taskId } }\n      _set: { status: "completed", completed: true }\n    ) {\n      affected_rows\n    }\n  }\n',
): typeof import('./graphql').FixVideoThumbnailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query VideoMetadata($videoId: uuid!) {\n    videos_by_pk(id: $videoId) {\n      metadata\n    }\n  }\n',
): typeof import('./graphql').VideoMetadataDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MarkVideoFailed($videoId: uuid!, $metadata: jsonb!) {\n    update_videos_by_pk(\n      pk_columns: { id: $videoId }\n      _set: { status: "failed", metadata: $metadata }\n    ) {\n      id\n    }\n  }\n',
): typeof import('./graphql').MarkVideoFailedDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation SaveSubtitle($id: uuid!, $object: subtitles_set_input!) {\n    update_subtitles_by_pk(pk_columns: { id: $id }, _set: $object) {\n      id\n    }\n  }\n',
): typeof import('./graphql').SaveSubtitleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PlaylistDetail($id: uuid!, $emails: [String!]!) {\n    playlist_by_pk(id: $id) {\n      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {\n        video {\n          id\n          status\n        }\n      }\n    }\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n',
): typeof import('./graphql').PlaylistDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Users($emails: [String!]!) {\n    users(where: { email: { _in: $emails } }) {\n      id\n      email\n      username\n    }\n  }\n',
): typeof import('./graphql').UsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetVideoById($id: uuid!) {\n    videos_by_pk(id: $id) {\n      id\n      source\n      status\n      user_id\n      duration\n      thumbnailUrl\n      metadata\n    }\n  }\n',
): typeof import('./graphql').GetVideoByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetVideosMissingDuration {\n    videos(\n      where: { _or: [{ duration: { _is_null: true } }, { duration: { _eq: 0 } }] }\n    ) {\n      id\n    }\n  }\n',
): typeof import('./graphql').GetVideosMissingDurationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query GetVideosMissingThumbnail {\n    videos(\n      where: {\n        status: { _eq: "ready" }\n        _or: [\n          { thumbnailUrl: { _is_null: true } }\n          { thumbnailUrl: { _eq: "" } }\n        ]\n      }\n    ) {\n      id\n    }\n  }\n',
): typeof import('./graphql').GetVideosMissingThumbnailDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
