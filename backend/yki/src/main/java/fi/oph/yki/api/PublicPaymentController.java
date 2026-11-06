package fi.oph.yki.api;

import fi.oph.yki.service.PaymentService;
import fi.oph.yki.util.exception.APIException;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/v2/payment", produces = MediaType.APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.v2.enabled", havingValue = "true")
public class PublicPaymentController {

  private static final Logger LOG = LoggerFactory.getLogger(PublicPaymentController.class);

  private final PaymentService paymentService;

  @GetMapping(path = "/payment/{paymentId:\\d+}/success")
  public void paymentSuccess(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    handleFinalizePayment(
      paymentId,
      paymentParams,
      callback,
      httpResponse,
      paymentService::getFinalizePaymentSuccessRedirectUrl
    );
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/cancel")
  public void paymentCancel(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    handleFinalizePayment(
      paymentId,
      paymentParams,
      callback,
      httpResponse,
      paymentService::getFinalizePaymentCancelRedirectUrl
    );
  }

  private void handleFinalizePayment(
    final Long paymentId,
    final Map<String, String> paymentParams,
    final Optional<Boolean> callback,
    final HttpServletResponse httpResponse,
    final Function<Long, String> getRedirectUrlFunction
  ) throws IOException {
    final boolean isCallback = callback.orElse(false);

    try {
      paymentService.finalizePayment(paymentId, paymentParams);

      if (isCallback) {
        httpResponse.setStatus(HttpStatus.OK.value());
      } else {
        httpResponse.sendRedirect(getRedirectUrlFunction.apply(paymentId));
      }
    } catch (final APIException e) {
      LOG.warn("Finalizing payment {} failed: {}", paymentId, e.getExceptionType());
      if (isCallback) {
        httpResponse.setStatus(HttpStatus.BAD_REQUEST.value());
      } else {
        httpResponse.sendRedirect(paymentService.getFinalizePaymentErrorRedirectUrl(paymentId));
      }
    } catch (final Exception e) {
      LOG.error("Finalizing payment {} failed", paymentId, e);
      if (isCallback) {
        httpResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
      } else {
        httpResponse.sendRedirect(paymentService.getFinalizePaymentErrorRedirectUrl(paymentId));
      }
    }
  }
}
