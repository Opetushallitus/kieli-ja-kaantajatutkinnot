package fi.oph.yki.service;

import fi.oph.yki.service.dto.IdentityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicAuthService {

  @Transactional(readOnly = true)
  public IdentityDTO getPersonFromSession(final String session) {
    return IdentityDTO.builder().build();
  }
}
