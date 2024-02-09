package fi.oph.akr.api.dto.translator;

import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;

public interface CommonTranslatorAddressDTO {
  String street();
  String postalCode();
  String town();
  String country();
  ContactDetailsGroupSource source();
  ContactDetailsGroupType type();
}
