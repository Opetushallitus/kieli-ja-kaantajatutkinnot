package fi.oph.akr.api.dto.clerk.modify;

import fi.oph.akr.util.StringUtil;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record TranslatorCreateDTO(
  @NonNull @NotBlank String firstName,
  @NonNull @NotBlank String lastName,
  String identityNumber,
  String email,
  String phoneNumber,
  String street,
  String postalCode,
  String town,
  String country,
  String extraInformation,
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
