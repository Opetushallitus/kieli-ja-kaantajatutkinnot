package fi.oph.vkt.service.onr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PersonalDataDTO {

  @JsonProperty("oidHenkilo")
  private String onrId;

  @JsonProperty("sukunimi")
  private String lastName;

  @JsonProperty("etunimet")
  private String firstName;

  @JsonProperty("kutsumanimi")
  private String nickname;
}
