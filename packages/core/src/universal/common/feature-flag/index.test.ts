/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { checkFeatureFlag } from './index';
import type { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

describe('checkFeatureFlag', () => {
  it('should return false when userId is empty string and not global', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: false,
      allowedUserIds: ['user1'],
    };
    expect(checkFeatureFlag(flag, '')).toBe(false);
  });

  it('should handle malformed allowedUserIds gracefully', () => {
    const flag: FeatureFlagItemConditions = {
      isGlobal: false,
      allowedUserIds: ['', null, undefined] as any,
    };
    expect(checkFeatureFlag(flag, 'user1')).toBe(false);
  });

  it('should return false when object is null (default)', () => {
    const flag = null;

    expect(checkFeatureFlag(flag, 'any-user-id')).toBe(false);
    expect(checkFeatureFlag(flag, '')).toBe(false);
  });

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
