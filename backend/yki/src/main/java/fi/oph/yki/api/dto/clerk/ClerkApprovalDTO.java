package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationState;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkApprovalDTO(
  @NonNull @NotNull ClerkRegistrationDTO registration,
  @NonNull @NotNull ClerkPersonDTO person,
  @NonNull @NotNull RegistrationState status,
  String supplementRequestDueDate,
  String assessmentDate,
  String examDate
) {}
