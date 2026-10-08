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
    final String code = UUID.randomUUID().toString();

    final LoginLink loginLink = new LoginLink();
    loginLink.setCode(StringUtil.sha256hex(code));
    loginLink.setParticipant(participant);
    loginLink.setRegistration(registration);
    loginLink.setType(LoginLinkType.PERSON);
    loginLink.setSuccessRedirect(environment.getRequiredProperty("app.user-portal.success-url"));
    loginLink.setExpiredLinkRedirect(environment.getRequiredProperty("app.user-portal.expired-url"));
    loginLink.setExpiresAt(LocalDateTime.now().plusDays(USER_PORTAL_LINK_TTL_DAYS));

    loginLinkRepository.save(loginLink);

    return environment.getRequiredProperty("app.base-url.public") + "/auth/login?code=" + code;
  }
}
