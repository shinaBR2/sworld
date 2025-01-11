import { describe, it, expect } from 'vitest';
import { checkFeatureFlag } from './index';
import type { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

describe('checkFeatureFlag', () => {
  it('should return true when isGlobal is true, regardless of userId', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: true,
      allowedUserIds: [],
    };

    expect(checkFeatureFlag(flag, 'any-user-id')).toBe(true);
    expect(checkFeatureFlag(flag, '')).toBe(true);
  });

  it('should return true when user is in allowedUserIds', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: false,
      allowedUserIds: ['user1', 'user2', 'user3'],
    };

    expect(checkFeatureFlag(flag, 'user2')).toBe(true);
  });

  it('should return false when user is not in allowedUserIds', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: false,
      allowedUserIds: ['user1', 'user2', 'user3'],
    };

    expect(checkFeatureFlag(flag, 'user4')).toBe(false);
  });

  it('should return false when allowedUserIds is empty and not global', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: false,
      allowedUserIds: [],
    };

    expect(checkFeatureFlag(flag, 'any-user-id')).toBe(false);
  });
});