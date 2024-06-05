package fi.oph.vkt.service.koski.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class KoskiResponseDTO {

  private List<OpiskeluoikeusDTO> opiskeluoikeudet;
}
