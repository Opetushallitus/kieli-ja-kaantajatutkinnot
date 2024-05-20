export interface FeatureFlags {
  freeEnrollmentAllowed: boolean;
}

export interface FeatureFlagsResponse extends Partial<FeatureFlags> {};