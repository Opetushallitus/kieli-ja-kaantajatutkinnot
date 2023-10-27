package fi.oph.akr.onr.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContactDetailsType {
  @JsonProperty("YHTEYSTIETO_SAHKOPOSTI")
  EMAIL,

  @JsonProperty("YHTEYSTIETO_PUHELINNUMERO")
  PHONE_NUMBER,

  // Currently unused, exists for json mapping
  @JsonProperty("YHTEYSTIETO_MATKAPUHELINNUMERO")
  MOBILE_PHONE_NUMBER,

  @JsonProperty("YHTEYSTIETO_KATUOSOITE")
  STREET,

  @JsonProperty("YHTEYSTIETO_POSTINUMERO")
  POSTAL_CODE,

  @JsonProperty("YHTEYSTIETO_KAUPUNKI")
  TOWN,

  // Currently unused, exists for json mapping
  @JsonProperty("YHTEYSTIETO_KUNTA")
  MUNICIPALITY,

  @JsonProperty("YHTEYSTIETO_MAA")
  COUNTRY,
}
