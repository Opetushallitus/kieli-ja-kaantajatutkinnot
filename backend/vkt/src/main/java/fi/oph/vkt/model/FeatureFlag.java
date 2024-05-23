package fi.oph.vkt.model;

public enum FeatureFlag {
  FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED("freeEnrollmentAllowed");

  private final String propertyKey;

  FeatureFlag(final String propertyKey) {
    this.propertyKey = propertyKey;
  }

  public String getPropertyKey() {
    return this.propertyKey;
  }
}
