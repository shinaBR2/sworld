import { describe, expect, it } from 'vitest';
import { getNotificationMessage } from './notification-utils';
import { NOTIFICATION_TEXTS } from './texts';
import { NOTIFICATION_TYPES } from './types';

describe('getNotificationMessage', () => {
  const mockVideoNotification = {
    type: NOTIFICATION_TYPES.VIDEO_READY,
    video: { title: 'My Awesome Video' },
  };

  const mockDefaultNotification = {
    type: NOTIFICATION_TYPES.DEFAULT,
  };

  it('should replace video title placeholder with actual title', () => {
    const result = getNotificationMessage(mockVideoNotification as any);
    expect(result).toBe('"My Awesome Video" is ready to watch');
  });

  it('should use fallback title when video data is missing', () => {
    const result = getNotificationMessage({ type: NOTIFICATION_TYPES.VIDEO_READY } as any);
    expect(result).toBe('"Unknown Video Title" is ready to watch');
  });

  it('should return default message for DEFAULT type', () => {
    const result = getNotificationMessage(mockDefaultNotification as any);
    expect(result).toBe(NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT].message);
  });

  it('should handle unknown notification types', () => {
    const result = getNotificationMessage({ type: 'UNKNOWN_TYPE' } as any);
    expect(result).toBe(NOTIFICATION_TEXTS[NOTIFICATION_TYPES.DEFAULT].message);
  });
});
