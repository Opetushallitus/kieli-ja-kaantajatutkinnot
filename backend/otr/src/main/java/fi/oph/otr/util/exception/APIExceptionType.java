package fi.oph.otr.util.exception;

/**
 * Enums standing for different API errors expected by the frontend.
 * The respective frontend enum is `APIError`.
 */
public enum APIExceptionType {
  INTERPRETER_CREATE_ONR_ID_AND_INDIVIDUALISED_MISMATCH,
  INTERPRETER_REGION_UNKNOWN,
  QUALIFICATION_LANGUAGE_UNKNOWN;

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
