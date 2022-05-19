package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterCreateDTO(
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String email,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  String phoneNumber,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  String otherContactInfo,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
  @NonNull List<String> regions,
  @NonNull @NotEmpty @Valid List<ClerkQualificationCreateDTO> qualifications
)
  implements ClerkInterpreterDTOCommonFields {}
