package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
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
import fi.oph.vkt.payment.paytrail.PaytrailPaymentProvider;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
  public void testCreatePaymentWithAllSkills() {
    final String url = "http://localhost";
    final PaytrailResponseDTO response = PaytrailResponseDTO
      .builder()
      .transactionId("test")
      .reference("foo")
      .href(url)
      .build();

    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);
    enrollment.setOralSkill(true);
    enrollment.setTextualSkill(true);
    enrollment.setUnderstandingSkill(true);
    enrollment.setStatus(EnrollmentStatus.CANCELED);

    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    final String redirectUrl = paymentService.createPaymentForEnrollment(enrollment.getId(), person);
    final List<Item> items = List.of(
      Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(EnrollmentSkill.TEXTUAL.toString()).build(),
      Item.builder().units(1).unitPrice(22700).vatPercentage(0).productCode(EnrollmentSkill.ORAL.toString()).build(),
      Item
        .builder()
        .units(1)
        .unitPrice(0)
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
    verify(paymentProvider, times(1)).createPayment(eq(items), any(Long.class), eq(customer), eq(45400));

    final List<Payment> payments = paymentRepository.findAll();
    assertEquals(1, payments.size());

    final Payment payment = payments.get(0);
    assertEquals(45400, payment.getAmount());
    assertEquals("test", payment.getTransactionId());
    assertEquals("foo", payment.getReference());
    assertEquals(url, payment.getPaymentUrl());
    assertEquals(PaymentStatus.NEW, payment.getPaymentStatus());

    assertEquals(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT, payment.getEnrollment().getStatus());
  }

  @Test
  public void testCreatePaymentWithoutOralSkill() {
    final String url = "http://localhost";
    final PaytrailResponseDTO response = PaytrailResponseDTO
      .builder()
      .transactionId("test")
      .reference("foo")
      .href(url)
      .build();

    final Person person = createPerson();
    final Enrollment enrollment = createEnrollment(person);
    enrollment.setOralSkill(false);
    enrollment.setTextualSkill(true);
    enrollment.setUnderstandingSkill(true);
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);

    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(response);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );
    final String redirectUrl = paymentService.createPaymentForEnrollment(enrollment.getId(), person);

    final List<Item> items = List.of(
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
    verify(paymentProvider, times(1)).createPayment(eq(items), any(Long.class), any(Customer.class), eq(22700));
  }

  @Test
  public void testCreatePaymentPassesProperCustomerDataToPaymentProvider() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    person.setFirstName("a" + "b".repeat(48) + "cd");
    person.setLastName("a" + "b".repeat(48) + "cd");

    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setEmail("a@" + "b".repeat(197) + "cd");
    enrollment.setPhoneNumber("+234567890123456");
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final Customer expectedCustomerData = Customer
      .builder()
      .email("a@" + "b".repeat(197) + "c")
      .phone("+23456789012345")
      .firstName("a" + "b".repeat(48) + "c")
      .lastName("a" + "b".repeat(48) + "c")
      .build();

    when(paymentProvider.createPayment(anyList(), anyLong(), eq(expectedCustomerData), anyInt()))
      .thenReturn(PaytrailResponseDTO.builder().transactionId("12345").reference("RF123").href("http").build());

    final String paymentUrl = paymentService.createPaymentForEnrollment(enrollment.getId(), person);

    assertEquals("http", paymentUrl);
  }

  @Test
  public void testCreatePaymentWrongPerson() {
    final Person person1 = createPerson();
    final Person person2 = createPerson();
    final Enrollment enrollment = createEnrollment(person1);
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.createPayment(anyList(), any(Long.class), any(Customer.class), anyInt())).thenReturn(null);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
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
    verifyNoInteractions(paymentProvider);
  }

  @Test
  public void testCreatePaymentEnrollmentNotFound() {
    final Person person = Factory.person();

    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    final PaymentService paymentService = new PaymentService(
      paymentProvider,
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

  @Test
  public void testFinalizePaymentOnSuccess() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    paymentParams.put("checkout-amount", "45400");
    paymentParams.put("checkout-reference", String.valueOf(payment.getId()));
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    paymentService.finalizePayment(payment.getId(), paymentParams);

    verify(publicEnrollmentEmailService, times(1)).sendEnrollmentConfirmationEmail(eq(payment.getEnrollment()));
    assertEquals(EnrollmentStatus.PAID, enrollment.getStatus());
    assertEquals(PaymentStatus.OK, payment.getPaymentStatus());
  }

  @Test
  public void testFinalizePaymentOnFailure() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Enrollment enrollment = pair.getSecond();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.FAIL.toString());
    paymentParams.put("checkout-amount", "45400");
    paymentParams.put("checkout-reference", String.valueOf(payment.getId()));
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    paymentService.finalizePayment(payment.getId(), paymentParams);

    verifyNoInteractions(publicEnrollmentEmailService);
    assertEquals(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT, enrollment.getStatus());
    assertEquals(PaymentStatus.FAIL, payment.getPaymentStatus());
  }

  @Test
  public void testFinalizePaymentValidationFailed() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(false);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.finalizePayment(payment.getId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_VALIDATION_FAIL, ex.getExceptionType());
    assertNull(payment.getPaymentStatus());
    verifyNoInteractions(publicEnrollmentEmailService);
  }

  @Test
  public void testFinalizePaymentOnFailureAlreadyPaid() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    payment.setPaymentStatus(PaymentStatus.OK);
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.FAIL.toString());
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.finalizePayment(payment.getId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_ALREADY_PAID, ex.getExceptionType());
    assertEquals(PaymentStatus.OK, payment.getPaymentStatus());
    verifyNoInteractions(publicEnrollmentEmailService);
  }

  @Test
  public void testFinalizePaymentOnSuccessAlreadyPaid() throws IOException, InterruptedException {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    payment.setPaymentStatus(PaymentStatus.OK);
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    paymentService.finalizePayment(payment.getId(), paymentParams);
    verifyNoInteractions(publicEnrollmentEmailService);
  }

  @Test
  public void testFinalizePaymentAmountMustMatch() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    paymentParams.put("checkout-amount", "21400");
    paymentParams.put("checkout-reference", String.valueOf(payment.getId()));
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
      APIException.class,
      () -> paymentService.finalizePayment(payment.getId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_AMOUNT_MISMATCH, ex.getExceptionType());
    assertNull(payment.getPaymentStatus());
    verifyNoInteractions(publicEnrollmentEmailService);
  }

  @Test
  public void testFinalizePaymentReferenceIdMustMatch() {
    final Pair<Payment, Enrollment> pair = createPayment();
    final Payment payment = pair.getFirst();
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    paymentParams.put("checkout-status", PaymentStatus.OK.toString());
    paymentParams.put("checkout-amount", "45400");
    paymentParams.put("checkout-reference", "-1");
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    when(paymentProvider.validate(anyMap())).thenReturn(true);

    final PaymentService paymentService = new PaymentService(
            paymentProvider,
            paymentRepository,
            enrollmentRepository,
            environment,
            publicEnrollmentEmailService
    );

    final APIException ex = assertThrows(
            APIException.class,
            () -> paymentService.finalizePayment(payment.getId(), paymentParams)
    );
    assertEquals(APIExceptionType.PAYMENT_REFERENCE_MISMATCH, ex.getExceptionType());
    assertNull(payment.getPaymentStatus());
    verifyNoInteractions(publicEnrollmentEmailService);
  }

  @Test
  public void testFinalizePaymentPaymentNotFound() {
    final Map<String, String> paymentParams = new LinkedHashMap<>();
    final PaytrailPaymentProvider paymentProvider = mock(PaytrailPaymentProvider.class);
    final PublicEnrollmentEmailService publicEnrollmentEmailService = mock(PublicEnrollmentEmailService.class);
    final PaymentService paymentService = new PaymentService(
      paymentProvider,
      paymentRepository,
      enrollmentRepository,
      environment,
      publicEnrollmentEmailService
    );

    final NotFoundException ex = assertThrows(
      NotFoundException.class,
      () -> paymentService.finalizePayment(-1L, paymentParams)
    );
    assertEquals("Payment not found", ex.getMessage());
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
    enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT);
    entityManager.persist(examEvent);
    entityManager.persist(enrollment);

    return enrollment;
  }
}
