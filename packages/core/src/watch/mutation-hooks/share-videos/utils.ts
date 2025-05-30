import { isValidId, isValidEmail } from '../../../universal/common/stringHelpers';

const formalize = (playlistId: string, videoIds: string[], recipients: string[]) => {
  if (!isValidId(playlistId)) {
    throw new Error('Invalid playlist ID');
  }

  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    throw new Error('Video IDs must be a non-empty array');
  }

  if (videoIds.some(id => !isValidId(id))) {
    throw new Error('Invalid video ID found in the array');
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients must be a non-empty array');
  }

  if (recipients.some(email => !isValidEmail(email))) {
    throw new Error('Invalid email address found in recipients');
  }

  return {
    playlistId: playlistId.trim(),
    videoIds: videoIds.map(id => id.trim()),
    recipients: recipients.map(email => email.trim()),
  };
};

const buildVariables = (playlistId: string, videoIds: string[], recipients: string[]) => {
  return {
    objects: videoIds.map(videoId => ({
      playlistId,
      videoId,
      recipients,
    })),
  };
};

export { buildVariables, formalize };
