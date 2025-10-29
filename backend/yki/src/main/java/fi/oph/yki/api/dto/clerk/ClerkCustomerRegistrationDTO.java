package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.Optional;

public record ClerkCustomerRegistrationDTO(
  LocalDate examinationDate,
  Exam exam,
  Location examLocation,
  Status registrationStatus,
  LocalDate registrationDate
) {
  public record Exam(
    String language, // ExamLanguage.FIN
    String level // ExamLevel.KESKI
  ) {}

  public record Location(String schoolName, String municipality) {}

  public record Status(
    String state, // RegistrationStates.Completed,
    Optional<LocalDate> paidAt
  ) {}
}
