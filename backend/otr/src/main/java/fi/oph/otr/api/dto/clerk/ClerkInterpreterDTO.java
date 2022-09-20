package fi.oph.otr.api.dto.clerk;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull Boolean deleted,
  @NonNull Boolean isIndividualised,
  @NonNull Boolean hasIndividualisedAddress,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull String nickName,
  String email,
  @NonNull Boolean permissionToPublishEmail,
  String phoneNumber,
  @NonNull Boolean permissionToPublishPhone,
  String otherContactInfo,
  @NonNull Boolean permissionToPublishOtherContactInfo,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull List<String> regions,
  @NonNull ClerkInterpreterQualificationsDTO qualifications
)
  implements ClerkInterpreterDTOCommonFields {}
