package fi.oph.akr.api.dto.clerk;

import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkTranslatorAddressDTO(
  String street,
  String postalCode,
  String town,
  String country,
  @NonNull ContactDetailsGroupSource source,
  @NonNull ContactDetailsGroupType type,
  @NonNull Boolean selected
) {}
