package fi.oph.vkt.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  CREATE_RESERVATION_CONGESTION,
  CREATE_RESERVATION_REGISTRATION_CLOSED,
  ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH,
  EXAM_EVENT_DUPLICATE,
  INVALID_VERSION;

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
