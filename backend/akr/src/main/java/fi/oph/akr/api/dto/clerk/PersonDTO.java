package fi.oph.akr.api.dto.clerk;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PersonDTO(
  @NonNull String onrId,
  @NonNull Boolean isIndividualised,
  @NonNull Boolean hasIndividualisedAddress,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String nickName,
  @NonNull List<ClerkTranslatorAddressDTO> address
) {}
