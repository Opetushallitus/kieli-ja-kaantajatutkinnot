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
  String socialSecurityNumber,
  String email,
  String phoneNumber,
  String streetAddress,
  String zip,
  String postOffice
) {}
