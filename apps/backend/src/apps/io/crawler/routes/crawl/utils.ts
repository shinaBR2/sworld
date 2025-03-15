import { VideoInput } from 'src/services/hasura/mutations/videos/bulk-insert';
import { CrawlData, CrawlParams } from './type';

const buildVariables = (result: { data: CrawlData[] }, params: CrawlParams): VideoInput[] => {
  const timestamp = Date.now();
  const { getSingleVideo, title, slugPrefix, userId } = params;

  return result.data.map(({ videoUrl }, index) => {
    const position = Number(index) + 1;

    return {
      title: getSingleVideo ? title : `${title} - ${position}`,
      slug: `${slugPrefix}${position}--${timestamp}`,
      video_url: videoUrl,
      user_id: userId,
    };
  });
};

export { buildVariables };
