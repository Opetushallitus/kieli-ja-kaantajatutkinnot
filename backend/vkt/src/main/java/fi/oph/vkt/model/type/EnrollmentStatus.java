package fi.oph.vkt.model.type;

public enum EnrollmentStatus {
  PAID,
  EXPECTING_PAYMENT,
  EXPECTING_PAYMENT_PUBLIC,
  QUEUED,
  CANCELED,
  CANCELED_PUBLIC;

  public String getCode() {
    final StringBuilder codeBuilder = new StringBuilder();
    final String name = this.toString().toLowerCase();
    boolean capitaliseNext = false;

    for (int i = 0; i < name.length(); i++) {
      char c = name.charAt(i);

      if (c == '_') {
        capitaliseNext = true;
      } else {
        codeBuilder.append(capitaliseNext ? Character.toUpperCase(c) : c);
        capitaliseNext = false;
      }
    }

    return codeBuilder.toString();
  }
}
