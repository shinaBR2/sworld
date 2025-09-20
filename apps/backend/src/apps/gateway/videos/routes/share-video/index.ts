import type { ShareRequest } from 'src/schema/videos/share';
import { shareVideo } from 'src/services/hasura/mutations/share-videos';
import { getUsers } from 'src/services/hasura/queries/share';
import { verifySignature } from 'src/services/videos/convert/validator';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import { AppError, AppResponse } from 'src/utils/schema';
import { isValidEmail } from 'src/utils/validators/email';

const shareVideoHandler = async (validatedData: ShareRequest) => {
  const { signatureHeader, event } = validatedData;
  const { data, metadata } = event;

  if (!verifySignature(signatureHeader)) {
    return AppError('Invalid webhook signature for event', {
      eventId: metadata.id,
    });
  }

  const { id: entityId, sharedRecipientsInput } = data;

  // if (skipProcess) {
  //   logger.info({ metadata }, 'Skip process');
  //   return res.json(AppResponse(true, 'skipped'));
  // }

  // 1. Validate emails
  const validEmails = sharedRecipientsInput.filter((email) =>
    isValidEmail(email),
  );
  if (!validEmails.length) {
    // TODO send email
    return AppError('Invalid email', {
      eventId: metadata.id,
    });
  }
  // 2. get list videos and users
  const { users } = await getUsers(validEmails);

  if (!users?.length) {
    return AppError('No valid users found', {
      eventId: metadata.id,
    });
  }

  // 3. create shared_playlist_recipients records
  const recipients = users.map((user) => ({
    videoId: entityId,
    recipientId: user.id,
  }));

  // 4. Update shared_recipients in playlist
  try {
    await shareVideo(recipients, entityId, validEmails);
  } catch (error) {
    throw CustomError.critical('Video share failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.SHARE_FAILED,
      context: {
        data,
        metadata,
      },
      source: 'apps/gateway/videos/routes/share-video/index.ts',
    });
  }

  return AppResponse(true, 'ok');
};

export { shareVideoHandler };
