package fi.oph.otr.onr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContactDetailsGroupDTO {

  @JsonProperty("ryhmaKuvaus")
  private ContactDetailsGroupType type;

  @JsonProperty("ryhmaAlkuperaTieto")
  private ContactDetailsGroupSource source;

  @JsonProperty("yhteystieto")
  public Set<ContactDetailsDTO> contactDetailsSet;
}
