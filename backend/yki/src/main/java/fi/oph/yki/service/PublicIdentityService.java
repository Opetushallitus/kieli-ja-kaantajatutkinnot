package fi.oph.yki.service;

import fi.oph.yki.model.Identity;
import fi.oph.yki.repository.IdentityRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicIdentityService {

  private final IdentityRepository identityRepository;

  @Transactional(readOnly = true)
  public Identity getIdentity(final long identityId) {
    return identityRepository.findById(identityId).orElse(null);
  }

  @Transactional
  public Identity createIdentity() {
    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());

    return identityRepository.saveAndFlush(identity);
  }
}
