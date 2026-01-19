package fi.oph.yki.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPersonDTO(
  @NonNull @NotBlank String oid,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String socialSecurityNumber
) {}
