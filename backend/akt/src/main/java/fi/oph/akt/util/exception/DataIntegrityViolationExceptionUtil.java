package fi.oph.akt.util.exception;

import org.springframework.dao.DataIntegrityViolationException;

public class DataIntegrityViolationExceptionUtil {

  public static boolean isTranslatorEmailUniquenessException(final DataIntegrityViolationException ex) {
    return matchesConstraint(ex, "uk_translator_email");
  }

  public static boolean isTranslatorIdentityNumberUniquenessException(final DataIntegrityViolationException ex) {
    return matchesConstraint(ex, "uk_translator_identity_number");
  }

  private static boolean matchesConstraint(final DataIntegrityViolationException ex, final String constraint) {
    // comparing lowercase, since hsql has failed constraint name in uppercase and postgres in lowercase
    return ex.getMessage() != null && ex.getMessage().toLowerCase().contains(constraint.toLowerCase());
  }
}
