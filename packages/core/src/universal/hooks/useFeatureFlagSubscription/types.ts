// TODO centralize this
import { FeatureFlagItemConditions } from '../../../entity/interfaces/featureFlag';

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
