package fi.oph.yki.service;

import fi.oph.yki.service.dto.IdentityDTO;
import org.springframework.transaction.annotation.Transactional;

public class PublicAuthService {

  @Transactional(readOnly = true)
  public IdentityDTO getPersonFromSession(final String session) {
    return IdentityDTO.builder().build();
  }
}
