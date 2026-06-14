import { hasuraClient } from '../../client';
import { graphql } from '../../generated-graphql';
import type {
  GetVideoByIdQuery,
  GetVideoByIdQueryVariables,
  GetVideosMissingDurationQuery,
  GetVideosMissingThumbnailQuery,
} from '../../generated-graphql/graphql';

const GET_VIDEO_BY_ID = graphql(/* GraphQL */ `
  query GetVideoById($id: uuid!) {
    videos_by_pk(id: $id) {
      id
      source
      status
      user_id
      duration
      thumbnailUrl
    }
  }
`);

const GET_VIDEOS_MISSING_DURATION = graphql(/* GraphQL */ `
  query GetVideosMissingDuration {
    videos(
      where: { _or: [{ duration: { _is_null: true } }, { duration: { _eq: 0 } }] }
    ) {
      id
    }
  }
`);

const GET_VIDEOS_MISSING_THUMBNAIL = graphql(/* GraphQL */ `
  query GetVideosMissingThumbnail {
    videos(
      where: {
        status: { _eq: "ready" }
        _or: [
          { thumbnailUrl: { _is_null: true } }
          { thumbnailUrl: { _eq: "" } }
        ]
      }
    ) {
      id
    }
  }
`);

const getVideoById = async (id: string) => {
  const response = await hasuraClient.request<
    GetVideoByIdQuery,
    GetVideoByIdQueryVariables
  >({
    document: GET_VIDEO_BY_ID.toString(),
    variables: { id },
  });

  return response.videos_by_pk;
};

const getVideoMissingDuration = async () => {
  const response = await hasuraClient.request<GetVideosMissingDurationQuery>({
    document: GET_VIDEOS_MISSING_DURATION.toString(),
  });

  return response.videos;
};

const getVideoMissingThumbnail = async () => {
  const response = await hasuraClient.request<GetVideosMissingThumbnailQuery>({
    document: GET_VIDEOS_MISSING_THUMBNAIL.toString(),
  });

  return response.videos;
};

export { getVideoById, getVideoMissingDuration, getVideoMissingThumbnail };
