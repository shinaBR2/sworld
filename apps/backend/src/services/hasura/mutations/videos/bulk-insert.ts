import { graphql } from '../../generated-graphql';
import type {
  InsertVideosMutation,
  Videos_Insert_Input,
} from '../../generated-graphql/graphql';
import { hasuraClient } from '../../client';

const BULK_INSERT_VIDEOS = graphql(/* GraphQL */ `
  mutation InsertVideos($objects: [videos_insert_input!]!) {
    insert_videos(objects: $objects) {
      returning {
        id
        title
        description
      }
    }
  }
`);

interface VideoInput {
  title: string;
  slug: string;
  video_url: string;
  user_id: string;
  description?: string;
}

interface BulkInsertsVariables {
  objects: Array<Videos_Insert_Input>;
}

const insertVideos = async (videos: VideoInput[]): Promise<any> => {
  const variables = {
    objects: videos,
  };

  const response = await hasuraClient.request<
    InsertVideosMutation,
    BulkInsertsVariables
  >({
    document: BULK_INSERT_VIDEOS.toString(),
    variables: variables,
  });
  return response.insert_videos;
};

export { type VideoInput, insertVideos };
