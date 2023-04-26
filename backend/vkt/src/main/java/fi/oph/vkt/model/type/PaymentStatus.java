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
}
