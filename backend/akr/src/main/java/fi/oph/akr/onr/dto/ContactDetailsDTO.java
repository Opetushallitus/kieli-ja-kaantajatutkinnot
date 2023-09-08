package fi.oph.akr.onr.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactDetailsDTO {

  @JsonProperty("yhteystietoTyyppi")
  private ContactDetailsType type;

  @JsonProperty("yhteystietoArvo")
  private String value;
}
