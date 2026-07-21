import { videoMetadataSchema } from 'src/schema/videos/convert';
import type { SubtitleCreatedRequest } from 'src/schema/videos/subtitle-created';
import { getVideoById } from 'src/services/hasura/queries/videos';
import { saveSubtitle } from 'src/services/hasura/mutations/videos/save-subtitle';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { streamSubtitleFile } from 'src/services/videos/helpers/subtitle';
import type { HandlerContext } from 'src/utils/requestHandler';

const subtitleCreatedHandler = async (
  context: HandlerContext<SubtitleCreatedRequest>,
) => {
  // Destructure the validated data
  const { event } = context.validatedData;
  const { id, url, videoId, userId, lang } = event.data;

  // Subtitle CDNs can be hotlink-protected too. The subtitle row carries no
  // metadata of its own, so source the request headers from the parent video's
  // metadata.customRequestHeaders (set as an A2/A3/A4 retry hint).
  const video = await getVideoById(videoId);
  // `.data` is undefined when parsing fails (e.g. malformed metadata), so `?.`
  // covers both "no/invalid metadata" and "no customRequestHeaders" in one path.
  const parsedMetadata = videoMetadataSchema.safeParse(video?.metadata ?? {});
  const customRequestHeaders = parsedMetadata.data?.customRequestHeaders;

  // Download subtitle from url
  const storagePath = `videos/${userId}/${videoId}/${lang}.vtt`;
  await streamSubtitleFile({
    url,
    storagePath,
    contentType: 'text/vtt',
    customRequestHeaders,
  });
  // Upload to GCP Cloud storage
  // Get download url and save to subtitle table
  const downloadUrl = getDownloadUrl(storagePath);
  const subtitle = await saveSubtitle(id, {
    url: downloadUrl,
  });

  return {
    success: true,
    message: 'ok',
    dataObject: subtitle, // or any other data you want to return
  };
};

export { subtitleCreatedHandler };
