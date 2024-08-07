package fi.oph.vkt.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpiskeluoikeusDTO {

  private TyyppiDTO tyyppi;
  private TilaDTO tila;
}
