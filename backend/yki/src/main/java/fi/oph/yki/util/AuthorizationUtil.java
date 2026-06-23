package fi.oph.yki.util;

import org.springframework.security.core.Authentication;

public class AuthorizationUtil {

  public static boolean hasRole(final Authentication auth, final String role) {
    return auth
      .getAuthorities()
      .stream()
      .anyMatch((grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_" + role)));
  }
}
