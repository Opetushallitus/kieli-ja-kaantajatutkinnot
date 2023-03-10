package fi.oph.otr.api.dto.clerk.modify;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTOCommonFields;
import fi.oph.otr.util.StringUtil;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkInterpreterUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotNull Boolean isIndividualised,
  @NonNull @NotNull Boolean hasIndividualisedAddress,
  @NonNull @NotBlank String identityNumber,
  @NonNull @NotBlank String lastName,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String nickName,
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
  @NonNull @NotNull List<String> regions
)
  implements ClerkInterpreterDTOCommonFields {
  public ClerkInterpreterUpdateDTO {
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
