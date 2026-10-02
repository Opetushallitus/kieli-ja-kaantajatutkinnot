package fi.oph.yki.service;

import fi.oph.yki.model.LoginLink;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.LoginLinkType;
import fi.oph.yki.repository.LoginLinkRepository;
import fi.oph.yki.util.StringUtil;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LoginLinkService {

  private static final int USER_PORTAL_LINK_TTL_DAYS = 15;

  private final LoginLinkRepository loginLinkRepository;
  private final Environment environment;

  public String createUserPortalLink(final Participant participant, final Registration registration) {
    return createLoginLink(
      participant,
      registration,
      LoginLinkType.PERSON,
      environment.getRequiredProperty("app.user-portal.success-url"),
      environment.getRequiredProperty("app.user-portal.expired-url"),
      LocalDateTime.now().plusDays(USER_PORTAL_LINK_TTL_DAYS)
    );
  }

  /**
   * A link that takes the participant to the payment of their registration, valid for as long as
   * the registration itself. Both redirects point into the legacy backend, which still owns the
   * payment flow and redeems these links; like legacy, the link is not tied to an exam session.
   */
  public String createPaymentLink(final Participant participant, final Registration registration, final String lang) {
    final String publicBaseUrl = environment.getRequiredProperty("app.base-url.public");

    return createLoginLink(
      participant,
      registration,
      LoginLinkType.PAYMENT,
      publicBaseUrl + "/api/payment/v3/" + registration.getId() + "/redirect?lang=" + lang,
      publicBaseUrl + "/ilmoittautuminen/maksu/vanhentunut",
      registration.getExpiresAt()
    );
  }

  private String createLoginLink(
    final Participant participant,
    final Registration registration,
    final LoginLinkType type,
    final String successRedirect,
    final String expiredLinkRedirect,
    final LocalDateTime expiresAt
  ) {
    final String code = UUID.randomUUID().toString();

    final LoginLink loginLink = new LoginLink();
    loginLink.setCode(StringUtil.sha256hex(code));
    loginLink.setParticipant(participant);
    loginLink.setRegistration(registration);
    loginLink.setType(type);
    loginLink.setSuccessRedirect(successRedirect);
    loginLink.setExpiredLinkRedirect(expiredLinkRedirect);
    loginLink.setExpiresAt(expiresAt);

    loginLinkRepository.save(loginLink);

    return environment.getRequiredProperty("app.base-url.public") + "/auth/login?code=" + code;
  }
}
