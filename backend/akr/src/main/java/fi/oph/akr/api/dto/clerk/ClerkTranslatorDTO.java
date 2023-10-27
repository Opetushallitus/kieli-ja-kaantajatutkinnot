package fi.oph.akr.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull Boolean isIndividualised,
  @NonNull Boolean hasIndividualisedAddress,
  @NonNull String firstName,
  @NonNull String lastName,
  @NonNull String nickName,
  String identityNumber,
  String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull Boolean isAssuranceGiven,
  @NonNull ClerkTranslatorAuthorisationsDTO authorisations
) {}
