package fi.oph.vkt.util;

public class ExamEventUtil {

  public static boolean isCongested(final long openings, final long reservations) {
    return openings > 0 && openings <= reservations;
  }
}
