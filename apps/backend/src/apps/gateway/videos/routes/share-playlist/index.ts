import type { ShareRequest } from 'src/schema/videos/share';
import { sharePlaylist } from 'src/services/hasura/mutations/share-videos';
import { getPlaylistVideos } from 'src/services/hasura/queries/share';
import { CustomError } from 'src/utils/custom-error';
import { VIDEO_ERRORS } from 'src/utils/error-codes';
import type { HandlerContext } from 'src/utils/requestHandler';
import { AppError, AppResponse } from 'src/utils/schema';
import { isValidEmail } from 'src/utils/validators/email';

const sharePlaylistHandler = async (context: HandlerContext<ShareRequest>) => {
  const { validatedData } = context;
  const { event } = validatedData;
  const { data, metadata } = event;

  const { id: entityId, sharedRecipientsInput } = data;

  // if (skipProcess) {
  //   logger.info({ metadata }, 'Skip process');
  //   return AppResponse(true, 'skipped');
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
  const { playlist_by_pk, users } = await getPlaylistVideos(
    entityId,
    validEmails,
  );

  if (!playlist_by_pk) {
    return AppError('Playlist not found', {
      eventId: metadata.id,
    });
  }

  const videos = playlist_by_pk.playlist_videos.map((pv) => pv.video);

  if (!videos.length) {
    return AppError('No ready videos found in playlist', {
      eventId: metadata.id,
    });
  }

  if (!users?.length) {
    return AppError('No valid users found', {
      eventId: metadata.id,
    });
  }

  // 3. create shared_playlist_recipients records
  const recipients = users.map((user) => ({
    playlistId: entityId,
    recipientId: user.id,
  }));

  // 4. Update shared_recipients in playlist
  try {
    await sharePlaylist(recipients, entityId, validEmails);
  } catch (error) {
    throw CustomError.critical('Playlist share failed', {
      originalError: error,
      errorCode: VIDEO_ERRORS.SHARE_FAILED,
      context: {
        data,
        metadata,
      },
      source: 'apps/gateway/videos/routes/share/index.ts',
    });
  }

  return AppResponse(true, 'ok');
};

export { sharePlaylistHandler };
