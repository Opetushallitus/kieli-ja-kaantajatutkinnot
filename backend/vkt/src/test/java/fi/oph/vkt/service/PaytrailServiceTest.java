package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
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

@WithMockUser
@DataJpaTest
public class PaytrailServiceTest {

  @Value("classpath:payment/paytrail-response.json")
  private org.springframework.core.io.Resource paytrailMockResponse;

  @Value("classpath:payment/paytrail-request.json")
  private org.springframework.core.io.Resource paytrailMockRequest;

  @Test
  public void testPaytrailCreatePayment() throws IOException, InterruptedException {
    MockWebServer mockWebServer;
    mockWebServer = new MockWebServer();
    mockWebServer.start();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody(getMockJsonResponse())
    );

    String baseUrl = String.format("http://localhost:%s", mockWebServer.getPort());
    WebClient webClient = WebClient.builder().baseUrl(baseUrl).build();

    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getRandomNonce()).thenReturn("54321-54312");
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn("123456");
    when(paytrailConfig.getTimestamp()).thenReturn("2018-07-06T10:01:31.904Z");
    when(paytrailConfig.getSuccessUrl(1L)).thenReturn("http://localhost/sucess");
    when(paytrailConfig.getCancelUrl(1L)).thenReturn("http://localhost/cancel");

    final Customer customer = Customer.builder().email("testinen@test.invalid").build();
    final Item item1 = Item.builder().productCode("foo").build();
    final Item item2 = Item.builder().productCode("bar").build();
    final List<Item> itemList = Arrays.asList(item1, item2);
    final PaytrailService paytrailService = new PaytrailService(webClient, paytrailConfig);
    assertNotNull(paytrailService.createPayment(itemList, 1L, customer, 100));

    RecordedRequest request = mockWebServer.takeRequest();

    assertEquals(getMockJsonRequest().trim(), request.getBody().readUtf8().trim());
    assertEquals("POST", request.getMethod());
    assertEquals("f481c1142d55bd50127cf445b116d646312e28a6964aa01ce9e50532e3b7cd37", request.getHeader("signature"));
    assertEquals("application/json; charset=utf-8", request.getHeader("content-type"));
    assertEquals("123456", request.getHeader("checkout-account"));
    assertEquals("sha256", request.getHeader("checkout-algorithm"));
    assertEquals("POST", request.getHeader("checkout-method"));
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-nonce")).isEmpty());
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-timestamp")).isEmpty());

    mockWebServer.shutdown();
  }

  private String getMockJsonRequest() throws IOException {
    return new String(paytrailMockRequest.getInputStream().readAllBytes());
  }

  private String getMockJsonResponse() throws IOException {
    return new String(paytrailMockResponse.getInputStream().readAllBytes());
  }
}
