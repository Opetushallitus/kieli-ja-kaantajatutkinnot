package fi.oph.vkt.api.dto.clerk;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPersonDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String firstName
) {}
