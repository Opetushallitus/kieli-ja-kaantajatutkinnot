package fi.oph.yki.koodisto.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class KoodistoRelationDTO {

  private String koodiArvo;
  private KoodistoDTO koodisto;

  @Getter
  @Setter
  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class KoodistoDTO {

    private String koodistoUri;
  }
}
