package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.util.StringUtil;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record TranslatorUpdateDTO(
  @NonNull @NotNull Long id,
  @NonNull @NotNull Integer version,
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  @Size(max = 255) String identityNumber,
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
    firstName = StringUtil.trim(firstName);
    lastName = StringUtil.trim(lastName);
    identityNumber = StringUtil.trim(identityNumber);
    email = StringUtil.trim(email);
    phoneNumber = StringUtil.trim(phoneNumber);
    street = StringUtil.trim(street);
    postalCode = StringUtil.trim(postalCode);
    town = StringUtil.trim(town);
    country = StringUtil.trim(country);
    extraInformation = StringUtil.trim(extraInformation);
  }
}
