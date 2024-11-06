package fi.oph.vkt.api.clerk;

import fi.oph.vkt.api.dto.clerk.ClerkUserDTO;
import fi.oph.vkt.config.Constants;
import fi.oph.vkt.util.AuthorizationUtil;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/user", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkUserController {

  @GetMapping(path = "")
  public ClerkUserDTO currentClerkUser() {
    final Authentication authn = SecurityContextHolder.getContext().getAuthentication();
    final boolean isAdmin = AuthorizationUtil.hasRole(authn, Constants.APP_ROLE);
    final boolean isExaminer = AuthorizationUtil.hasRole(authn, Constants.APP_TV_ROLE);
    final String oid = authn.getName();
    return ClerkUserDTO.builder().oid(oid).isAdmin(isAdmin).isExaminer(isExaminer).build();
  }
}
