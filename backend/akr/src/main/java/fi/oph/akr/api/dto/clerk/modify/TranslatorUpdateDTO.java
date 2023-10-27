package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.util.StringUtil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record TranslatorUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  Boolean isIndividualised,
  Boolean hasIndividualisedAddress,
  @Size(max = 255) @NonNull @NotBlank String firstName,
  @Size(max = 255) @NonNull @NotBlank String lastName,
  @Size(max = 255) @NonNull @NotBlank String nickName,
  @Size(max = 255) @NonNull @NotBlank String identityNumber,
  @Size(max = 255) String email,
  @Size(max = 255) String phoneNumber,
  @Size(max = 255) String street,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 255) String country,
  @Size(max = 4096) String extraInformation,
  @NonNull @NotNull Boolean isAssuranceGiven
)
  implements TranslatorDTOCommonFields {
  public TranslatorUpdateDTO {
    identityNumber = StringUtil.sanitize(identityNumber);
    firstName = StringUtil.sanitize(firstName);
    lastName = StringUtil.sanitize(lastName);
    nickName = StringUtil.sanitize(nickName);
    email = StringUtil.sanitize(email);
    phoneNumber = StringUtil.sanitize(phoneNumber);
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
    extraInformation = StringUtil.sanitize(extraInformation);
  }
}
