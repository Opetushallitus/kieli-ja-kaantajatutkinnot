package fi.oph.yki.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class KoskiResponseDTO {

  @JsonProperty("henkilö")
  private HenkiloDTO henkilo;

  private List<OpiskeluoikeusDTO> opiskeluoikeudet;
}
