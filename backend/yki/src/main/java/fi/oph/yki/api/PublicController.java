package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.RegistrationService;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.util.StringUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/public", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private RegistrationService registrationService;

  @Resource
  private KoskiService koskiService;

  @PostMapping(path = "/education/{registrationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public List<PublicEducationDTO> updateEducation(
    @PathVariable final long registrationId,
    final HttpServletRequest request
  ) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      return Collections.emptyList();
    }

    final Registration registration = registrationService.findRegistration(registrationId, oid);

    try {
      return registrationService.updateEducations(registration);
    } catch (final Exception e) {
      return Collections.emptyList();
    }
  }

  @GetMapping(path = "/education")
  @ResponseStatus(HttpStatus.OK)
  public List<PublicEducationDTO> getEducations(final HttpServletRequest request) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      return Collections.emptyList();
    }

    return koskiService.getEducations(oid);
  }
}
