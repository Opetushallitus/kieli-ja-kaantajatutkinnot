package fi.oph.yki.service;

import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.service.dto.IdentityDTO;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicAuthService {

  private final Environment environment;

  @Transactional(readOnly = true)
  public IdentityDTO getPersonFromSession(final String session) {
    return IdentityDTO.builder().build();
  }

  public String createCasOppijaLoginUrl(final long targetId, final AppLocale appLocale) {
    final String casLoginUrl = environment.getRequiredProperty("cas.oppija.login-url");
    final String casServiceUrl = URLEncoder.encode(
      String.format(environment.getRequiredProperty("cas.oppija.service-url"), targetId, "queue"),
      StandardCharsets.UTF_8
    );
    return casLoginUrl + "?service=" + casServiceUrl + "&locale=" + appLocale.name().toLowerCase();
  }
}
