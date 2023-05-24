package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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
import fi.oph.vkt.model.type.EnrollmentSkill;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
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
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    final String redirectUrl = paymentService.createPaymentForEnrollment(enrollment.getId(), person);
    final List<Item> items = List.of(
      Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(EnrollmentSkill.ORAL.toString()).build(),
      Item
        .builder()
        .units(1)
        .unitPrice(22700)
        .vatPercentage(0)
        .productCode(EnrollmentSkill.UNDERSTANDING.toString())
        .build()
    );
    final Customer customer = Customer
      .builder()
      .email(enrollment.getEmail())
      .phone(enrollment.getPhoneNumber())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .build();

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(eq(items), any(Long.class), eq(customer), eq(45400));
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
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);
    enrollment.setTextualSkill(true);
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    final String redirectUrl = paymentService.createPaymentForEnrollment(enrollment.getId(), person);

    final List<Item> items = List.of(
      Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(EnrollmentSkill.ORAL.toString()).build(),
      Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(EnrollmentSkill.TEXTUAL.toString()).build(),
      Item
        .builder()
        .units(1)
        .unitPrice(0)
        .vatPercentage(0)
        .productCode(EnrollmentSkill.UNDERSTANDING.toString())
        .build()
    );

    assertEquals(url, redirectUrl);
    verify(paytrailService, times(1)).createPayment(eq(items), any(Long.class), any(Customer.class), eq(45400));
  }

  @Test
  public void testCreatePaymentWrongPerson() {
    final Person person1 = createPerson();
    final Person person2 = createPerson();
    final Enrollment enrollment = createEnrollment(person1);
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(null);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.createPaymentForEnrollment(enrollment.getId(), person2)
    );
    assertEquals(APIExceptionType.PAYMENT_PERSON_SESSION_MISMATCH, ex.getExceptionType());
    verify(paytrailService, times(0)).createPayment(anyList(), any(Long.class), any(Customer.class), anyInt());
  }

  @Test
  public void testPaymentSuccessOk() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    paymentParams.put("checkout-amount", "45400");
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    assertEquals(
      String.format("https://foo.bar/ilmoittaudu/%d/maksu/valmis", enrollment.getExamEvent().getId()),
      paymentService.success(payment.getPaymentId(), paymentParams)
    );
    verify(publicEnrollmentEmailService, times(1)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
    assertEquals(EnrollmentStatus.PAID, enrollment.getStatus());
    assertEquals(PaymentStatus.OK, payment.getPaymentStatus());
  }

  @Test
  public void testPaymentSuccessCancel() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.FAIL.toString());
    paymentParams.put("checkout-amount", "45400");
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    assertEquals(
      String.format("https://foo.bar/ilmoittaudu/%d/maksu/peruutettu", enrollment.getExamEvent().getId()),
      paymentService.cancel(payment.getPaymentId(), paymentParams)
    );
  }

  @Test
  public void testPaymentValidationFailed() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(false);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.success(payment.getPaymentId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_VALIDATION_FAIL, ex.getExceptionType());
    assertEquals(EnrollmentStatus.EXPECTING_PAYMENT, enrollment.getStatus());
    assertNull(payment.getPaymentStatus());
    verify(publicEnrollmentEmailService, times(0)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
  }

  @Test
  public void testPaymentAlreadyPaidTryCancel() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    payment.setPaymentStatus(PaymentStatus.OK);
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.FAIL.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.success(payment.getPaymentId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_ALREADY_PAID, ex.getExceptionType());
    assertEquals(EnrollmentStatus.EXPECTING_PAYMENT, enrollment.getStatus());
    assertEquals(PaymentStatus.OK, payment.getPaymentStatus());
    verify(publicEnrollmentEmailService, times(0)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
  }

  @Test
  public void testPaymentAlreadyPaidTryOK() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    payment.setPaymentStatus(PaymentStatus.OK);
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    paymentService.success(payment.getPaymentId(), paymentParams);
    verify(publicEnrollmentEmailService, times(0)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
  }

  @Test
  public void testPaymentAmountMustMatch() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    paymentParams.put("checkout-amount", "21400");
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paytrailService.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.success(payment.getPaymentId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_AMOUNT_MISMATCH, ex.getExceptionType());
    assertEquals(EnrollmentStatus.EXPECTING_PAYMENT, enrollment.getStatus());
    assertNull(payment.getPaymentStatus());
    verify(publicEnrollmentEmailService, times(0)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
  }

  @Test
  public void testPaymentNotFound() {
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    final PaytrailService paytrailService = mock(PaytrailService.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
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
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    final PaymentService paymentService = new PaymentService(
      paytrailService,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final NotFoundException ex = assertThrows(
      NotFoundException.class,
      () -> paymentService.createPaymentForEnrollment(-1L, person)
    );
    assertEquals("Enrollment not found", ex.getMessage());
  }

  private Pair<Payment, Enrollment> createPayment() {
    final Payment payment = new Payment();
    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);

    payment.setAmount(45400);
    payment.setEnrollment(enrollment);

    entityManager.persist(payment);

    return Pair.of(payment, enrollment);
  }

  private Person createPerson() {
    final Person person = Factory.person();
    entityManager.persist(person);

    return person;
  }

  private Enrollment createEnrollment(final Person person) {
    final ExamEvent examEvent = Factory.examEvent();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    return enrollment;
  }
}
