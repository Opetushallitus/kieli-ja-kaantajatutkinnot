package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.Builder;

/**
 * @param examLocation Exam locations in different languages.
 * @param liftedFromQueueAt - Date, when the registration was lifted from the queue. Can be null.
 */
@Builder
public record ClerkCustomerRegistrationDTO(
  Long id,
  LocalDate examDate,
  ClerkExamDTO exam,
  List<ClerkExamLocationDTO> examLocation,
  RegistrationState registrationState,
  Optional<LocalDateTime> examPaymentPaidAt,
  Optional<LocalDateTime> registrationDate,
  RegistrationKind kind,
  Optional<LocalDateTime> liftedFromQueueAt,
  Optional<LocalDateTime> expiresAt
) {}
