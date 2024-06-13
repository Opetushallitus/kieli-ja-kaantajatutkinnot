package fi.oph.vkt.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpiskelujaksoDTO {

  private String alku;
  private OpiskelujaksoTilaDTO tila;
}
