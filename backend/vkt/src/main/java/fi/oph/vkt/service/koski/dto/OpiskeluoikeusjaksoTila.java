package fi.oph.vkt.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public enum OpiskeluoikeusjaksoTila {
  @JsonProperty("1")
  ACTIVE,

  @JsonProperty("2")
  OPTION,

  @JsonProperty("3")
  CONCLUDED,

  @JsonProperty("4")
  PASSIVATED,

  @JsonProperty("5")
  DISCONTINUED,
}
