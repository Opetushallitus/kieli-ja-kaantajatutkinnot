package fi.oph.vkt.util;

import fi.oph.vkt.audit.dto.ClerkExamEventAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.util.List;

public class ExamEventUtil {

  public static long getOpenings(final ExamEvent examEvent) {
    final List<Enrollment> enrollments = examEvent.getEnrollments();
    final long participants = enrollments
      .stream()
      .filter(e ->
        e.getStatus() == EnrollmentStatus.COMPLETED ||
        e.getStatus() == EnrollmentStatus.AWAITING_PAYMENT ||
        e.getStatus() == EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
      )
      .count();

    final boolean hasQueue = enrollments.stream().anyMatch(e -> e.getStatus() == EnrollmentStatus.QUEUED);

    return hasQueue ? 0L : examEvent.getMaxParticipants() - participants;
  }

  public static boolean isCongested(final ExamEvent examEvent) {
    final long openings = getOpenings(examEvent);
    final long reservations = examEvent.getReservations().stream().filter(Reservation::isActive).count();

    return isCongested(openings, reservations);
  }

  public static boolean isCongested(final long openings, final long reservations) {
    return openings > 0 && openings <= reservations;
  }

  public static ClerkExamEventAuditDTO createExamEventAuditDTO(final ExamEvent examEvent) {
    return ClerkExamEventAuditDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .modifiedAt(DateUtil.formatOptionalDatetime(examEvent.getModifiedAt()))
      .language(examEvent.getLanguage())
      .level(examEvent.getLevel())
      .date(DateUtil.formatOptionalDate(examEvent.getDate()))
      .registrationCloses(DateUtil.formatOptionalDate(examEvent.getRegistrationCloses()))
      .isHidden(examEvent.isHidden())
      .maxParticipants(examEvent.getMaxParticipants())
      .build();
  }
}
