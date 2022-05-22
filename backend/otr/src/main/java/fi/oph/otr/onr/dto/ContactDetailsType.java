package fi.oph.otr.onr.dto;

import java.util.Set;

class ContactDetailsType {

  public static final String EMAIL = "YHTEYSTIETO_SAHKOPOSTI";

  public static final String PHONE_NUMBER = "YHTEYSTIETO_PUHELINNUMERO";

  public static final String STREET = "YHTEYSTIETO_KATUOSOITE";

  public static final String POSTAL_CODE = "YHTEYSTIETO_POSTINUMERO";

  public static final String TOWN = "YHTEYSTIETO_KUNTA";

  public static final String COUNTRY = "YHTEYSTIETO_MAA";

  public static Set<String> contactDetailsTypes = Set.of(EMAIL, PHONE_NUMBER, STREET, POSTAL_CODE, TOWN, COUNTRY);
}
