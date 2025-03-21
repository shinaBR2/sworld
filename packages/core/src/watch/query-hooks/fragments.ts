import { graphql } from '../../graphql';

const UserFragment = graphql(/* GraphQL */ `
  fragment UserFields on users {
    username
  }
`);

const VideoFragment = graphql(/* GraphQL */ `
  fragment VideoFields on videos {
    id
    title
    description
    duration
    thumbnailUrl
    source
    slug
    createdAt
    user {
      ...UserFields
    }
    user_video_histories {
      last_watched_at
      progress_seconds
    }
    subtitles {
      id
      isDefault
      lang
      url
    }
  }
`);

const PlaylistVideoFragment = graphql(/* GraphQL */ `
  fragment PlaylistVideoFields on playlist_videos {
    position
    video {
      ...VideoFields
    }
  }
`);

const PlaylistFragment = graphql(/* GraphQL */ `
  fragment PlaylistFields on playlist {
    id
    title
    thumbnailUrl
    slug
    createdAt
    description
    user {
      ...UserFields
    }
    playlist_videos(where: { video: { status: { _eq: "ready" } } }, order_by: { position: asc }) {
      ...PlaylistVideoFields
    }
  }
`);

export { PlaylistFragment, PlaylistVideoFragment, UserFragment, VideoFragment };
