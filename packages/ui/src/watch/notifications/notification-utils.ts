import { NOTIFICATION_TEXTS } from './texts';
import type { NotificationType } from './types';
import { NOTIFICATION_TYPES } from './types';

export const getNotificationMessage = (notification: NotificationType) => {
  const texts =
    NOTIFICATION_TEXTS[notification.type as keyof typeof NOTIFICATION_TEXTS] ||
    NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT];

  if (notification.type === NOTIFICATION_TYPES.VIDEO_READY) {
    const videoTitle = notification.video?.title || 'Unknown Video Title';
    return texts.message.replace('###videoTitle###', `"${videoTitle}"`);
  }

  return texts.message;
};
