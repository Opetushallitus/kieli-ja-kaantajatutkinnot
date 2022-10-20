package fi.oph.vkt.api.dto.clerk;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkPersonDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String email,
  @NonNull @NotBlank String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country
) {}
