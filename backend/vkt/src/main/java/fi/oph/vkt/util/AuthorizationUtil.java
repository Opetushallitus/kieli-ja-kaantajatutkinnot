package fi.oph.vkt.util;

import org.springframework.security.core.Authentication;

public class AuthorizationUtil {

  public static boolean hasRole(final Authentication authentication, final String role) {
    return authentication
      .getAuthorities()
      .stream()
      .anyMatch((grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_" + role)));
  }
}
