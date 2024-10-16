export interface FeatureFlags {
  freeEnrollmentAllowed: boolean;
  goodAndSatisfactoryLevel: boolean;
}

export interface FeatureFlagsResponse extends Partial<FeatureFlags> {}
