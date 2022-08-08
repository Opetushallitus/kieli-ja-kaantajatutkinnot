package fi.oph.otr.api.clerk;

import fi.oph.otr.api.dto.clerk.ClerkUserDTO;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/user", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkUserController {

  @GetMapping(path = "")
  public ClerkUserDTO currentClerkUser() {
    final String oid = SecurityContextHolder.getContext().getAuthentication().getName();
    return ClerkUserDTO.builder().oid(oid).build();
  }
}
