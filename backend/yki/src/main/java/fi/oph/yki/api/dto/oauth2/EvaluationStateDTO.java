package fi.oph.yki.api.dto.oauth2;

import jakarta.validation.constraints.NotNull;
import lombok.NonNull;

public record EvaluationStateDTO(
  @NonNull @NotNull RegistrationIdentificationDTO suoritus,
  @NonNull @NotNull KituEvaluationState tila
) {}
