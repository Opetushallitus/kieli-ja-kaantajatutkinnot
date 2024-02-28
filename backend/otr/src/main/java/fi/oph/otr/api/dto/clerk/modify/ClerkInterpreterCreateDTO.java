package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.util.StringUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterCreateDTO(
  String onrId,
  Boolean isIndividualised,
  Boolean hasIndividualisedAddress,
  @Size(max = 255) @NonNull @NotBlank String identityNumber,
  @Size(max = 255) @NonNull @NotBlank String lastName,
  @Size(max = 255) @NonNull @NotBlank String firstName,
  @Size(max = 255) @NonNull @NotBlank String nickName,
  @Size(max = 255) @NonNull @NotBlank String email,
  @NonNull @NotNull Boolean permissionToPublishEmail,
  @Size(max = 255) String phoneNumber,
  @NonNull @NotNull Boolean permissionToPublishPhone,
  @Size(max = 255) String otherContactInfo,
  @NonNull @NotNull Boolean permissionToPublishOtherContactInfo,
  @Size(max = 255) String street,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 255) String country,
  @Size(max = 4096) String extraInformation,
  @NonNull @NotNull List<String> regions,
  @NonNull @NotEmpty @Valid List<ClerkQualificationCreateDTO> qualifications,
  @NonNull @NotNull Boolean isAssuranceGiven
)
  implements ClerkInterpreterDTOCommonFields {
  public ClerkInterpreterCreateDTO {
    identityNumber = StringUtil.sanitize(identityNumber);
    lastName = StringUtil.sanitize(lastName);
    firstName = StringUtil.sanitize(firstName);
    nickName = StringUtil.sanitize(nickName);
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    otherContactInfo = StringUtil.sanitize(otherContactInfo);
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
    extraInformation = StringUtil.sanitize(extraInformation);
  }
}
