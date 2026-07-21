import type { VideoInput } from 'src/services/hasura/mutations/videos/bulk-insert';
import type { CrawlData, CrawlParams } from './type';

const buildVariables = (
  result: { data: CrawlData[] },
  params: CrawlParams,
): VideoInput[] => {
  const timestamp = Date.now();
  const { getSingleVideo, title, slugPrefix, userId } = params;

  return result.data.map(({ videoUrl }, index) => {
    const position = Number(index) + 1;

    if (getSingleVideo) {
      return {
        title,
        slug: `${slugPrefix}-${timestamp}`,
        video_url: videoUrl,
        user_id: userId,
      };
    }

    return {
      title: `${title} - Tập ${position}`,
      slug: `${slugPrefix}${position}--${timestamp}`,
      video_url: videoUrl,
      user_id: userId,
      playlist_videos: {
        data: [
          {
            position,
            playlist: {
              data: {
                title: title,
                slug: `${slugPrefix}--${timestamp}`,
                user_id: userId,
              },
              on_conflict: {
                constraint: 'playlist_user_id_slug_key',
                update_columns: ['updated_at'],
              },
            },
          },
        ],
      },
    };
  });
};

export { buildVariables };
