package fi.oph.vkt.model;

public enum FeatureFlag {
  FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED("freeEnrollmentAllowed"),
  GOOD_AND_SATISFACTORY_LEVEL("goodAndSatisfactoryLevel");

  private final String propertyKey;

  FeatureFlag(final String propertyKey) {
    this.propertyKey = propertyKey;
  }

  public String getPropertyKey() {
    return this.propertyKey;
  }
}
