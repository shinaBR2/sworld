import { NOTIFICATION_TYPES } from './types';

export const NOTIFICATION_TEXTS = {
  [NOTIFICATION_TYPES.VIDEO_READY]: {
    title: 'Video Ready',
    message: '###videoTitle### is ready to watch',
  },
  [NOTIFICATION_TYPES.DEFAULT]: {
    title: 'New Notification',
    message: 'You have a new notification',
  },
} as const;
