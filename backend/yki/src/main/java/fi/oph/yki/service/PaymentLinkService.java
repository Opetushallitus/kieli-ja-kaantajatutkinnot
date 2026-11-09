package fi.oph.yki.service;

import fi.oph.yki.model.Identity;
import fi.oph.yki.model.PaymentLink;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.PaymentLinkRepository;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.UUIDSource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PaymentLinkService {

  private final PaymentLinkRepository paymentLinkRepository;
  private final UUIDSource uuidSource;

  /**
   * Stores only the hash of the code, as in login_link. Returns the plain code.
   */
  @Transactional
  public String createPaymentLink(final Registration registration, final Identity identity) {
    final String code = uuidSource.getRandomNonce();

    final PaymentLink paymentLink = new PaymentLink();
    paymentLink.setCode(StringUtil.sha256hex(code));
    paymentLink.setIdentity(identity);
    paymentLink.setRegistration(registration);
    paymentLink.setExpiresAt(registration.getExpiresAt());
    paymentLinkRepository.save(paymentLink);

    return code;
  }
}
