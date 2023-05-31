package fi.oph.vkt.payment.paytrail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@WithMockUser
@DataJpaTest
public class PaytrailPaymentProviderTest {

  @Value("classpath:payment/paytrail-response.json")
  private org.springframework.core.io.Resource paytrailMockResponse;

  @Value("classpath:payment/paytrail-request.json")
  private org.springframework.core.io.Resource paytrailMockRequest;

  @Value("classpath:payment/paytrail-response-fail.json")
  private org.springframework.core.io.Resource paytrailMockFailResponse;

  @Test
  public void testPaytrailCreatePayment() throws IOException, InterruptedException {
    final MockWebServer mockWebServer = new MockWebServer();
    mockWebServer.start();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(getMockJsonResponse())
    );

    final String baseUrl = String.format("http://localhost:%s", mockWebServer.getPort());
    final WebClient webClient = WebClient.builder().baseUrl(baseUrl).build();

    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getRandomNonce()).thenReturn("54321-54312");
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn("123456");
    when(paytrailConfig.getTimestamp()).thenReturn("2018-07-06T10:01:31.904Z");
    when(paytrailConfig.getSuccessUrl(1L)).thenReturn("http://localhost/sucess");
    when(paytrailConfig.getCancelUrl(1L)).thenReturn("http://localhost/cancel");

    final Customer customer = Customer.builder().email("testinen@test.invalid").build();
    final Item item1 = getItem("foo");
    final Item item2 = getItem("bar");
    final List<Item> itemList = Arrays.asList(item1, item2);
    final PaytrailPaymentProvider paymentProvider = new PaytrailPaymentProvider(webClient, paytrailConfig);
    assertNotNull(paymentProvider.createPayment(itemList, 1L, customer, 100));

    final RecordedRequest request = mockWebServer.takeRequest();

    assertEquals(getMockJsonRequest().trim(), request.getBody().readUtf8().trim());
    assertEquals("POST", request.getMethod());
    assertEquals("030c90e7982b363b16c4ca534fc335abd343e8832f7e7a8d5bbbcebbdc9f92f0", request.getHeader("signature"));
    assertEquals("application/json; charset=utf-8", request.getHeader("content-type"));
    assertEquals("123456", request.getHeader("checkout-account"));
    assertEquals("sha256", request.getHeader("checkout-algorithm"));
    assertEquals("POST", request.getHeader("checkout-method"));
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-nonce")).isEmpty());
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-timestamp")).isEmpty());

    mockWebServer.shutdown();
  }

  @Test
  public void testPaytrailCreatePaymentBadResponse() throws IOException {
    final MockWebServer mockWebServer = new MockWebServer();
    mockWebServer.start();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(400)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(getMockJsonFailResponse())
    );

    final String baseUrl = String.format("http://localhost:%s", mockWebServer.getPort());
    final WebClient webClient = WebClient.builder().baseUrl(baseUrl).build();

    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getRandomNonce()).thenReturn("54321-54312");
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn("123456");
    when(paytrailConfig.getTimestamp()).thenReturn("2018-07-06T10:01:31.904Z");
    when(paytrailConfig.getSuccessUrl(1L)).thenReturn("http://localhost/sucess");
    when(paytrailConfig.getCancelUrl(1L)).thenReturn("http://localhost/cancel");

    final Customer customer = Customer.builder().email("testinen@test.invalid").build();
    final Item item1 = getItem("foo");
    final Item item2 = getItem("bar");
    final List<Item> itemList = Arrays.asList(item1, item2);
    final PaytrailPaymentProvider paymentProvider = new PaytrailPaymentProvider(webClient, paytrailConfig);
    final RuntimeException ex = assertThrows(
      RuntimeException.class,
      () -> paymentProvider.createPayment(itemList, 1L, customer, 100)
    );

    assertInstanceOf(WebClientResponseException.class, ex.getCause());

    mockWebServer.shutdown();
  }

  @Test
  public void testPaytrailValidateSignature() {
    final WebClient webClient = WebClient.builder().baseUrl("").build();

    final String signature = "b2d3ecdda2c04563a4638fcade3d4e77dfdc58829b429ad2c2cb422d0fc64080";
    final String account = "375917";
    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn(account);

    final Map<String, String> paymentParams = getMockPaymentParams(account, signature);
    final PaytrailPaymentProvider paymentProvider = new PaytrailPaymentProvider(webClient, paytrailConfig);
    assertTrue(paymentProvider.validate(paymentParams));
  }

  @Test
  public void testPaytrailValidateSignatureWithNewHeader() {
    final WebClient webClient = WebClient.builder().baseUrl("").build();

    final String signature = "27f1c453898413db167a28127d25c90c7dd8c7cc122ba8cf978d905cc4245121";
    final String account = "375917";
    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn(account);

    final Map<String, String> paymentParams = getMockPaymentParams(account, signature);
    paymentParams.put("checkout-foo", "bar");

    final PaytrailPaymentProvider paymentProvider = new PaytrailPaymentProvider(webClient, paytrailConfig);
    assertTrue(paymentProvider.validate(paymentParams));
  }

  @Test
  public void testPaytrailValidateErrors() {
    final WebClient webClient = WebClient.builder().baseUrl("").build();

    final String signature = "27f1c453898413db167a28127d25c90c7dd8c7cc122ba8cf978d905cc4245121";
    final String account = "375917";
    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn(account);
    final PaytrailPaymentProvider paymentProvider = new PaytrailPaymentProvider(webClient, paytrailConfig);

    // No headers
    final Map<String, String> paymentEmptyParams = new LinkedHashMap<>();
    assertFalse(paymentProvider.validate(paymentEmptyParams));

    // Signature missing
    final Map<String, String> paymentParams1 = getMockPaymentParams(account, signature);
    paymentParams1.remove("signature");
    assertFalse(paymentProvider.validate(paymentParams1));

    // Account missing
    final Map<String, String> paymentParams2 = getMockPaymentParams(account, signature);
    paymentParams2.remove("checkout-account");
    assertFalse(paymentProvider.validate(paymentParams2));

    // Amount missing
    final Map<String, String> paymentParams3 = getMockPaymentParams(account, signature);
    paymentParams3.remove("checkout-amount");
    assertFalse(paymentProvider.validate(paymentParams3));

    // Status missing
    final Map<String, String> paymentParams4 = getMockPaymentParams(account, signature);
    paymentParams4.remove("checkout-status");
    assertFalse(paymentProvider.validate(paymentParams4));

    // Transaction id missing
    final Map<String, String> paymentParams5 = getMockPaymentParams(account, signature);
    paymentParams5.remove("checkout-transaction-id");
    assertFalse(paymentProvider.validate(paymentParams5));

    // Invalid algorithm
    final Map<String, String> paymentParams6 = getMockPaymentParams(account, signature);
    paymentParams6.put("checkout-algorithm", "sha1");
    assertFalse(paymentProvider.validate(paymentParams6));

    // Invalid account
    final Map<String, String> paymentParams7 = getMockPaymentParams("123456", signature);
    assertFalse(paymentProvider.validate(paymentParams7));

    // Signature mismatch
    final Map<String, String> paymentParams8 = getMockPaymentParams(account, "xyz");
    assertFalse(paymentProvider.validate(paymentParams8));
  }

  private String getMockJsonRequest() throws IOException {
    return new String(paytrailMockRequest.getInputStream().readAllBytes());
  }

  private String getMockJsonFailResponse() throws IOException {
    return new String(paytrailMockFailResponse.getInputStream().readAllBytes());
  }

  private String getMockJsonResponse() throws IOException {
    return new String(paytrailMockResponse.getInputStream().readAllBytes());
  }

  private Item getItem(final String productCode) {
    return Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(productCode).build();
  }

  private Map<String, String> getMockPaymentParams(final String account, final String signature) {
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-account", account);
    paymentParams.put("checkout-algorithm", PaytrailConfig.HMAC_ALGORITHM);
    paymentParams.put("checkout-amount", "2964");
    paymentParams.put("checkout-stamp", "15336332710015");
    paymentParams.put("checkout-reference", "192387192837195");
    paymentParams.put("checkout-transaction-id", "4b300af6-9a22-11e8-9184-abb6de7fd2d0");
    paymentParams.put("checkout-status", "ok");
    paymentParams.put("checkout-provider", "nordea");
    paymentParams.put("signature", signature);

    return paymentParams;
  }
}
