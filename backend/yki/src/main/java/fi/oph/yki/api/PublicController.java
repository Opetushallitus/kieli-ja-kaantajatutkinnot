package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationAndFreeRegistrationsCountDTO;
import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.api.dto.PublicFreeRegistrationDTO;
import fi.oph.yki.api.dto.PublicUsedFreeRegistrationsCountsDTO;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.RegistrationService;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
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
  public PublicFreeRegistrationDTO updateEducation(
    @PathVariable final long registrationId,
    final HttpServletRequest request
  ) {
    // TODO Accept KoskiEducation | UserDeclaredEducation in request body
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      throw new APIException(APIExceptionType.SESSION_OID_NOT_FOUND);
    }

    final Registration registration = registrationService.findRegistration(registrationId, oid);
    // TODO Enforce max 3 FreeRegistrations per language per user
    return registrationService.updateFreeRegistration(registration);
  }

  @GetMapping(path = "/education")
  @ResponseStatus(HttpStatus.OK)
  public PublicEducationAndFreeRegistrationsCountDTO getEducations(final HttpServletRequest request) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      throw new RuntimeException("OID null or empty");
    }

    List<PublicEducationDTO> educations = koskiService.getEducations(oid);
    PublicUsedFreeRegistrationsCountsDTO usedFreeRegistrationsCounts = registrationService.getUsedFreeRegistrationsCounts(
      oid
    );

    return PublicEducationAndFreeRegistrationsCountDTO
      .builder()
      .educations(educations)
      .usedFreeRegistrations(usedFreeRegistrationsCounts)
      .build();
  }
}
