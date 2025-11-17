package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.Optional;

public record ClerkCustomerQueuedExamDTO(
  LocalDate examinationDate,
  ClerkExamDTO exam,
  ClerkExamLocationDTO examLocation,
  ClerkRegistrationStatusDTO registrationStatus,
  LocalDate registrationDate,
  QueueSpotOffered queueSpotOffered
) {
  public record QueueSpotOffered(String offered, Optional<LocalDate> dueDate) {}
}
