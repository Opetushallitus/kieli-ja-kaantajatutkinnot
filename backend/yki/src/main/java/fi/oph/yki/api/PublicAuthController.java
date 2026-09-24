package fi.oph.yki.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/auth")
@Profile("dev")
public class PublicAuthController {

  private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

  @GetMapping(value = "/login")
  public void login(
    @RequestParam final String oid,
    final HttpServletRequest request,
    final HttpServletResponse response
  ) {
    final SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(new PreAuthenticatedAuthenticationToken(oid, null, List.of()));
    SecurityContextHolder.setContext(context);
    securityContextRepository.saveContext(context, request, response);
  }
}
