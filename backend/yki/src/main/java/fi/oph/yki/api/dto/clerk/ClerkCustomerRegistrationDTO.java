package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @param examLocation Exam locations in different languages.
 * @param liftedFromQueueAt - Date, when the registration was lifted from the queue. Can be null.
 */
public record ClerkCustomerRegistrationDTO(
  LocalDate examDate,
  ClerkExamDTO exam,
  List<ClerkExamLocationDTO> examLocation,
  RegistrationState registrationState,
  Optional<LocalDate> examPaymentPaidAt,
  Optional<LocalDate> registrationDate,
  RegistrationKind kind,
  Optional<LocalDate> liftedFromQueueAt,
  Optional<LocalDate> expiresAt
) {}
