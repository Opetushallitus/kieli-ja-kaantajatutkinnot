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
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/user", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private RegistrationService registrationService;

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
}
