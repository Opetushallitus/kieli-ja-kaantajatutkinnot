package fi.oph.yki.util.exception;

public enum APIExceptionType {
  NOT_FOUND,
  PERSON_REGISTRATION_OID_MISMATCH,
  SESSION_OID_NOT_FOUND,
  KOSKI_EDUCATIONS_NOT_FOUND,
  FREE_REGISTRATIONS_EXHAUSTED,
  EXAM_DATE_CREATE_DUPLICATE_DATE,
  EXAM_DATE_REGISTRATION_END_BEFORE_START,
  EXAM_DATE_EXAM_BEFORE_REGISTRATION_END,
  EXAM_DATE_HAS_SESSIONS,
  EVALUATION_INVALID_DATE_ORDER,
  EXAM_DATE_HAS_EVALUATIONS,
  QUARANTINE_MISSING_SSN_AND_BIRTHDATE,
  QUARANTINE_INVALID_SSN,
  QUARANTINE_SSN_BIRTHDATE_MISMATCH;

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
