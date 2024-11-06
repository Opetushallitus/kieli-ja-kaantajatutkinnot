package fi.oph.vkt.util.exception;

import org.springframework.dao.DataIntegrityViolationException;

public class DataIntegrityViolationExceptionUtil {

  public static boolean isExamEventLanguageLevelDateExaminerUniquenessException(
    final DataIntegrityViolationException ex
  ) {
    return matchesConstraint(ex, "uk_exam_event_language_level_date_examiner");
  }

  private static boolean matchesConstraint(final DataIntegrityViolationException ex, final String constraint) {
    // comparing lowercase, since hsql has failed constraint name in uppercase and postgres in lowercase
    return ex.getMessage() != null && ex.getMessage().toLowerCase().contains(constraint.toLowerCase());
  }
}
