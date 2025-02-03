import { Video } from '../models/video';

/**
 * Properties required to finalize a video
 */
interface FinalizeVideoProps {
  /** Unique identifier of the video */
  id: string; // UUID type
  /** Processed video source URL */
  source: string;
  /** Generated thumbnail URL */
  thumbnailUrl: string;
}

const finalizeVideo = async (props: FinalizeVideoProps) => {
  const { id, source, thumbnailUrl } = props;

  const [updatedCount] = await Video.update(
    { source, status: 'ready', thumbnail_url: thumbnailUrl },
    {
      where: {
        id,
      },
    }
  );

  if (updatedCount === 0) {
    throw new Error(`Video with ID ${id} not found`);
  }

  return updatedCount;
};

export { finalizeVideo };
