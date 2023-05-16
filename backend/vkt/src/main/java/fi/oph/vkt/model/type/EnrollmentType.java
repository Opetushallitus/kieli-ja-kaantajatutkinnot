package fi.oph.vkt.model.type;

public enum EnrollmentType {
  RESERVATION("reservation"),
  QUEUE("queue");

  private final String text;

  EnrollmentType(final String text) {
    this.text = text;
  }

  @Override
  public String toString() {
    return text;
  }

  public static EnrollmentType fromString(String text) {
    for (EnrollmentType p : EnrollmentType.values()) {
      if (p.text.equalsIgnoreCase(text)) {
        return p;
      }
    }

    throw new RuntimeException("Unkown status " + text);
  }
}
