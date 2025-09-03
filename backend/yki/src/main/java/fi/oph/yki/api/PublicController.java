package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.model.Person;
import fi.oph.yki.service.PublicAuthService;
import fi.oph.yki.service.koski.KoskiService;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping(value = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private PublicAuthService publicAuthService;

  @Resource
  private KoskiService koskiService;

  @GetMapping(path = "/education")
  public List<PublicEducationDTO> getEducation(@CookieValue(value = "token") final String ykiSession) {
    final Person person = publicAuthService.getPersonFromSession(ykiSession);
    final String oid = person.getOid();

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
