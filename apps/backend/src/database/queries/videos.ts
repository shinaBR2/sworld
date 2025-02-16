import { Op, Transaction } from 'sequelize';
import { Video, VideoTS } from '../models/video';

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
  /** Calculated video duration */
  duration?: number;
}

const finalizeVideo = async (props: FinalizeVideoProps) => {
  const { id, source, thumbnailUrl, duration = null } = props;

  const [updatedCount] = await Video.update(
    { source, status: 'ready', thumbnail_url: thumbnailUrl, duration },
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

const getVideoMissingDuration = async () => {
  const query = {
    where: {
      [Op.or]: [{ duration: null }, { duration: 0 }],
    },
  };

  const videosWithoutDuration = await Video.findAll(query);

  return videosWithoutDuration as unknown as VideoTS[];
};

const getVideoMissingThumbnail = async () => {
  const query = {
    where: {
      [Op.and]: [{ status: 'ready' }, { [Op.or]: [{ thumbnail_url: null }, { thumbnail_url: '' }] }],
    },
  };

  const videos = await Video.findAll(query);

  return videos as unknown as VideoTS[];
};

const getVideoById = async (id: string) => {
  const record = await Video.findByPk(id);
  return record;
};

interface UpdateVideoDurationProps {
  id: string;
  duration: number;
  transaction?: Transaction;
}

const updateVideoDuration = async (props: UpdateVideoDurationProps) => {
  const { id, duration, transaction } = props;
  const [updatedCount] = await Video.update(
    { duration },
    {
      where: {
        id,
      },
      transaction,
    }
  );

  if (updatedCount === 0) {
    throw new Error(`Video with ID ${id} not found`);
  }

  return updatedCount;
};

interface UpdateVideoThumbnailProps {
  id: string;
  thumbnailUrl: string;
  transaction?: Transaction;
}

const updateVideoThumbnail = async (props: UpdateVideoThumbnailProps) => {
  const { id, thumbnailUrl, transaction } = props;
  const [updatedCount] = await Video.update(
    { thumbnail_url: thumbnailUrl },
    {
      where: {
        id,
      },
      transaction,
    }
  );

  if (updatedCount === 0) {
    throw new Error(`Video with ID ${id} not found`);
  }

  return updatedCount;
};

export {
  finalizeVideo,
  getVideoMissingDuration,
  getVideoMissingThumbnail,
  getVideoById,
  updateVideoDuration,
  updateVideoThumbnail,
};
