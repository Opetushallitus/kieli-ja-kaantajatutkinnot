package fi.oph.yki.api;

import fi.oph.yki.api.dto.UserDTO;
import fi.oph.yki.config.Constants;
import fi.oph.yki.kayttooikeus.PermissionsService;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.oph.yki.util.AuthorizationUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/auth")
public class AuthController {

  @Value("${app.base-url.clerk}")
  private String baseUrl;

  @Resource
  private PermissionsService permissionsService;

  @GetMapping(value = "/login")
  public void loginRedirect(final HttpServletResponse httpResponse) throws IOException {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (AuthorizationUtil.hasRole(auth, Constants.APP_ADMIN_ROLE)) {
      httpResponse.sendRedirect(baseUrl + "/v2/virkailija/tutkintopaivat");
    } else {
      final KayttooikeusResponseDTO kayttooikeusResponseDTO = permissionsService.getPermissionForUser(auth.getName());
      final OrganisaatioDTO organisaatioDTO = kayttooikeusResponseDTO.organisaatiot().get(0);
      httpResponse.sendRedirect(baseUrl + "/v2/jarjestaja/" + organisaatioDTO.organisaatioOid());
    }
  }

  @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
  public UserDTO user() {
    final Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    final boolean isAdmin = AuthorizationUtil.hasRole(auth, Constants.APP_ADMIN_ROLE);
    final boolean isOrganizer = AuthorizationUtil.hasRole(auth, Constants.APP_ORGANIZER_ROLE);
    final String oid = auth.getName();

    return UserDTO.builder().oid(oid).isAdmin(isAdmin).isOrganizer(isOrganizer).build();
  }
}
