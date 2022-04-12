package fi.oph.akt.util;

import java.util.Collection;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

public class SchedulingUtil {

  private static final String USERNAME = "scheduler";
  private static final String ROLE = "ROLE_USER";

  public static void runWithScheduledUser(final Runnable task) {
    try {
      final Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(USERNAME);
      final Authentication authentication = new UsernamePasswordAuthenticationToken(USERNAME, ROLE, authorities);
      SecurityContextHolder.getContext().setAuthentication(authentication);
      task.run();
    } finally {
      SecurityContextHolder.getContext().setAuthentication(null);
    }
  }
}
