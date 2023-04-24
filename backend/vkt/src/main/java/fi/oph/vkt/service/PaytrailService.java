package fi.oph.vkt.service;

import static fi.oph.vkt.payment.Crypto.CalculateHmac;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.payment.Item;
import fi.oph.vkt.payment.paytrail.Body;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class PaytrailService {

  private final Environment environment;
  private final WebClient webClient;

  private Map<String, String> getHeaders() {
    Map<String, String> headers = new LinkedHashMap<>();
    headers.put("checkout-account", "375917");
    headers.put("checkout-algorithm", "sha256");
    headers.put("checkout-method", "POST");
    headers.put("checkout-nonce", "564635208570151");
    headers.put("checkout-timestamp", "2018-07-06T10:01:31.904Z");

    return headers;
  }

  private Body getBody(List<Item> itemList) {
    return Body.builder().items(itemList).build();
  }

  public boolean createPayment(List<Item> itemList) {
    final ObjectMapper om = new ObjectMapper();
    final Map<String, String> headers = getHeaders();
    final Body body = getBody(itemList);
    final String secret = environment.getRequiredProperty("app.payment.paytrail.secret");

    try {
      final String bodyJson = om.writeValueAsString(body);
      final String hash = CalculateHmac(secret, headers, bodyJson);
      headers.put("signature", hash);
      final URI uri = new URI(environment.getRequiredProperty("app.payment.paytrail.url"));
      final String response = webClient
        .post()
        .uri(uri)
        .body(BodyInserters.fromValue(bodyJson))
        .headers(httpHeaders -> headers.forEach(httpHeaders::add))
        .retrieve()
        .bodyToMono(String.class)
        .block();

      return response != null && !response.isEmpty();
    } catch (Exception e) {
      return false;
    }
  }
}