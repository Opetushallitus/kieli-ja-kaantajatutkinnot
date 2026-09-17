package fi.oph.yki.service;

import fi.oph.yki.config.security.WebSecurityConfig;
import fi.oph.yki.service.dto.IdentityDTO;
import fi.oph.yki.util.StringUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PublicAuthService {

  private final String oid;

  private final String proxyToken;

  public PublicAuthService(
    @Value("${app.customer-portal.oid}") final String oid,
    @Value("${app.proxy-token}") final String proxyToken
  ) {
    this.oid = oid;
    this.proxyToken = proxyToken;
  }

  public IdentityDTO getIdentity(final HttpServletRequest request) {
    if (!oid.isEmpty()) {
      return IdentityDTO.builder().oid(oid).build();
    }

    // TODO: oid comes from the Clojure proxy header. Read it from the Java session once the citizen login is migrated.
    if (WebSecurityConfig.validateToken(request, proxyToken).isGranted()) {
      return IdentityDTO.builder().oid(StringUtil.getOidFromRequest(request)).build();
    }

    return IdentityDTO.builder().build();
  }
}
