/**
 * Conditions for determining if a feature flag is enabled
 * @property isGlobal When true, the feature is enabled for all users
 * @property allowedUserIds List of user IDs that can access the feature when not global
 */
export interface FeatureFlagItemConditions {
  isGlobal: boolean;
  allowedUserIds: string[];
}

export interface FeatureFlag {
  id: string;
  name: string;
  conditions: FeatureFlagItemConditions | null;
}

export interface FeatureFlagsData {
  [key: string]: boolean;
}

export interface FeatureFlagsResponse {
  feature_flag: FeatureFlag[];
}
