package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import javax.annotation.Resource;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.reactive.function.client.WebClient;

@WithMockUser
@DataJpaTest
public class PaymentServiceTest {

  @Resource
  private PaymentRepository paymentRepository;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private TestEntityManager entityManager;

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
    assertEquals("ebd356e5dd0b357f5b383af189bb9652afc278334246f46fb82e42bbd4550f57", request.getHeader("signature"));
    assertEquals("application/json; charset=utf-8", request.getHeader("content-type"));
    assertEquals("123456", request.getHeader("checkout-account"));
    assertEquals("sha256", request.getHeader("checkout-algorithm"));
    assertEquals("POST", request.getHeader("checkout-method"));
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-nonce")).isEmpty());
    assertFalse(Objects.requireNonNull(request.getHeader("checkout-timestamp")).isEmpty());

    mockWebServer.shutdown();
  }

  @Test
  public void testCreatePayment() {
    final String url = "http://localhost";
    final PaytrailResponseDTO response = PaytrailResponseDTO
      .builder()
      .transactionId("test")
      .reference("foo")
      .href(url)
      .build();
    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);

    final PaymentService paymentService = new PaymentService(paytrailService, paymentRepository, enrollmentRepository);
    final String redirectUrl = paymentService.create(enrollment.getId(), person);

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(anyList(), any(Long.class), any(Customer.class), eq(10000));
  }

  @Test
  public void testCreatePaymentWithTextualSkill() {
    final String url = "http://localhost";
    final PaytrailResponseDTO response = PaytrailResponseDTO
      .builder()
      .transactionId("test")
      .reference("foo")
      .href(url)
      .build();
    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);
    enrollment.setTextualSkill(true);

    final PaymentService paymentService = new PaymentService(paytrailService, paymentRepository, enrollmentRepository);
    final String redirectUrl = paymentService.create(enrollment.getId(), person);

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(anyList(), any(Long.class), any(Customer.class), eq(15000));
  }

  @Test
  public void testCreatePaymentWrongPerson() {
    final Person person1 = createPerson();
    final Person person2 = createPerson();
    final Enrollment enrollment = createEnrollment(person1);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(null);

    final PaymentService paymentService = new PaymentService(paytrailService, paymentRepository, enrollmentRepository);

    final APIException ex = assertThrows(APIException.class, () -> paymentService.create(enrollment.getId(), person2));
    assertEquals(APIExceptionType.PAYMENT_PERSON_SESSION_MISMATCH, ex.getExceptionType());
    verify(paytrailService, times(0)).createPayment(anyList(), any(Long.class), any(Customer.class), anyInt());
  }

  @Test
  public void testValidatePaytrailSignature() {
    WebClient webClient = WebClient.builder().baseUrl("").build();

    final String signature = "db25736539c6b22afe11699016eaea2f38a181f033dc4368cdfbb8010faf5862";
    final String account = "375917";
    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn(account);

    final Map<String, String> paymentParams = getMockPaymentParams(account, signature);
    final PaytrailService paytrailService = new PaytrailService(webClient, paytrailConfig);
    assertTrue(paytrailService.validate(paymentParams));
  }

  @Test
  public void testValidatePaytrailSignatureWithNewHeader() {
    WebClient webClient = WebClient.builder().baseUrl("").build();

    final String signature = "ffaa2fec0b16680c80e2b16383c8900f105934d801e77d604d153ef438dceffd";
    final String account = "375917";
    final PaytrailConfig paytrailConfig = mock(PaytrailConfig.class);
    when(paytrailConfig.getSecret()).thenReturn("SAIPPUAKAUPPIAS");
    when(paytrailConfig.getAccount()).thenReturn(account);

    final Map<String, String> paymentParams = getMockPaymentParams(account, signature);
    paymentParams.put("checkout-foo", "bar");

    final PaytrailService paytrailService = new PaytrailService(webClient, paytrailConfig);
    assertTrue(paytrailService.validate(paymentParams));
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

  private String getMockJsonRequest() throws IOException {
    return new String(paytrailMockRequest.getInputStream().readAllBytes());
  }

  private String getMockJsonResponse() throws IOException {
    return new String(paytrailMockResponse.getInputStream().readAllBytes());
  }

  private Person createPerson() {
    final Person person = Factory.person();
    entityManager.persist(person);

    return person;
  }

  private Enrollment createEnrollment(Person person) {
    final ExamEvent examEvent = Factory.examEvent();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    return enrollment;
  }
}
