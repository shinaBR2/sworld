import type { useQueryContext } from 'core/providers/query';

export const NOTIFICATION_TYPES = {
  VIDEO_READY: 'video-ready',
  DEFAULT: 'default',
} as const;

export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.VIDEO_READY]: '🎥',
  [NOTIFICATION_TYPES.DEFAULT]: '📢',
} as const;

export type NotificationType = NonNullable<
  ReturnType<typeof useQueryContext>['notifications']['data']
>[number];
