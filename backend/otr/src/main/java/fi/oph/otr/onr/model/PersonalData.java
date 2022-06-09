package fi.oph.otr.onr.model;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PersonalData(
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String nickName,
  @NonNull String identityNumber,
  @NonNull String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  Boolean isIndividualised // always returned from ONR
) {}
