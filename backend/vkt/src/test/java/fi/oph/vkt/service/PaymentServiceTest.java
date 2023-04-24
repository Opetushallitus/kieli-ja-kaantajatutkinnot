package fi.oph.vkt.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.vkt.payment.Item;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class PaymentServiceTest {

  @Test
  public void testPaytrailCreatePayment() throws IOException, InterruptedException {
    MockWebServer mockWebServer;
    mockWebServer = new MockWebServer();
    mockWebServer.start();

    mockWebServer.enqueue(
      new MockResponse()
        .setResponseCode(200)
        .setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .setBody("{\"foo\":\"bar\"}")
    );

    String baseUrl = String.format("http://localhost:%s", mockWebServer.getPort());

    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.payment.paytrail.url")).thenReturn(baseUrl);
    when(environment.getRequiredProperty("app.payment.paytrail.secret")).thenReturn("SAIPPUAKAUPPIAS");

    final Item item1 = Item.builder().build();
    final Item item2 = Item.builder().build();
    final List<Item> itemList = Arrays.asList(item1, item2);
    final PaytrailService paytrailService = new PaytrailService(environment, WebClient.create());
    assertTrue(paytrailService.createPayment(itemList));

    RecordedRequest request = mockWebServer.takeRequest();

    assertEquals("POST", request.getMethod());
    assertEquals("9643a6831a6dfe3b752a17685ac76dc4285c8da853b3bb2f25a960744f7afa41", request.getHeader("signature"));

    mockWebServer.shutdown();
  }

  @Test
  public void testCreatePayment() {
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList())).thenReturn(true);
    final PaymentService paymentService = new PaymentService(paytrailService);
    assertTrue(paymentService.createPayment());
    verify(paytrailService, times(1)).createPayment(anyList());
  }
}
