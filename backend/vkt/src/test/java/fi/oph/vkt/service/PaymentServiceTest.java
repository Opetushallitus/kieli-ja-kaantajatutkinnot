package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.payment.Item;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import javax.annotation.Resource;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
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
    assertTrue(paytrailService.createPayment(itemList, 1L));

    RecordedRequest request = mockWebServer.takeRequest();

    assertEquals("POST", request.getMethod());
    assertEquals("707a5a4de8077c0ce1f8c5823a171aecd62590125d8b494cedfffe9cfc17276b", request.getHeader("signature"));

    mockWebServer.shutdown();
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

  @Test
  public void testCreatePayment() {
    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class))).thenReturn(true);

    final PaymentService paymentService = new PaymentService(paytrailService, paymentRepository, enrollmentRepository);

    assertTrue(paymentService.createPayment(enrollment.getId(), person));
    verify(paytrailService, times(1)).createPayment(anyList(), any(Long.class));
  }
}
