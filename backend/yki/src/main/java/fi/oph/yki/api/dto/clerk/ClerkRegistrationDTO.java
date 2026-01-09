package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkRegistrationDTO(
  Long id,
  LocalDate registrationDate,
  ClerkPersonDTO person,
  RegistrationState state,
  @NonNull @NotNull RegistrationKind kind
) {}
