package fi.oph.yki.api.dto.oauth2;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EvaluationStateErrorDTO(
  @NonNull @NotNull RegistrationIdentificationDTO suoritus,
  @NonNull @NotNull KituEvaluationState tila,
  @NonNull @NotNull EvaluationStateError virhe
) {}
