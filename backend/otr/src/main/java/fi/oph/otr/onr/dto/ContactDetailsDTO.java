package fi.oph.otr.onr.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class ContactDetailsDTO {

  @JsonProperty("yhteystietoTyyppi")
  private ContactDetailsType type;

  @JsonProperty("yhteystietoArvo")
  private String value;
}
