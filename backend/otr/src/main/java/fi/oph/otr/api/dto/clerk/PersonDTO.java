package fi.oph.otr.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PersonDTO(
  @NonNull String onrId,
  @NonNull Boolean isIndividualised,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String nickName,
  String street,
  String postalCode,
  String town,
  String country
) {}
