import { graphql } from '../../graphql';

const PhotoFragment = graphql(/* GraphQL */ `
  fragment PhotoFields on photos {
    id
    type
    source
    mediumUrl
    thumbnailUrl
    blurHash
    width
    height
    duration
    takenAt
    slug
  }
`);

const AlbumFragment = graphql(/* GraphQL */ `
  fragment AlbumFields on playlist {
    id
    title
    thumbnailUrl
    slug
    createdAt
    description
    playlist_photos(order_by: { position: asc }) {
      position
      photo {
        ...PhotoFields
      }
    }
  }
`);

export { AlbumFragment, PhotoFragment };
