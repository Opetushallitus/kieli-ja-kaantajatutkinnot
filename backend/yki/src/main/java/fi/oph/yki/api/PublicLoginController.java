package fi.oph.yki.api;

import fi.oph.yki.config.Constants;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.service.PersonService;
import fi.oph.yki.service.PublicAuthService;
import fi.oph.yki.service.PublicIdentityService;
import fi.oph.yki.service.PublicRegistrationService;
import fi.oph.yki.service.dto.OppijaLoginRedirectDTO;
import fi.oph.yki.service.dto.PersonDTO;
import fi.oph.yki.util.RegistrationUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.security.cas.authentication.CasAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/login", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicLoginController {

  @Resource
  private PublicAuthService publicAuthService;

  @Resource
  private PublicIdentityService publicIdentityService;

  @Resource
  private PublicRegistrationService publicRegistrationService;

  @Resource
  private PersonService personService;

  @Resource
  private Environment environment;

  @GetMapping(value = "/cas")
  public void loginRedirect(final HttpServletResponse httpResponse) throws IOException {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth != null) {
      httpResponse.sendRedirect("/v2");
    }
  }

  @GetMapping(value = "/registration/{examSessionId}/{registrationId}/redirect")
  public void loginOppijaRedirect(
    final HttpServletRequest httpRequest,
    final HttpServletResponse httpResponse,
    @PathVariable final Long examSessionId,
    @PathVariable final Long registrationId
  ) throws IOException {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public");
    httpRequest
      .getSession(true)
      .setAttribute(
        Constants.CAS_OPPIJA_LOGIN_REDIRECT_URL,
        RegistrationUtil.createRegistrationAuthSucessHandlerRedirectUrl(baseUrl, examSessionId, registrationId)
      );

    final String redirectUrl = publicAuthService.createCasOppijaLoginUrl(registrationId, AppLocale.FI);

    httpResponse.sendRedirect(redirectUrl);
  }

  @GetMapping(value = "/registration/{examSessionId}/{registrationId}/success")
  public void loginOppijaSuccessRedirect(
    final HttpServletRequest httpRequest,
    final HttpServletResponse httpResponse,
    final Authentication authentication,
    @PathVariable final Long examSessionId,
    @PathVariable final Long registrationId
  ) throws IOException {
    final String baseUrl = environment.getRequiredProperty("app.base-url.public-frontend");
    final HttpSession session = httpRequest.getSession();

    if (authentication instanceof final CasAuthenticationToken casToken) {
      final PersonDTO initialPersonDTO = toPersonDTO(casToken.getAssertion().getPrincipal().getAttributes());
      final PersonDTO personDTO;

      final Identity identity = publicIdentityService.getIdentityFromSession(session);
      if (initialPersonDTO.personOid() != null && !initialPersonDTO.personOid().isEmpty()) {
        personDTO = initialPersonDTO.withPersonOid("1.2.3.4.5.6");
      } else {
        personDTO = initialPersonDTO;
      }

      final Person person = personService.createOrUpdatePerson(personDTO);
      publicRegistrationService.updateRegistrationPerson(registrationId, identity, person);
      publicIdentityService.updatePerson(identity, person);
    }

    session.removeAttribute(Constants.CAS_OPPIJA_LOGIN_REDIRECT_URL);

    httpResponse.sendRedirect(
      RegistrationUtil.createRegistrationAuthSucessFrontendRedirectUrl(baseUrl, examSessionId, registrationId)
    );
  }

  private static PersonDTO toPersonDTO(final Map<String, Object> casAttributes) {
    final String sn = (String) casAttributes.get("sn");

    return PersonDTO
      .builder()
      .personOid((String) casAttributes.get("personOid"))
      .firstName((String) casAttributes.get("firstName"))
      .lastName(sn != null ? sn : (String) casAttributes.get("familyName"))
      .personIdentifier((String) casAttributes.get("personIdentifier"))
      .build();
  }
}
