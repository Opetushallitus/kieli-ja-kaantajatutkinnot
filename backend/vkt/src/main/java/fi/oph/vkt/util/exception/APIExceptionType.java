package fi.oph.vkt.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH,
  ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED,
  ENROLLMENT_ALREADY_PAID,
  EXAM_EVENT_DUPLICATE,
  INITIALISE_ENROLLMENT_DUPLICATE_PERSON,
  INITIALISE_ENROLLMENT_HAS_CONGESTION,
  INITIALISE_ENROLLMENT_IS_FULL,
  INITIALISE_ENROLLMENT_REGISTRATION_CLOSED,
  INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM,
  INVALID_VERSION,
  INVALID_TICKET,
  RENEW_RESERVATION_NOT_ALLOWED,
  RESERVATION_PERSON_SESSION_MISMATCH,
  PAYMENT_PERSON_SESSION_MISMATCH,
  PAYMENT_VALIDATION_FAIL,
  PAYMENT_ALREADY_PAID,
  PAYMENT_AMOUNT_MISMATCH,
  TICKET_VALIDATION_ERROR;

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
