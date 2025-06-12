import { isValidId, isValidEmail } from '../../../universal/common/stringHelpers';

const formalize = (entityId: string | null, recipients: string[]) => {
  if (!entityId || !isValidId(entityId)) {
    throw new Error('Invalid playlist ID');
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('Recipients must be a non-empty array');
  }

  if (recipients.some(email => !isValidEmail(email))) {
    throw new Error('Invalid email address found in recipients');
  }

  return {
    entityId,
    recipients: recipients.map(email => email.trim()),
  };
};

const buildVariables = (entityId: string | null, emails: string[]) => {
  return {
    id: entityId,
    emails,
  };
};

export { buildVariables, formalize };
