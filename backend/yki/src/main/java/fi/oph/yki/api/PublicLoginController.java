package fi.oph.yki.api;

import fi.oph.yki.config.Constants;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.service.PublicAuthService;
import fi.oph.yki.util.AuthorizationUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
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
    httpRequest
      .getSession(true)
      .setAttribute(
        Constants.OPPIJA_LOGIN_REDIRECT,
        "/ilmoittautuminen/tutkintotilaisuus/" + examSessionId + "/" + registrationId
      );

    final String redirectUrl = publicAuthService.createCasOppijaLoginUrl(registrationId, AppLocale.FI);

    httpResponse.sendRedirect(redirectUrl);
  }
}
