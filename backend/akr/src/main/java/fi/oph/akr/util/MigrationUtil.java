package fi.oph.akr.util;

import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.model.PersonalData;

// Temporary code until the AKR dabase is not fully migrated into the new one
public class MigrationUtil {

  public static final String NO_VALID_IDENTITY_NUMBER_MARK = "ei oikeata hetua";

  public static String getMockedIdentiyNumberIfNotCorrect(final String identityNumber) {
    if (identityNumber.length() < 11) { // either new form 130711A933Y or old form 301171-960H
      return NO_VALID_IDENTITY_NUMBER_MARK;
    }
    return identityNumber;
  }

  public static PersonalData get(final PersonalData personalData, final Translator translator) {
    if (personalData != null) {
      return personalData;
    }

    return PersonalData
      .builder()
      .individualised(false)
      .hasIndividualisedAddress(false)
      .firstName(translator.getFirstName())
      .lastName(translator.getLastName())
      .nickName(translator.getFirstName())
      .identityNumber(translator.getIdentityNumber() == null ? "ei tiedossa" : translator.getIdentityNumber())
      .email(translator.getEmail())
      .phoneNumber(translator.getPhone())
      .street(translator.getStreet())
      .postalCode(translator.getPostalCode())
      .town(translator.getTown())
      .country(translator.getCountry())
      .build();
  }
}
