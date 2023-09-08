package fi.oph.akr.onr.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContactDetailsGroupType {
  @JsonProperty("yhteystietotyyppi1")
  KOTIOSOITE,

  @JsonProperty("yhteystietotyyppi2")
  TYO_OSOITE,

  @JsonProperty("yhteystietotyyppi3")
  VAPAA_AJAN_OSOITE,

  @JsonProperty("yhteystietotyyppi4")
  VAKINAINEN_KOTIMAAN_OSOITE,

  @JsonProperty("yhteystietotyyppi5")
  VAKINAINEN_ULKOMAAN_OSOITE,

  @JsonProperty("yhteystietotyyppi6")
  HAKEMUKSELTA_TULEVA_YHTEYSTIETO,

  @JsonProperty("yhteystietotyyppi7")
  MUU_OSOITE,

  @JsonProperty("yhteystietotyyppi8")
  SAHKOINEN_OSOITE,

  @JsonProperty("yhteystietotyyppi9")
  TILAPAINEN_KOTIMAAN_OSOITE,

  @JsonProperty("yhteystietotyyppi10")
  TILAPAINEN_ULKOMAAN_OSOITE,

  @JsonProperty("yhteystietotyyppi11")
  KOTIMAINEN_POSTIOSOITE,

  @JsonProperty("yhteystietotyyppi12")
  ULKOMAINEN_POSTIOSOITE,

  @JsonProperty("yhteystietotyyppi13")
  OTR_OSOITE,

  @JsonProperty("yhteystietotyyppi14")
  AKR_OSOITE,
}
