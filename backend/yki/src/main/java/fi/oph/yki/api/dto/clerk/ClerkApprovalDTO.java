package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.FreeRegistrationStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDTO(
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull FreeRegistrationStatus status,
  LocalDate supplementRequestDueDate,
  LocalDate assessmentDate,
  LocalDate examDate
) {}
