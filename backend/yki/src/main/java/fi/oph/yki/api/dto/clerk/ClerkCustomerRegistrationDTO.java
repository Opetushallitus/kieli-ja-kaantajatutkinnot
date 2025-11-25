package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationKind;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * @param examLocation Exam locations in different languages.
 */
public record ClerkCustomerRegistrationDTO(
  LocalDate examinationDate,
  ClerkExamDTO exam,
  List<ClerkExamLocationDTO> examLocation,
  ClerkRegistrationStatusDTO registrationStatus,
  LocalDate registrationDate,
  RegistrationKind kind,
  Optional<LocalDate> liftedFromQueueAt
) {}
