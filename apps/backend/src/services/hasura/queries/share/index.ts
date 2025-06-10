import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import {
  PlaylistDetailQuery,
  PlaylistDetailQueryVariables,
  UsersQuery,
  UsersQueryVariables,
} from '../../generated-graphql/graphql';

const GET_PLAYLIST_VIDEOS = graphql(/* GraphQL */ `
  query PlaylistDetail($id: uuid!, $emails: [String!]!) {
    playlist_by_pk(id: $id) {
      playlist_videos(where: { video: { status: { _eq: "ready" } } }) {
        video {
          id
          status
        }
      }
    }
    users(where: { email: { _in: $emails } }) {
      id
      email
      username
    }
  }
`);

const GET_USERS = graphql(/* GraphQL */ `
  query Users($emails: [String!]!) {
    users(where: { email: { _in: $emails } }) {
      id
      email
      username
    }
  }
`);

const getPlaylistVideos = async (id: string, emails: string[]): Promise<PlaylistDetailQuery> => {
  const variables = {
    id,
    emails,
  };

  const response = await hasuraClient.request<PlaylistDetailQuery, PlaylistDetailQueryVariables>({
    document: GET_PLAYLIST_VIDEOS.toString(),
    variables: variables,
  });
  return response;
};

const getUsers = async (emails: string[]): Promise<UsersQuery> => {
  const variables = {
    emails,
  };

  const response = await hasuraClient.request<UsersQuery, UsersQueryVariables>({
    document: GET_USERS.toString(),
    variables: variables,
  });
  return response;
};

export { getPlaylistVideos, getUsers };
