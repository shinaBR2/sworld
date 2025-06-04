import { isValidId, isValidEmail } from '../../../universal/common/stringHelpers';

const formalize = (playlistId: string | null, recipients: string[]) => {
  if (playlistId !== null && !isValidId(playlistId)) {
    throw new Error('Invalid playlist ID');
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients must be a non-empty array');
  }

  if (recipients.some(email => !isValidEmail(email))) {
    throw new Error('Invalid email address found in recipients');
  }

  return {
    playlistId: playlistId ? playlistId.trim() : null,
    recipients: recipients.map(email => email.trim()),
  };
};

const buildVariables = (playlistId: string | null, emails: string[]) => {
  return {
    id: playlistId === null ? undefined : playlistId,
    emails,
  };
};

export { buildVariables, formalize };
