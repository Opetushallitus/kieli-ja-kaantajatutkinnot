package fi.oph.vkt.service;

import static fi.oph.vkt.payment.Crypto.CalculateHmac;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.payment.paytrail.Body;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.payment.paytrail.RedirectUrls;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import jdk.jfr.ContentType;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class PaytrailService {

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

  private Body getBody(final List<Item> itemList, final Long paymentId, final Customer customer) {
    final RedirectUrls redirectUrls = RedirectUrls
      .builder()
      .successUrl(paytrailConfig.getSuccessUrl(paymentId))
      .cancelUrl(paytrailConfig.getCancelUrl(paymentId))
      .build();

    return Body
      .builder()
      .items(itemList)
      .stamp(paymentId.toString())
      .reference(paymentId.toString())
      .amount(5000)
      .currency(PaytrailConfig.CURRENCY)
      .language("FI")
      .customer(customer)
      .redirectUrls(redirectUrls)
      .build();
  }

  public PaytrailResponseDTO createPayment(
    @NonNull final List<Item> itemList,
    final Long paymentId,
    final Customer customer
  ) {
    if (itemList.isEmpty()) {
      throw new RuntimeException("Items is required");
    }

    final ObjectMapper om = new ObjectMapper();
    final Map<String, String> headers = getHeaders();
    final Body body = getBody(itemList, paymentId, customer);
    final String secret = paytrailConfig.getSecret();

    try {
      final String bodyJson = om.writeValueAsString(body);
      final String hash = CalculateHmac(secret, headers, bodyJson);
      headers.put("signature", hash);
      final String response = paytrailWebClient
        .post()
        .uri("/payments")
        .body(BodyInserters.fromValue(bodyJson))
        .headers(httpHeaders -> headers.forEach(httpHeaders::add))
        .retrieve()
        .bodyToMono(String.class)
        .block();

      return om.readValue(response, PaytrailResponseDTO.class);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public boolean validate(Map<String, String> paymentParams) {
    final String secret = paytrailConfig.getSecret();
    final String hash = CalculateHmac(secret, paymentParams);
    final String account = paymentParams.get("checkout-account");
    final String algorithm = paymentParams.get("checkout-algorithm");
    final String signature = paymentParams.get("signature");

    if (account != null && !account.equals(paytrailConfig.getAccount())) {
      throw new RuntimeException("Account mismatch");
    }

    if (algorithm != null && !algorithm.equals(PaytrailConfig.HMAC_ALGORITHM)) {
      throw new RuntimeException("Unknown algorithm");
    }

    if (signature != null && !hash.equals(signature)) {
      throw new RuntimeException("Signature mismatch ");
    }

    return true;
  }
}
