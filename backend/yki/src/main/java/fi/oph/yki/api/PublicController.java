package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationAndFreeRegistrationsCountDTO;
import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.api.dto.PublicEducationUpdateDTO;
import fi.oph.yki.api.dto.PublicFreeRegistrationDTO;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.RegistrationService;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/public", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private RegistrationService registrationService;

  @Resource
  private KoskiService koskiService;

  // TODO remove me: deploy commit
  @PostMapping(
    path = "/education/{registrationId:\\d+}",
    consumes = MediaType.APPLICATION_JSON_VALUE,
    produces = MediaType.APPLICATION_JSON_VALUE
  )
  @ResponseStatus(HttpStatus.CREATED)
  public PublicFreeRegistrationDTO updateEducation(
    @PathVariable final long registrationId,
    final HttpServletRequest request,
    @RequestBody @Valid final PublicEducationUpdateDTO educationUpdateDTO
  ) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      throw new APIException(APIExceptionType.SESSION_OID_NOT_FOUND);
    }

    final Registration registration = registrationService.findRegistration(registrationId, oid);

    // Enforce max 3 free registrations for user
    if (!registrationService.hasFreeRegistrationsLeft(oid)) {
      throw new APIException(APIExceptionType.FREE_REGISTRATIONS_EXHAUSTED);
    }

    return registrationService.updateFreeRegistration(registration, educationUpdateDTO);
  }

  @GetMapping(path = "/education")
  @ResponseStatus(HttpStatus.OK)
  public PublicEducationAndFreeRegistrationsCountDTO getEducations(final HttpServletRequest request) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      throw new APIException(APIExceptionType.SESSION_OID_NOT_FOUND);
    }

    List<PublicEducationDTO> educations = koskiService.getEducations(oid);
    int usedFreeRegistrations = registrationService.getUsedFreeRegistrations(oid);

    return PublicEducationAndFreeRegistrationsCountDTO
      .builder()
      .educations(educations)
      .usedFreeRegistrations(usedFreeRegistrations)
      .build();
  }
}
