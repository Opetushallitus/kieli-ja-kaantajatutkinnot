package fi.oph.vkt.util.exception;

import org.springframework.dao.DataIntegrityViolationException;

public class DataIntegrityViolationExceptionUtil {

  private static boolean matchesConstraint(final DataIntegrityViolationException ex, final String constraint) {
    // comparing lowercase, since hsql has failed constraint name in uppercase and postgres in lowercase
    return ex.getMessage() != null && ex.getMessage().toLowerCase().contains(constraint.toLowerCase());
  }
}
