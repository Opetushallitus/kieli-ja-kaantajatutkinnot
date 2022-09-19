package fi.oph.otr.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  INTERPRETER_INVALID_NICK_NAME,
  INTERPRETER_ONR_ID_AND_INDIVIDUALISED_MISMATCH,
  INTERPRETER_REGION_UNKNOWN,
  INVALID_VERSION,
  MEETING_DATE_CREATE_DUPLICATE_DATE,
  MEETING_DATE_DELETE_HAS_QUALIFICATIONS,
  MEETING_DATE_UPDATE_DUPLICATE_DATE,
  MEETING_DATE_UPDATE_HAS_QUALIFICATIONS,
  QUALIFICATION_DELETE_LAST_QUALIFICATION,
  QUALIFICATION_INVALID_TERM,
  QUALIFICATION_LANGUAGE_UNKNOWN,
  QUALIFICATION_MISSING_MEETING_DATE;

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
