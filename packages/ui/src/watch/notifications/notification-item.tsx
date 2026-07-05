import type { RequiredLinkComponent } from '../videos/types';
import { getNotificationMessage } from './notification-utils';
import {
  NotificationBox,
  NotificationMenuItem,
  NotificationMessage,
  NotificationTitle,
} from './styled';
import { NOTIFICATION_TEXTS } from './texts';
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_TYPES,
  type NotificationType,
} from './types';

interface NotificationItemProps {
  notification: NotificationType;
  onClick: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationItem = ({ notification, onClick }: NotificationItemProps) => {
  const renderContent = () => {
    if (notification.type === NOTIFICATION_TYPES.VIDEO_READY) {
      const texts = NOTIFICATION_TEXTS[notification.type];
      return (
        <>
          <NotificationTitle isRead={!!notification.readAt}>
            {NOTIFICATION_ICONS[notification.type]} {texts.title}
          </NotificationTitle>
          <NotificationMessage>
            {getNotificationMessage(notification)}
          </NotificationMessage>
        </>
      );
    }

    return (
      <>
        <NotificationTitle isRead={!!notification.readAt}>
          {NOTIFICATION_ICONS[NOTIFICATION_TYPES.DEFAULT]}{' '}
          {NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT].title}
        </NotificationTitle>
        <NotificationMessage>
          {getNotificationMessage(notification)}
        </NotificationMessage>
      </>
    );
  };

  return (
    <NotificationMenuItem onClick={onClick} isRead={!!notification.readAt}>
      <NotificationBox>{renderContent()}</NotificationBox>
    </NotificationMenuItem>
  );
};

export { NotificationItem };
