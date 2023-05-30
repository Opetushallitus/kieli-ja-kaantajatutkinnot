package fi.oph.vkt.payment.paytrail;

import static fi.oph.vkt.payment.Crypto.calculateHmac;
import static fi.oph.vkt.payment.Crypto.collectHeaders;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.payment.PaymentProvider;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class PaytrailPaymentProvider implements PaymentProvider {

  @Value("${spring.profiles.active:}")
  private String activeProfile;

  private static final Logger LOG = LoggerFactory.getLogger(PaytrailPaymentProvider.class);

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

  private Body getBody(final List<Item> itemList, final Long paymentId, final Customer customer, final int amount) {
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

    final Body.BodyBuilder bodyBuilder = Body
      .builder()
      .items(itemList)
      .stamp(stamp)
      .reference(paymentId.toString())
      .amount(amount)
      .currency(PaytrailConfig.CURRENCY)
      .language("FI") // TODO: käyttäjän kielestä?
      .customer(customer)
      .redirectUrls(redirectUrls);

    if (activeProfile == null || !activeProfile.equals("dev")) {
      return bodyBuilder.callbackUrls(callbackUrls).build();
    }

    // localhost callback urls are not allowed
    return bodyBuilder.build();
  }

  @Override
  public PaytrailResponseDTO createPayment(
    @NonNull final List<Item> itemList,
    final Long paymentId,
    final Customer customer,
    final int amount
  ) {
    if (itemList.isEmpty()) {
      throw new RuntimeException("itemList is required");
    }

    final ObjectMapper objectMapper = new ObjectMapper();
    final Map<String, String> headers = getHeaders();
    final Body body = getBody(itemList, paymentId, customer, amount);
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
    } catch (final WebClientResponseException e) {
      LOG.error(
        "Paytrail returned error status {}\n response body: {}\n request body: {}\n paytrail headers: \n\t{}",
        e.getStatusCode().value(),
        e.getResponseBodyAsString(),
        bodyJson,
        String.join("\n\t", collectHeaders(headers))
      );
      throw new RuntimeException(e);
    } catch (final Exception e) {
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

  @Override
  public boolean validate(final Map<String, String> paymentParams) {
    final String secret = paytrailConfig.getSecret();
    final String hash = calculateHmac(secret, paymentParams, "");
    final String account = paymentParams.get("checkout-account");
    final String algorithm = paymentParams.get("checkout-algorithm");
    final String signature = paymentParams.get("signature");

    if (!hasRequiredHeaders(paymentParams)) {
      LOG.error("Paytrail missing required headers. Given headers: {}", paymentParams.keySet());
      return false;
    }

    if (!account.equals(paytrailConfig.getAccount())) {
      LOG.error("Paytrail account mismatch: response: {} != config: {}", account, paytrailConfig.getAccount());
      return false;
    }

    if (!algorithm.equals(PaytrailConfig.HMAC_ALGORITHM)) {
      LOG.error("Paytrail algorithm mismatch: response: {} != config: {}", algorithm, PaytrailConfig.HMAC_ALGORITHM);
      return false;
    }

    if (!hash.equals(signature)) {
      LOG.error("Paytrail signature mismatch: response: {} != calculated: {}", signature, hash);
      return false;
    }

    return true;
  }
}
