package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterCreateDTO(
  String onrId,
  Boolean isIndividualised,
  Boolean hasIndividualisedAddress,
  @Size(min = 1, max = 255) @NonNull @NotBlank String identityNumber,
  @Size(min = 1, max = 255) @NonNull @NotBlank String lastName,
  @Size(min = 1, max = 255) @NonNull @NotBlank String firstName,
  @Size(min = 1, max = 255) @NonNull @NotBlank String nickName,
  @Size(min = 1, max = 255) @NonNull @NotBlank String email,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  @Size(min = 1, max = 255) String phoneNumber,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  @Size(min = 1, max = 255) String otherContactInfo,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  @Size(min = 1, max = 255) String street,
  @Size(min = 1, max = 8) String postalCode,
  @Size(min = 1, max = 255) String town,
  @Size(min = 1, max = 64) String country,
  @Size(min = 1, max = 4096) String extraInformation,
  @NonNull @NotNull List<String> regions,
  @NonNull @NotEmpty @Valid List<ClerkQualificationCreateDTO> qualifications
)
  implements ClerkInterpreterDTOCommonFields {}
