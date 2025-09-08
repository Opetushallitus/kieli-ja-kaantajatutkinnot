package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.service.koski.KoskiService;
import jakarta.annotation.Resource;
import java.util.Collections;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/proxy", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private KoskiService koskiService;

  @GetMapping(path = "/education")
  public List<PublicEducationDTO> getEducation(final String oid) {
    if (oid == null || oid.isEmpty()) {
      return Collections.emptyList();
    }

    try {
      return koskiService.findEducations(oid);
    } catch (final Exception e) {
      return Collections.emptyList();
    }
  }
}
