package fi.oph.vkt.util;

public class ExamEventUtil {

  public static boolean isCongested(final long participants, final long reservations, final long maxParticipants) {
    return participants < maxParticipants && participants + reservations >= maxParticipants;
  }
}
