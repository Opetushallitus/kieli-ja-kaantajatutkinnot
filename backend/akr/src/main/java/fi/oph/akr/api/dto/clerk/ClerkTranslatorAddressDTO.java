package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.api.dto.translator.CommonTranslatorAddressDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.util.StringUtil;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorAddressDTO(
  @Size(max = 255) String street,
  @Size(max = 255) String postalCode,
  @Size(max = 255) String town,
  @Size(max = 255) String country,
  @NonNull ContactDetailsGroupSource source,
  @NonNull ContactDetailsGroupType type,
  @NonNull Boolean selected,
  Boolean autoSelected
)
  implements CommonTranslatorAddressDTO {
  public ClerkTranslatorAddressDTO {
    street = StringUtil.sanitize(street);
    postalCode = StringUtil.sanitize(postalCode);
    town = StringUtil.sanitize(town);
    country = StringUtil.sanitize(country);
  }
}
