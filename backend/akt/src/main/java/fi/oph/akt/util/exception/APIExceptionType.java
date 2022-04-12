package fi.oph.akt.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  AUTHORISATION_BASIS_AND_AUT_DATE_MISMATCH,
  AUTHORISATION_DELETE_LAST_AUTHORISATION,
  AUTHORISATION_MISSING_MEETING_DATE,
  MEETING_DATE_CREATE_DUPLICATE_DATE,
  MEETING_DATE_DELETE_HAS_AUTHORISATIONS,
  MEETING_DATE_UPDATE_DUPLICATE_DATE,
  MEETING_DATE_UPDATE_HAS_AUTHORISATIONS,
  TRANSLATOR_CREATE_DUPLICATE_EMAIL,
  TRANSLATOR_CREATE_DUPLICATE_IDENTITY_NUMBER,
  TRANSLATOR_UPDATE_DUPLICATE_EMAIL,
  TRANSLATOR_UPDATE_DUPLICATE_IDENTITY_NUMBER;

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
