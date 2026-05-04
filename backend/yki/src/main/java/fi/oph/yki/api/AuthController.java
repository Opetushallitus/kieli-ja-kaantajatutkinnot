package fi.oph.yki.api;

import fi.oph.yki.api.dto.UserDTO;
import fi.oph.yki.config.Constants;
import fi.oph.yki.util.AuthorizationUtil;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/auth")
public class AuthController {

  @GetMapping(value = "/login/cas", produces = MediaType.TEXT_HTML_VALUE)
  @ResponseBody
  public void index(final HttpServletResponse httpResponse) throws IOException {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (AuthorizationUtil.hasRole(auth, Constants.APP_ADMIN_ROLE)) {
      httpResponse.sendRedirect("http://localhost:4004/yki/v2/virkailija/tutkintopaivat");
    } else {
      httpResponse.sendRedirect("http://localhost:4004/yki/v2/jarjestaja");
    }
  }

  @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public UserDTO user() {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    final boolean isAdmin = AuthorizationUtil.hasRole(auth, Constants.APP_ADMIN_ROLE);
    final boolean isOrganizer = AuthorizationUtil.hasRole(auth, Constants.APP_ORGANIZER_ROLE);
    final String oid = auth.getName();

    return UserDTO.builder().oid(oid).isAdmin(isAdmin).isOrganizer(isOrganizer).build();
  }
}
