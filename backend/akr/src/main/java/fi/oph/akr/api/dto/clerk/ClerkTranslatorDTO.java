package fi.oph.akr.api.dto.clerk;

import java.util.List;
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
  @NonNull List<ClerkTranslatorAddressDTO> address,
  String extraInformation,
  @NonNull Boolean isAssuranceGiven,
  @NonNull ClerkTranslatorAuthorisationsDTO authorisations
) {}
