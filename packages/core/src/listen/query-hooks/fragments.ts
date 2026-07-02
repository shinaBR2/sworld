import { graphql } from '../../graphql';

const AudioFragment = graphql(/* GraphQL */ `
  fragment AudioFields on audios {
    id
    name
    source
    thumbnailUrl
    artistName
    createdAt
  }
`);

const PlaylistAudioFragment = graphql(/* GraphQL */ `
  fragment PlaylistAudioFields on playlist_audios {
    position
    audio {
      ...AudioFields
    }
  }
`);

const PlaylistFragment = graphql(/* GraphQL */ `
  fragment ListenPlaylistFields on playlist {
    id
    title
    thumbnailUrl
    slug
    createdAt
    description
    playlist_audios(order_by: { position: asc }) {
      ...PlaylistAudioFields
    }
  }
`);

export { AudioFragment, PlaylistAudioFragment, PlaylistFragment };
