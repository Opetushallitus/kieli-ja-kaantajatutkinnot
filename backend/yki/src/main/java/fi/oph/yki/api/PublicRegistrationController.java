package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicRegistrationDetailsDTO;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationSubmitResponseDTO;
import fi.oph.yki.model.Identity;
import fi.oph.yki.service.PublicIdentityService;
import fi.oph.yki.service.PublicRegistrationService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/v2/{examSessionId}/registration", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicRegistrationController {

  private final PublicRegistrationService publicRegistrationService;
  private final PublicIdentityService identityService;

  @PostMapping(path = "/init", consumes = MediaType.APPLICATION_JSON_VALUE)
  public PublicRegistrationInitResponseDTO initRegistration(
    @PathVariable final long examSessionId,
    @RequestBody @Valid final PublicRegistrationInitDTO initDTO,
    final HttpSession session
  ) {
    final Identity identity = identityService.getOrCreateIdentityFromSession(session);

    return publicRegistrationService.initRegistration(identity, initDTO);
  }

  @PostMapping(path = "/{registrationId}/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
  public PublicRegistrationSubmitResponseDTO submitRegistration(
    @PathVariable final long examSessionId,
    @PathVariable final long registrationId,
    @RequestParam final String lang,
    @RequestBody @Valid final PublicRegistrationFormDTO formDTO,
    final HttpSession session
  ) {
    final Identity identity = identityService.getIdentityFromSession(session);

    return publicRegistrationService.submitRegistration(identity, registrationId, lang, formDTO);
  }

  @GetMapping(path = "/{registrationId}")
  public PublicRegistrationDetailsDTO getRegistrationDetails(
    @PathVariable final long examSessionId,
    @PathVariable final long registrationId,
    final HttpSession session
  ) {
    final Identity identity = identityService.getIdentityFromSession(session);

    return publicRegistrationService.getRegistrationDetails(identity, registrationId);
  }
}
