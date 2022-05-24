package fi.oph.otr.onr.model;

import javax.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PersonalData(
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country
) {}
