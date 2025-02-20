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
const documents = {
    "\n  query GetAudiosAndFeelings @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      public\n      artistName\n      createdAt\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n  }\n": types.GetAudiosAndFeelingsDocument,
    "\n  query GetPublicAudiosAndFeelings @cached {\n    audios(where: { public: { _eq: true } }) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" }, audio_tags: { audio: { public: { _eq: true } } } }) {\n      id\n      name\n    }\n  }\n": types.GetPublicAudiosAndFeelingsDocument,
    "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n": types.InsertVideosDocument,
    "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n": types.UpdateVideoProgressDocument,
    "\n  query VideoDetail($id: uuid!) @cached {\n    videos(order_by: { createdAt: desc }) {\n      id\n      title\n      description\n      thumbnailUrl\n      source\n      slug\n      duration\n      createdAt\n      user {\n        username\n      }\n      user_video_histories {\n        last_watched_at\n        progress_seconds\n      }\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n": types.VideoDetailDocument,
    "\n  query AllVideos @cached {\n    videos(order_by: { createdAt: desc }) {\n      user_video_histories {\n        last_watched_at\n        progress_seconds\n      }\n      id\n      title\n      description\n      duration\n      thumbnailUrl\n      source\n      slug\n      createdAt\n      user {\n        username\n      }\n    }\n  }\n": types.AllVideosDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetAudiosAndFeelings @cached {\n    audios {\n      id\n      name\n      source\n      thumbnailUrl\n      public\n      artistName\n      createdAt\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" } }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').GetAudiosAndFeelingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPublicAudiosAndFeelings @cached {\n    audios(where: { public: { _eq: true } }) {\n      id\n      name\n      source\n      thumbnailUrl\n      artistName\n      audio_tags {\n        tag_id\n      }\n    }\n    tags(where: { site: { _eq: \"listen\" }, audio_tags: { audio: { public: { _eq: true } } } }) {\n      id\n      name\n    }\n  }\n"): typeof import('./graphql').GetPublicAudiosAndFeelingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation InsertVideos($objects: [videos_insert_input!]!) {\n    insert_videos(objects: $objects) {\n      returning {\n        id\n        title\n        description\n      }\n    }\n  }\n"): typeof import('./graphql').InsertVideosDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateVideoProgress($videoId: uuid!, $progressSeconds: Int!, $lastWatchedAt: timestamptz!) {\n    insert_user_video_history_one(\n      object: { video_id: $videoId, progress_seconds: $progressSeconds, last_watched_at: $lastWatchedAt }\n      on_conflict: {\n        constraint: user_video_history_user_id_video_id_key\n        update_columns: [progress_seconds, last_watched_at]\n      }\n    ) {\n      id\n      progress_seconds\n      last_watched_at\n    }\n  }\n"): typeof import('./graphql').UpdateVideoProgressDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query VideoDetail($id: uuid!) @cached {\n    videos(order_by: { createdAt: desc }) {\n      id\n      title\n      description\n      thumbnailUrl\n      source\n      slug\n      duration\n      createdAt\n      user {\n        username\n      }\n      user_video_histories {\n        last_watched_at\n        progress_seconds\n      }\n    }\n    videos_by_pk(id: $id) {\n      id\n      source\n      thumbnailUrl\n      title\n      description\n    }\n  }\n"): typeof import('./graphql').VideoDetailDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AllVideos @cached {\n    videos(order_by: { createdAt: desc }) {\n      user_video_histories {\n        last_watched_at\n        progress_seconds\n      }\n      id\n      title\n      description\n      duration\n      thumbnailUrl\n      source\n      slug\n      createdAt\n      user {\n        username\n      }\n    }\n  }\n"): typeof import('./graphql').AllVideosDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
