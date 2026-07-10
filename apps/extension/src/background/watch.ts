import { getToken } from './auth';
import { hasuraConfig } from '../../envConfig';
import type { VideoMetadata } from 'core/universal/extension/communication/types';

const importVideo = async (
  metadata: VideoMetadata,
): Promise<{ success: boolean; videoId?: string; error?: string }> => {
  const token = await getToken();

  if (!token) {
    return { success: false, error: 'Not authenticated' };
  }

  const response = await fetch(hasuraConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation InsertVideo($object: videos_insert_input!) {
          insert_videos_one(object: $object) {
            id
            title
          }
        }
      `,
      variables: {
        object: {
          title: metadata.title || 'Untitled Video',
          source: metadata.url,
          video_url: metadata.url,
          sId: metadata.videoId,
          thumbnailUrl: metadata.thumbnailUrl,
          duration: metadata.duration,
          status: 'ready',
          keepOriginalSource: true,
        },
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    return {
      success: false,
      error: json.errors[0]?.message ?? 'Failed to import video',
    };
  }

  const video = json.data?.insert_videos_one;

  if (!video?.id) {
    return { success: false, error: 'No video ID returned' };
  }

  return { success: true, videoId: video.id };
};

export { importVideo };
