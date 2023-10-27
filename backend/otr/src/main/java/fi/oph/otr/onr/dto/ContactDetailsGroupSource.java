package fi.oph.otr.onr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public enum ContactDetailsGroupSource {
  @JsonProperty("alkupera1")
  VTJ,

  @JsonProperty("alkupera2")
  VIRKAILIJAN_UI,

  @JsonProperty("alkupera3")
  OMAT_TIEDOT_UI,

  @JsonProperty("alkupera4")
  HAKU_LOMAKE,

  @JsonProperty("alkupera5")
  TIEDON_SIIRROT,

  @JsonProperty("alkupera6")
  MUU_ALKUPERA,

  @JsonProperty("alkupera7")
  OTR,

  @JsonProperty("alkupera8")
  AKR,
}
