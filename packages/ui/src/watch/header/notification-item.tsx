import { RequiredLinkComponent } from '../videos/types';
import { NOTIFICATION_TYPES, NOTIFICATION_ICONS, NotificationType } from './types';
import { NOTIFICATION_TEXTS } from './texts';
import { 
  NotificationMenuItem, 
  NotificationBox, 
  NotificationTitle, 
  NotificationMessage 
} from './styled';

interface NotificationItemProps {
  notification: NotificationType;
  onClose: () => void;
  LinkComponent: RequiredLinkComponent['LinkComponent'];
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const renderContent = () => {
    if (notification.type === NOTIFICATION_TYPES.VIDEO_READY) {
      const texts = NOTIFICATION_TEXTS[notification.type];
      return (
        <>
          <NotificationTitle isRead={!!notification.readAt}>
            {NOTIFICATION_ICONS[notification.type]} {texts.title}
          </NotificationTitle>
          <NotificationMessage>
            {texts.message}
          </NotificationMessage>
        </>
      );
    }

    return (
      <>
        <NotificationTitle isRead={!!notification.readAt}>
          {NOTIFICATION_ICONS[NOTIFICATION_TYPES.DEFAULT]} {NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT].title}
        </NotificationTitle>
        <NotificationMessage>
          {NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT].message}
        </NotificationMessage>
      </>
    );
  };

  return (
    <NotificationMenuItem
      onClick={onClose}
      sx={{ bgcolor: notification.readAt ? 'inherit' : 'action.hover' }}
    >
      <NotificationBox>{renderContent()}</NotificationBox>
    </NotificationMenuItem>
  );
};

export { NotificationItem };
