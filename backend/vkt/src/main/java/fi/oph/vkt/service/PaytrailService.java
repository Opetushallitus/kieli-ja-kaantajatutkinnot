package fi.oph.vkt.service;

import static fi.oph.vkt.payment.Crypto.calculateHmac;
import static fi.oph.vkt.payment.Crypto.collectHeaders;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.payment.PaymentProvider;
import fi.oph.vkt.payment.paytrail.Body;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.payment.paytrail.RedirectUrls;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PaytrailService implements PaymentProvider {

  @Value("${spring.profiles.active:}")
  private String activeProfile;

  private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);

  private final WebClient paytrailWebClient;
  private final PaytrailConfig paytrailConfig;

  private Map<String, String> getHeaders() {
    final Map<String, String> headers = new LinkedHashMap<>();

    headers.put("checkout-account", paytrailConfig.getAccount());
    headers.put("checkout-algorithm", PaytrailConfig.HMAC_ALGORITHM);
    headers.put("checkout-method", "POST");
    headers.put("checkout-nonce", paytrailConfig.getRandomNonce());
    headers.put("checkout-timestamp", paytrailConfig.getTimestamp());
    headers.put("content-type", "application/json; charset=utf-8");

    return headers;
  }

  private Body getBody(final List<Item> itemList, final Long paymentId, final Customer customer, final int total) {
    final String stamp = paymentId.toString() + "-" + paytrailConfig.getRandomNonce();
    final RedirectUrls redirectUrls = RedirectUrls
      .builder()
      .success(paytrailConfig.getSuccessUrl(paymentId))
      .cancel(paytrailConfig.getCancelUrl(paymentId))
      .build();
    final RedirectUrls callbackUrls = RedirectUrls
      .builder()
      .success(paytrailConfig.getSuccessUrl(paymentId) + "?callback=true")
      .cancel(paytrailConfig.getCancelUrl(paymentId) + "?callback=true")
      .build();

    final Body.BodyBuilder bodyBuilder = Body.builder();

    bodyBuilder
      .items(itemList)
      .stamp(stamp)
      .reference(paymentId.toString())
      .amount(total)
      .currency(PaytrailConfig.CURRENCY)
      .language("FI") // TODO: käyttäjän kielestä?
      .customer(customer)
      .redirectUrls(redirectUrls);

    // localhost callback url's are not allowed
    if (activeProfile == null || !activeProfile.equals("dev")) {
      bodyBuilder.callbackUrls(callbackUrls);
    }

    return bodyBuilder.build();
  }

  public PaytrailResponseDTO createPayment(
    @NonNull final List<Item> itemList,
    final Long paymentId,
    final Customer customer,
    final int total
  ) {
    if (itemList.isEmpty()) {
      throw new RuntimeException("itemList is required");
    }

    final ObjectMapper objectMapper = new ObjectMapper();
    final Map<String, String> headers = getHeaders();
    final Body body = getBody(itemList, paymentId, customer, total);
    final String secret = paytrailConfig.getSecret();

    String bodyJson = null;
    try {
      bodyJson = objectMapper.writeValueAsString(body);
      final String hash = calculateHmac(secret, headers, bodyJson);
      headers.put("signature", hash);
      final String response = paytrailWebClient
        .post()
        .uri("/payments")
        .body(BodyInserters.fromValue(bodyJson))
        .headers(httpHeaders -> headers.forEach(httpHeaders::add))
        .exchangeToMono(clientResponse -> {
          if (clientResponse.statusCode().isError()) {
            return clientResponse.createException().flatMap(Mono::error);
          }
          return clientResponse.bodyToMono(String.class);
        })
        .block();

      return objectMapper.readValue(response, PaytrailResponseDTO.class);
    } catch (WebClientResponseException e) {
      LOG.error(
        "Paytrail returned error status {}\n response body: {}\n request body: {}\n paytrail headers: \n\t{}",
        e.getStatusCode().value(),
        e.getResponseBodyAsString(),
        bodyJson,
        String.join("\n\t", collectHeaders(headers))
      );
      throw new RuntimeException(e);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private boolean hasRequiredHeaders(final Map<String, String> paymentParams) {
    return (
      paymentParams.get("checkout-account") != null &&
      paymentParams.get("checkout-algorithm") != null &&
      paymentParams.get("signature") != null &&
      paymentParams.get("checkout-status") != null &&
      paymentParams.get("checkout-transaction-id") != null
    );
  }

  public boolean validate(final Map<String, String> paymentParams) {
    final String secret = paytrailConfig.getSecret();
    final String hash = calculateHmac(secret, paymentParams, "");
    final String account = paymentParams.get("checkout-account");
    final String algorithm = paymentParams.get("checkout-algorithm");
    final String signature = paymentParams.get("signature");

    if (!hasRequiredHeaders(paymentParams)) {
      LOG.error("Paytrail missing required headers. Given headers: {}", paymentParams);
      throw new RuntimeException("Invalid headers");
    }

    if (!account.equals(paytrailConfig.getAccount())) {
      LOG.error("Paytrail account mismatch: response: {} != config: {}", account, paytrailConfig.getAccount());
      throw new RuntimeException("Account mismatch");
    }

    if (!algorithm.equals(PaytrailConfig.HMAC_ALGORITHM)) {
      LOG.error("Paytrail algorithm mismatch: response: {} != config: {}", algorithm, PaytrailConfig.HMAC_ALGORITHM);
      throw new RuntimeException("Unknown algorithm");
    }

    if (!hash.equals(signature)) {
      LOG.error("Paytrail signature mismatch: response: {} != calculated: {}", signature, hash);
      throw new RuntimeException("Signature mismatch");
    }

    return true;
  }
}
