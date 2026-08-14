package fi.oph.yki.solki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PersonSyncRequestDTO(
  @JsonProperty("sukunimi") String lastName,
  @JsonProperty("etunimet") String firstName,
  @JsonProperty("sukupuoli") String gender,
  @JsonProperty("kansalaisuus") String nationalityCode,
  @JsonProperty("maa") String countryCode,
  @JsonProperty("katuosoite") String streetAddress,
  @JsonProperty("postinumero") String zip,
  @JsonProperty("postitoimipaikka") String postOffice,
  @JsonProperty("sahkoposti") String email
) {}
