import { isValidId, isValidEmail } from '../../../universal/common/stringHelpers';

import { Shared_Videos_Insert_Input } from '../../../graphql/graphql';

const formalize = (playlistId: string | null, videoIds: string[], recipients: string[]) => {
  if (playlistId !== null && !isValidId(playlistId)) {
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
    playlistId: playlistId ? playlistId.trim() : null,
    videoIds: videoIds.map(id => id.trim()),
    recipients: recipients.map(email => email.trim()),
  };
};

const buildVariables = (playlistId: string | null, videoIds: string[], recipients: string[]) => {
  const sharedVideos: Shared_Videos_Insert_Input[] = videoIds.map(videoId => ({
    playlistId: playlistId === null ? undefined : playlistId,
    videoId,
    recipients,
  }));

  return {
    objects: sharedVideos,
  };
};

export { buildVariables, formalize };
