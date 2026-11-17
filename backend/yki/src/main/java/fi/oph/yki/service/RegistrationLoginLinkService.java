package fi.oph.yki.service;

import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationLoginLink;
import fi.oph.yki.repository.RegistrationLoginLinkRepository;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.UUIDSource;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class RegistrationLoginLinkService {

  private static final int RECENT_LINK_MINUTES = 5;

  private final RegistrationLoginLinkRepository registrationLoginLinkRepository;
  private final UUIDSource uuidSource;

  /**
   * Stores only the hash of the code, as in login_link. Returns the plain code. As in legacy, the
   * link is valid for the current day and the next full day.
   */
  @Transactional
  public String createLoginLink(final Registration registration, final Identity identity, final String email) {
    final String code = uuidSource.getRandomNonce();

    final RegistrationLoginLink loginLink = new RegistrationLoginLink();
    loginLink.setCode(StringUtil.sha256hex(code));
    loginLink.setEmail(email);
    loginLink.setIdentity(identity);
    loginLink.setRegistration(registration);
    loginLink.setExpiresAt(LocalDate.now().plusDays(2).atStartOfDay());
    registrationLoginLinkRepository.save(loginLink);

    return code;
  }

  /**
   * As in legacy, a link sent to the same address in the last few minutes stops another email, so
   * repeated clicks do not flood the email service.
   */
  @Transactional(readOnly = true)
  public boolean hasRecentLoginLink(final Registration registration, final String email) {
    return registrationLoginLinkRepository.existsByRegistrationIdAndEmailAndCreatedAtAfter(
      registration.getId(),
      email,
      LocalDateTime.now().minusMinutes(RECENT_LINK_MINUTES)
    );
  }

  @Transactional(readOnly = true)
  public RegistrationLoginLink getActiveLoginLink(final String code) {
    final RegistrationLoginLink loginLink = registrationLoginLinkRepository
      .findByCode(StringUtil.sha256hex(code))
      .orElseThrow(() -> new APIException(APIExceptionType.LOGIN_LINK_NOT_FOUND));

    if (loginLink.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new APIException(APIExceptionType.LOGIN_LINK_EXPIRED);
    }

    return loginLink;
  }
}
