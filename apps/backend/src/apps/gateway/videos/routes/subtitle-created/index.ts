import type { SubtitleCreatedRequest } from 'src/schema/videos/subtitle-created';
import { saveSubtitle } from 'src/services/hasura/mutations/videos/save-subtitle';
import { getDownloadUrl } from 'src/services/videos/helpers/gcp-cloud-storage';
import { streamSubtitleFile } from 'src/services/videos/helpers/subtitle';

const subtitleCreatedHandler = async (data: SubtitleCreatedRequest) => {
  // Destructure the validated data
  const { event } = data;
  const { id, url, videoId, userId, lang } = event.data;

  // TODO: Add your business logic here
  // You can access event.data, event.metadata, etc.
  // console.log('Processing subtitle created event:', event);
  // Download subtitle from url
  const storagePath = `videos/${userId}/${videoId}/${lang}.vtt`;
  await streamSubtitleFile({ url, storagePath, contentType: 'text/vtt' });
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
