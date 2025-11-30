package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.List;

/**
 * @param examLocation Exam locations in different languages.
 */
public record ClerkCustomerRegistrationDTO(
  LocalDate examinationDate,
  ClerkExamDTO exam,
  List<ClerkExamLocationDTO> examLocation,
  ClerkRegistrationStatusDTO registrationStatus,
  LocalDate registrationDate
) {}
