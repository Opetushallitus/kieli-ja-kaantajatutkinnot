package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicRegistrationDetailsDTO;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitDTO;
import fi.oph.yki.api.dto.PublicRegistrationInitResponseDTO;
import fi.oph.yki.api.dto.PublicRegistrationSubmitResponseDTO;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.service.PaymentService;
import fi.oph.yki.service.PublicIdentityService;
import fi.oph.yki.service.PublicRegistrationService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/v2/examSession/{examSessionId}/registration", produces = MediaType.APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.v2.enabled", havingValue = "true")
public class PublicRegistrationController {

  private static final Logger LOG = LoggerFactory.getLogger(PublicRegistrationController.class);

  private final PublicRegistrationService publicRegistrationService;
  private final PublicIdentityService identityService;
  private final PaymentService paymentService;

  @PostMapping(path = "/init", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<PublicRegistrationInitResponseDTO> initRegistration(
    @PathVariable final long examSessionId,
    @RequestBody @Valid final PublicRegistrationInitDTO initDTO,
    final HttpSession session
  ) {
    final Identity identity = identityService.getOrCreateIdentityFromSession(session);
    final PublicRegistrationInitResponseDTO result = publicRegistrationService.initRegistration(identity, initDTO);

    if (result.error() != null) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
    }

    return ResponseEntity.ok(result);
  }

  @PostMapping(path = "/{registrationId}/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
  public PublicRegistrationSubmitResponseDTO submitRegistration(
    @PathVariable final long examSessionId,
    @PathVariable final long registrationId,
    @RequestParam final String lang,
    @RequestBody @Valid final PublicRegistrationFormDTO formDTO,
    final HttpSession session
  ) {
    final Identity identity = identityService.getIdentityFromSession(session);

    return publicRegistrationService.submitRegistration(identity, registrationId, lang, formDTO);
  }

  @GetMapping(path = "/{registrationId}")
  public PublicRegistrationDetailsDTO getRegistrationDetails(
    @PathVariable final long examSessionId,
    @PathVariable final long registrationId,
    final HttpSession session
  ) {
    final Identity identity = identityService.getIdentityFromSession(session);

    return publicRegistrationService.getRegistrationDetails(identity, registrationId);
  }

  @GetMapping(path = "/{registrationId}/payment/redirect")
  public void redirectToPayment(
    @PathVariable final long examSessionId,
    @PathVariable final long registrationId,
    @RequestParam final Optional<String> lang,
    final HttpSession session,
    final HttpServletResponse httpResponse
  ) throws IOException {
    String redirectUrl;
    try {
      final Identity identity = identityService.getIdentityFromSession(session);
      final AppLocale appLocale = AppLocale.fromString(lang.orElse(null));

      redirectUrl = paymentService.createPaymentForRegistration(registrationId, identity, appLocale);
    } catch (final APIException e) {
      if (e.getExceptionType() == APIExceptionType.REGISTRATION_ALREADY_PAID) {
        redirectUrl = paymentService.getPaymentSuccessRedirectUrl(examSessionId);
      } else {
        LOG.warn("Payment redirect failed for registration {}: {}", registrationId, e.getExceptionType());
        redirectUrl = paymentService.getPaymentErrorRedirectUrl(examSessionId);
      }
    } catch (final Exception e) {
      LOG.error("Payment redirect failed for registration {}", registrationId, e);
      redirectUrl = paymentService.getPaymentErrorRedirectUrl(examSessionId);
    }

    httpResponse.sendRedirect(redirectUrl);
  }
}
