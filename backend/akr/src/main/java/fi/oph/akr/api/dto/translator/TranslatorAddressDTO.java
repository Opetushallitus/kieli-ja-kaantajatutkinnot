package fi.oph.akr.api.dto.translator;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record TranslatorAddressDTO(
  String street,
  String postalCode,
  String town,
  String country,
  @NonNull ContactDetailsGroupSource source,
  @NonNull ContactDetailsGroupType type
)
  implements CommonTranslatorAddressDTO {
  public TranslatorAddressDTO(final ClerkTranslatorAddressDTO address) {
    this(address.street(), address.postalCode(), address.town(), address.country(), address.source(), address.type());
  }
}
