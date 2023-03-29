package fi.oph.vkt.audit;

import fi.vm.sade.auditlog.User;
import fi.vm.sade.javautils.http.HttpServletRequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Optional;
import org.ietf.jgss.GSSException;
import org.ietf.jgss.Oid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class AuditUtil {

  public static User getUser() {
    final RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

    if (requestAttributes instanceof ServletRequestAttributes) {
      HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
      return getUser(request);
    }
    return getUserOnlyWithIp();
  }

  private static User getUser(final HttpServletRequest request) {
    final InetAddress inetAddress = getInetAddress(request);
    final String session = request.getSession().getId();
    final String userAgent = request.getHeader("User-Agent");
    return getOptionalOid()
      .map(oid -> new User(oid, inetAddress, session, userAgent))
      .orElseGet(() -> new User(inetAddress, session, userAgent));
  }

  private static InetAddress getInetAddress(final HttpServletRequest request) {
    final String remoteAddress = HttpServletRequestUtils.getRemoteAddress(
      request.getHeader("X-Real-IP"),
      request.getHeader("X-Forwarded-For"),
      request.getRemoteAddr(),
      request.getRequestURI()
    );
    try {
      return InetAddress.getByName(remoteAddress);
    } catch (UnknownHostException e) {
      throw new RuntimeException(e);
    }
  }

  private static Optional<Oid> getOptionalOid() {
    return Optional
      .ofNullable(SecurityContextHolder.getContext().getAuthentication())
      .filter(Authentication::isAuthenticated)
      .flatMap(authentication -> Optional.ofNullable(authentication.getName()))
      .map(oid -> {
        try {
          return new Oid(oid);
        } catch (GSSException e) {
          throw new RuntimeException(e);
        }
      });
  }

  public static User getUserOnlyWithIp() {
    return new User(getIp(), null, null);
  }

  private static InetAddress getIp() {
    try {
      return InetAddress.getLocalHost();
    } catch (UnknownHostException e) {
      return InetAddress.getLoopbackAddress();
    }
  }
}
