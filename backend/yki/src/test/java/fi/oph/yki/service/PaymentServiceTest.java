package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Payment;
import fi.oph.yki.model.PaymentLink;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.model.type.PaymentStatus;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.payment.PaymentProvider;
import fi.oph.yki.payment.paytrail.Customer;
import fi.oph.yki.payment.paytrail.PaytrailResponseDTO;
import fi.oph.yki.repository.PaymentLinkRepository;
import fi.oph.yki.repository.PaymentRepository;
import fi.oph.yki.repository.RegistrationChangeEventRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.UUIDSource;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class PaymentServiceTest {

  private static final String PAYMENT_URL = "https://pay.paytrail.com/pay/test";

  @Resource
  private PaymentRepository paymentRepository;

  @Resource
  private PaymentLinkRepository paymentLinkRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private RegistrationChangeEventRepository registrationChangeEventRepository;

  @Resource
  private TestEntityManager entityManager;

  private PaymentProvider paymentProvider;

  private PaymentService paymentService;

  @BeforeEach
  public void setup() {
    final Environment environment = mock(Environment.class);
    when(environment.getRequiredProperty("app.exam-fee.perus", Integer.class)).thenReturn(165);
    when(environment.getRequiredProperty("app.base-url.public-frontend")).thenReturn("https://foo.bar/yki");

    paymentProvider = mock(PaymentProvider.class);
    when(paymentProvider.createPayment(anyList(), anyLong(), anyString(), any(Customer.class), anyInt(), any()))
      .thenReturn(
        PaytrailResponseDTO.builder().transactionId("transaction").reference("ref").href(PAYMENT_URL).build()
      );
    when(paymentProvider.validate(any())).thenReturn(true);

    paymentService =
      new PaymentService(
        paymentProvider,
        paymentRepository,
        paymentLinkRepository,
        registrationRepository,
        registrationChangeEventRepository,
        environment,
        new UUIDSource()
      );
  }

  private Identity persistIdentity() {
    final Identity identity = new Identity();
    identity.setCreatedAt(LocalDateTime.now());
    identity.setModifiedAt(LocalDateTime.now());

    return entityManager.persist(identity);
  }

  private Registration persistRegistration(final Identity identity, final RegistrationState state) {
    final ExamDate examDate = entityManager.persist(Factory.examDate());
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(entityManager.persist(Factory.organizer()));
    entityManager.persist(examSession);

    final ObjectNode form = new ObjectMapper().createObjectNode();
    form.put("email", "testi@example.com");
    form.put("first_name", "Testi");
    form.put("last_name", "Henkilö");

    final Registration registration = Factory.registration(null);
    registration.setExamSession(examSession);
    registration.setIdentity(identity);
    registration.setState(state);
    registration.setForm(form);
    registration.setCreatedAt(LocalDateTime.now());

    return entityManager.persist(registration);
  }

  private Payment persistPayment(final Registration registration) {
    final Payment payment = new Payment();
    payment.setRegistration(registration);
    payment.setAmount(16500);
    payment.setMerchantReference("YKI-EXAM-test");
    payment.setPaymentUrl(PAYMENT_URL);
    payment.setPaymentStatus(PaymentStatus.NEW);

    return entityManager.persist(payment);
  }

  private Map<String, String> paymentParams(final String status, final int amount) {
    final Map<String, String> params = new HashMap<>();
    params.put("checkout-status", status);
    params.put("checkout-amount", String.valueOf(amount));
    params.put("checkout-reference", "YKI-EXAM-test");

    return params;
  }

  @Test
  public void testCreatePaymentForRegistrationUsesConfiguredExamFee() {
    final Identity identity = persistIdentity();
    final Registration registration = persistRegistration(identity, RegistrationState.SUBMITTED);

    final String paymentUrl = paymentService.createPaymentForRegistration(registration.getId(), identity, AppLocale.FI);

    assertEquals(PAYMENT_URL, paymentUrl);
    final Payment payment = paymentRepository.findAll().get(0);
    assertEquals(16500, payment.getAmount());
    assertEquals(PaymentStatus.NEW, payment.getPaymentStatus());
    assertEquals("transaction", payment.getTransactionId());
    assertTrue(payment.getMerchantReference().startsWith("YKI-EXAM-"));
    verify(paymentProvider)
      .createPayment(anyList(), eq(payment.getId()), eq(payment.getMerchantReference()), any(), eq(16500), any());
  }

  @Test
  public void testCreatePaymentForRegistrationUsesRegistrationExamFee() {
    final Identity identity = persistIdentity();
    final Registration registration = persistRegistration(identity, RegistrationState.SUBMITTED);
    registration.setExamFee(100);

    paymentService.createPaymentForRegistration(registration.getId(), identity, AppLocale.FI);

    assertEquals(10000, paymentRepository.findAll().get(0).getAmount());
  }

  @Test
  public void testCreatePaymentForRegistrationCreatesNewPaymentWhenUnfinishedPaymentExists() {
    final Identity identity = persistIdentity();
    final Registration registration = persistRegistration(identity, RegistrationState.SUBMITTED);
    final Payment unfinished = persistPayment(registration);

    final String paymentUrl = paymentService.createPaymentForRegistration(registration.getId(), identity, AppLocale.FI);

    assertEquals(PAYMENT_URL, paymentUrl);
    assertEquals(2, paymentRepository.count());
    assertEquals(PaymentStatus.NEW, paymentRepository.findById(unfinished.getId()).orElseThrow().getPaymentStatus());
    verify(paymentProvider, times(1)).createPayment(anyList(), anyLong(), anyString(), any(), anyInt(), any());
  }

  private PaymentLink persistPaymentLink(final String code, final LocalDateTime expiresAt) {
    final Identity identity = persistIdentity();
    final PaymentLink paymentLink = new PaymentLink();
    paymentLink.setCode(StringUtil.sha256hex(code));
    paymentLink.setIdentity(identity);
    paymentLink.setRegistration(persistRegistration(identity, RegistrationState.SUBMITTED));
    paymentLink.setExpiresAt(expiresAt);

    return entityManager.persist(paymentLink);
  }

  @Test
  public void testGetActivePaymentLink() {
    final PaymentLink paymentLink = persistPaymentLink("code", LocalDateTime.now().plusDays(1));
    entityManager.clear();

    final PaymentLink result = paymentService.getActivePaymentLink("code");

    assertEquals(paymentLink.getId(), result.getId());
    assertEquals(paymentLink.getIdentity().getId(), result.getIdentity().getId());
    assertEquals(
      paymentLink.getRegistration().getExamSession().getId(),
      result.getRegistration().getExamSession().getId()
    );
  }

  @Test
  public void testGetActivePaymentLinkWithoutExpiry() {
    final PaymentLink paymentLink = persistPaymentLink("code", null);

    assertEquals(paymentLink.getId(), paymentService.getActivePaymentLink("code").getId());
  }

  @Test
  public void testGetActivePaymentLinkRejectsUnknownCode() {
    persistPaymentLink("code", null);

    final APIException exception = assertThrows(APIException.class, () -> paymentService.getActivePaymentLink("other"));
    assertEquals(APIExceptionType.PAYMENT_LINK_NOT_FOUND, exception.getExceptionType());
  }

  @Test
  public void testGetActivePaymentLinkRejectsExpiredLink() {
    persistPaymentLink("code", LocalDateTime.now().minusMinutes(1));

    final APIException exception = assertThrows(APIException.class, () -> paymentService.getActivePaymentLink("code"));
    assertEquals(APIExceptionType.PAYMENT_LINK_EXPIRED, exception.getExceptionType());
  }

  @Test
  public void testCreatePaymentForRegistrationRejectsOtherIdentity() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.SUBMITTED);
    final Identity otherIdentity = persistIdentity();

    final APIException exception = assertThrows(
      APIException.class,
      () -> paymentService.createPaymentForRegistration(registration.getId(), otherIdentity, AppLocale.FI)
    );
    assertEquals(APIExceptionType.REGISTRATION_NOT_OWNED, exception.getExceptionType());
  }

  @Test
  public void testFinalizePaymentCompletesSubmittedRegistration() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.SUBMITTED);
    final Payment payment = persistPayment(registration);

    paymentService.finalizePayment(payment.getId(), paymentParams("ok", 16500));

    entityManager.clear();
    final Payment paid = paymentRepository.findById(payment.getId()).orElseThrow();
    assertEquals(PaymentStatus.OK, paid.getPaymentStatus());
    assertNotNull(paid.getPaidAt());
    assertEquals(
      RegistrationState.COMPLETED,
      registrationRepository.findById(registration.getId()).orElseThrow().getState()
    );
    final List<RegistrationChangeEvent> events = registrationChangeEventRepository.findAll();
    assertEquals(1, events.size());
    assertEquals("COMPLETE_PAYMENT", events.get(0).getEvent());
    assertEquals(RegistrationState.COMPLETED, events.get(0).getRegistrationState());
  }

  @Test
  public void testFinalizePaymentForCancelledRegistrationMarksPaidAndCancelled() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.CANCELLED);
    final Payment payment = persistPayment(registration);

    paymentService.finalizePayment(payment.getId(), paymentParams("ok", 16500));

    entityManager.clear();
    assertEquals(
      RegistrationState.PAID_AND_CANCELLED,
      registrationRepository.findById(registration.getId()).orElseThrow().getState()
    );
  }

  @Test
  public void testFinalizePaymentFailKeepsRegistrationSubmitted() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.SUBMITTED);
    final Payment payment = persistPayment(registration);

    paymentService.finalizePayment(payment.getId(), paymentParams("fail", 16500));

    entityManager.clear();
    assertEquals(PaymentStatus.FAIL, paymentRepository.findById(payment.getId()).orElseThrow().getPaymentStatus());
    assertEquals(
      RegistrationState.SUBMITTED,
      registrationRepository.findById(registration.getId()).orElseThrow().getState()
    );
    assertTrue(registrationChangeEventRepository.findAll().isEmpty());
  }

  @Test
  public void testFinalizePaymentRejectsAmountMismatch() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.SUBMITTED);
    final Payment payment = persistPayment(registration);

    final APIException exception = assertThrows(
      APIException.class,
      () -> paymentService.finalizePayment(payment.getId(), paymentParams("ok", 100))
    );
    assertEquals(APIExceptionType.PAYMENT_AMOUNT_MISMATCH, exception.getExceptionType());
  }

  @Test
  public void testFinalizePaymentSuccessRedirectUrl() {
    final Registration registration = persistRegistration(persistIdentity(), RegistrationState.SUBMITTED);
    final Payment payment = persistPayment(registration);

    assertEquals(
      "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-success&id=" +
      registration.getExamSession().getId(),
      paymentService.getFinalizePaymentSuccessRedirectUrl(payment.getId())
    );
  }
}
