package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;

public record ClerkCustomerRegistrationDTO(
  LocalDate examinationDate,
  ClerkExamDTO exam,
  ClerkExamLocationDTO examLocation,
  ClerkRegistrationStatusDTO registrationStatus,
  LocalDate registrationDate
) {}
