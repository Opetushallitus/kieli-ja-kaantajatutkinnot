package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.core.env.Environment;
import org.springframework.data.util.Pair;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class PaymentServiceTest {

  @Resource
  private PaymentRepository paymentRepository;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private TestEntityManager entityManager;

  Environment environment;

  @BeforeEach
  public void setup() {
    environment = mock(Environment.class);

    when(environment.getRequiredProperty("app.base-url.public")).thenReturn("https://foo.bar");
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
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );
    final String redirectUrl = paymentService.create(enrollment.getId(), person);

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(anyList(), any(Long.class), any(Customer.class), eq(45400));
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
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );
    final String redirectUrl = paymentService.create(enrollment.getId(), person);

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(anyList(), any(Long.class), any(Customer.class), eq(68100));
  }

  @Test
  public void testCreatePaymentWrongPerson() {
    final Person person1 = createPerson();
    final Person person2 = createPerson();
    final Enrollment enrollment = createEnrollment(person1);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(null);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );

    final APIException ex = assertThrows(APIException.class, () -> paymentService.create(enrollment.getId(), person2));
    assertEquals(APIExceptionType.PAYMENT_PERSON_SESSION_MISMATCH, ex.getExceptionType());
    verify(paytrailService, times(0)).createPayment(anyList(), any(Long.class), any(Customer.class), anyInt());
  }

  @Test
  public void testPaymentSuccessOk() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );
    assertEquals(
      String.format("https://foo.bar/ilmoittaudu/%d/maksu/valmis", enrollment.getExamEvent().getId()),
      paymentService.success(payment.getPaymentId(), paymentParams)
    );
  }

  @Test
  public void testPaymentSuccessCancel() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.FAIL.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );
    assertEquals(
      String.format("https://foo.bar/ilmoittaudu/%d/maksu/peruutettu", enrollment.getExamEvent().getId()),
      paymentService.cancel(payment.getPaymentId(), paymentParams)
    );
  }

  @Test
  public void testPaymentAlreadyPaid() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    payment.setPaymentStatus(PaymentStatus.OK);
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.success(payment.getPaymentId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_ALREADY_PAID, ex.getExceptionType());
  }

  @Test
  public void testPaymentNotFound() {
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );

    final NotFoundException ex = assertThrows(
      NotFoundException.class,
      () -> paymentService.success(-1L, paymentParams)
    );
    assertEquals("Payment not found", ex.getMessage());
  }

  @Test
  public void testEnrollmentNotFound() {
    final Person person = new Person();
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment
    );

    final NotFoundException ex = assertThrows(NotFoundException.class, () -> paymentService.create(-1L, person));
    assertEquals("Enrollment not found", ex.getMessage());
  }

  private Pair<Payment, Enrollment> createPayment() {
    final Payment payment = new Payment();
    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);

    payment.setPerson(person);
    payment.setEnrollment(enrollment);

    entityManager.persist(payment);

    return Pair.of(payment, enrollment);
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
