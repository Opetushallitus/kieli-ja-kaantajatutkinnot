package fi.oph.vkt.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  ENROLLMENT_ALREADY_PAID,
  ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH,
  ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED,
  EXAM_EVENT_DUPLICATE,
  INITIALISE_ENROLLMENT_DUPLICATE_PERSON,
  INITIALISE_ENROLLMENT_HAS_CONGESTION,
  INITIALISE_ENROLLMENT_IS_FULL,
  INITIALISE_ENROLLMENT_REGISTRATION_CLOSED,
  INITIALISE_ENROLLMENT_TO_QUEUE_HAS_ROOM,
  INVALID_TICKET,
  INVALID_VERSION,
  PAYMENT_ALREADY_PAID,
  PAYMENT_AMOUNT_MISMATCH,
  PAYMENT_LINK_HAS_EXPIRED,
  PAYMENT_LINK_INVALID_ENROLLMENT_STATUS,
  PAYMENT_PERSON_SESSION_MISMATCH,
  PAYMENT_REFERENCE_MISMATCH,
  PAYMENT_VALIDATION_FAIL,
  RENEW_RESERVATION_NOT_ALLOWED,
  RESERVATION_PERSON_SESSION_MISMATCH,
  FREE_ENROLLMENT_ALL_USED,
  FREE_ENROLLMENT_NO_PROOF_PROVIDED,
  SESSION_MISSING_PERSON_ID,
  SESSION_MISSING_QUEUE_EXAM_ID,
  KOSKI_DATA_MISMATCH,
  USER_ATTACHMENTS_MISSING,
  TOO_MANY_ATTACHMENTS,
  INVALID_ATTACHMENT,
  ATTACHMENT_PERSON_MISMATCH,
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
