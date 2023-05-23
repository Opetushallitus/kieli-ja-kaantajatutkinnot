package fi.oph.vkt.model.type;

public enum PaymentStatus {
  NEW("new"),
  OK("ok"),
  FAIL("fail"),
  PENDING("pending"),
  DELAYED("delayed");

  private final String text;

  PaymentStatus(final String text) {
    this.text = text;
  }

  @Override
  public String toString() {
    return text;
  }

  public static PaymentStatus fromString(String text) {
    for (PaymentStatus p : PaymentStatus.values()) {
      if (p.text.equalsIgnoreCase(text)) {
        return p;
      }
    }

    throw new RuntimeException("Unknown status " + text);
  }
}
