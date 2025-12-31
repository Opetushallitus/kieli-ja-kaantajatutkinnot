package fi.oph.yki.onr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class PersonalDataDTO {

  @JsonProperty("oidHenkilo")
  private String oidHenkilo;

  @JsonProperty("hetu")
  private String identityNumber;
}
