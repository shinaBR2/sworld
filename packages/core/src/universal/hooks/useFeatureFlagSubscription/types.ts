/**
 * Conditions for determining if a feature flag is enabled
 * @property isGlobal When true, the feature is enabled for all users
 * @property allowedUserIds List of user IDs that can access the feature when not global
 */
export interface FeatureFlagItemConditions {
  isGlobal: boolean;
  allowedUserIds: string[];
}

/**
 * Represents a feature flag configuration
 * @property id Unique identifier for the feature flag
 * @property name Name of the feature flag
 * @property conditions Conditions that determine if the flag is enabled
 */
export interface FeatureFlag {
  id: string;
  name: string;
  conditions: FeatureFlagItemConditions | null;
}

/**
 * Maps feature flag names to their current state
 */
export interface FeatureFlagsData {
  [key: string]: boolean;
}

/**
 * Response structure from the feature flag subscription
 */
export interface FeatureFlagsResponse {
  feature_flag: FeatureFlag[];
}
