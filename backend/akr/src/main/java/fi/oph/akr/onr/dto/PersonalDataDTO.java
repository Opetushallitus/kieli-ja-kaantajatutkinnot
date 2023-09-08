package fi.oph.akr.onr.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class PersonalDataDTO {

  @JsonProperty("oidHenkilo")
  private String onrId;

  @JsonProperty("sukunimi")
  private String lastName;

  @JsonProperty("etunimet")
  private String firstName;

  @JsonProperty("kutsumanimi")
  private String nickName;

  @JsonProperty("hetu")
  private String identityNumber;

  @JsonProperty("yksiloityVTJ")
  private Boolean individualised;

  @JsonProperty("yhteystiedotRyhma")
  private List<ContactDetailsGroupDTO> contactDetailsGroups;
}
