package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.util.StringUtil;
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
  @NonNull @NotEmpty @Valid List<ClerkQualificationCreateDTO> qualifications
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
