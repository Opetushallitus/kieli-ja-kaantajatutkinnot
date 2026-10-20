package fi.oph.yki.service;

import fi.oph.yki.model.Identity;
import fi.oph.yki.repository.IdentityRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicIdentityService {

  private static final String IDENTITY_ID_SESSION_KEY = "identityId";

  private final IdentityRepository identityRepository;

  @Transactional(readOnly = true)
  public Identity getIdentity(final long identityId) {
    return identityRepository.findById(identityId).orElse(null);
  }

  @Transactional(readOnly = true)
  public Identity getIdentityFromSession(final HttpSession session) {
    final Long existingIdentityId = (Long) session.getAttribute(IDENTITY_ID_SESSION_KEY);

    if (existingIdentityId == null) {
      throw new APIException(APIExceptionType.NO_IDENTITY_SESSION);
    }

    final Identity existing = identityRepository.findById(existingIdentityId).orElse(null);
    if (existing != null) {
      return existing;
    } else {
      throw new APIException(APIExceptionType.NO_IDENTITY_SESSION);
    }
  }

  @Transactional
  public Identity getOrCreateIdentityFromSession(final HttpSession session) {
    final Long existingIdentityId = (Long) session.getAttribute(IDENTITY_ID_SESSION_KEY);

    if (existingIdentityId != null) {
      final Identity existing = identityRepository.findById(existingIdentityId).orElse(null);
      if (existing != null) {
        return existing;
      }
    }

    final Identity identity = createIdentity();
    session.setAttribute(IDENTITY_ID_SESSION_KEY, identity.getId());

    return identity;
  }

  @Transactional
  public Identity createIdentity() {
    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());

    return identityRepository.saveAndFlush(identity);
  }
}
