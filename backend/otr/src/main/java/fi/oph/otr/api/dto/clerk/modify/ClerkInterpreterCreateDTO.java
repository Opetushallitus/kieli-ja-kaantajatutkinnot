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
  @Size(max = 8) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 64) String country,
  @Size(max = 4096) String extraInformation,
  @NonNull @NotNull List<String> regions,
  @NonNull @NotEmpty @Valid List<ClerkQualificationCreateDTO> qualifications
)
  implements ClerkInterpreterDTOCommonFields {
  public ClerkInterpreterCreateDTO {
    identityNumber = StringUtil.trim(identityNumber);
    lastName = StringUtil.trim(lastName);
    firstName = StringUtil.trim(firstName);
    nickName = StringUtil.trim(nickName);
    email = StringUtil.trim(email);
    phoneNumber = StringUtil.trim(phoneNumber);
    otherContactInfo = StringUtil.trim(otherContactInfo);
    street = StringUtil.trim(street);
    postalCode = StringUtil.trim(postalCode);
    town = StringUtil.trim(town);
    country = StringUtil.trim(country);
    extraInformation = StringUtil.trim(extraInformation);
  }
}
