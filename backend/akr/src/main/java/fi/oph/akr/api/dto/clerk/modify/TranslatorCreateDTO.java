package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.util.StringUtil;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record TranslatorCreateDTO(
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
  @NonNull @NotNull Boolean isAssuranceGiven,
  @NonNull @NotEmpty List<AuthorisationCreateDTO> authorisations
)
  implements TranslatorDTOCommonFields {
  public TranslatorCreateDTO {
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
