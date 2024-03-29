package fi.oph.akr.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  AUTHORISATION_BASIS_AND_EXAMINATION_DATE_MISMATCH,
  AUTHORISATION_BASIS_AND_TERM_END_DATE_MISMATCH,
  AUTHORISATION_DELETE_LAST_AUTHORISATION,
  AUTHORISATION_MISSING_EXAMINATION_DATE,
  AUTHORISATION_MISSING_MEETING_DATE,
  EXAMINATION_DATE_CREATE_DUPLICATE_DATE,
  EXAMINATION_DATE_DELETE_HAS_AUTHORISATIONS,
  INVALID_VERSION,
  MEETING_DATE_CREATE_DUPLICATE_DATE,
  MEETING_DATE_DELETE_HAS_AUTHORISATIONS,
  MEETING_DATE_UPDATE_DUPLICATE_DATE,
  MEETING_DATE_UPDATE_HAS_AUTHORISATIONS,
  ONR_SAVE_EXCEPTION,
  TRANSLATOR_ONR_ID_NOT_FOUND,
  TRANSLATOR_ONR_ID_AND_INDIVIDUALISED_MISMATCH;

  public String getCode() {
    final StringBuilder codeBuilder = new StringBuilder();
    final String name = this.toString().toLowerCase();
    boolean capitaliseNext = false;

    for (int i = 0; i < name.length(); i++) {
      final char c = name.charAt(i);

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
