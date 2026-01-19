package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.FreeRegistrationStatus;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull FreeRegistrationStatus status,
  @NonNull @NotNull String examDate
) {}
