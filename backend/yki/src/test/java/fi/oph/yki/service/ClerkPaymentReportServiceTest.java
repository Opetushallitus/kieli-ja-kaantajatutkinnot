package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.clerk.ClerkPaymentReportRowDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.PaymentState;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.ExamPaymentRepository;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@WithMockUser
@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
public class ClerkPaymentReportServiceTest {

  private static final String ORGANIZER_OID = "1.2.246.562.10.99999999999";
  private static final String ORGANIZER_NAME = "Testiorganisaatio";

  @Resource
  private ExamPaymentRepository examPaymentRepository;

  @Resource
  private TestEntityManager testEntityManager;

  @MockitoBean
  private OrganizationService organizationService;

  private ClerkPaymentReportService clerkPaymentReportService;

  @BeforeEach
  public void setup() {
    clerkPaymentReportService = new ClerkPaymentReportService(examPaymentRepository, organizationService);
    when(organizationService.getOrganizationNames(anyCollection())).thenReturn(Map.of(ORGANIZER_OID, ORGANIZER_NAME));
  }

  @Test
  public void testPaidPaymentIncludedInReport() {
    final long organizerId = createOrganizer(ORGANIZER_OID);
    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    testEntityManager.persist(examSession);
    setOrganizerOnExamSession(examSession.getId(), organizerId);

    final Person person = Factory.person();
    person.setEmail("test@example.com");
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(registration);

    final ExamPayment payment = createExamPayment(
      registration,
      new BigDecimal("15300"),
      "YKI-EXAM-1-1-test-uuid",
      LocalDateTime.of(2026, 3, 15, 10, 30, 0)
    );
    testEntityManager.persist(payment);

    testEntityManager.flush();
    testEntityManager.clear();

    final List<ClerkPaymentReportRowDTO> result = clerkPaymentReportService.getPaymentReport(
      LocalDate.of(2026, 3, 1),
      LocalDate.of(2026, 3, 31)
    );

    assertEquals(1, result.size());
    final ClerkPaymentReportRowDTO row = result.get(0);
    assertEquals(ORGANIZER_NAME, row.organizer());
    assertEquals("Henkilö", row.lastName());
    assertEquals("Testi", row.firstName());
    assertEquals("test@example.com", row.email());
    assertEquals(LocalDate.of(2026, 6, 15), row.examDate());
    assertNull(row.originalExamDate());
    assertEquals("suomi", row.examLanguage());
    assertEquals("Perustaso", row.examLevel());
    assertEquals("153,00", row.amount());
    assertEquals("YKI-EXAM-1-1-test-uuid", row.reference());
    assertNull(row.frSource());
  }

  @Test
  public void testFreeRegistrationIncludedInReport() {
    final long organizerId = createOrganizer(ORGANIZER_OID);
    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    testEntityManager.persist(examSession);
    setOrganizerOnExamSession(examSession.getId(), organizerId);

    final Person person = Factory.person();
    person.setEmail("free@example.com");
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(registration);

    final FreeRegistration freeRegistration = Factory.freeRegistration(registration);
    testEntityManager.persist(freeRegistration);

    testEntityManager.flush();
    testEntityManager.clear();

    final List<ClerkPaymentReportRowDTO> result = clerkPaymentReportService.getPaymentReport(
      LocalDate.of(2026, 3, 1),
      LocalDate.of(2026, 3, 31)
    );

    assertEquals(1, result.size());
    final ClerkPaymentReportRowDTO row = result.get(0);
    assertEquals(ORGANIZER_NAME, row.organizer());
    assertEquals("0,00", row.amount());
    assertEquals("KOSKI", row.frSource());
    assertEquals(true, row.frMatriculationExam());
    assertEquals(false, row.frIsForeign());
  }

  @Test
  public void testPaymentOutsideDateRangeExcluded() {
    final long organizerId = createOrganizer(ORGANIZER_OID);
    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    testEntityManager.persist(examSession);
    setOrganizerOnExamSession(examSession.getId(), organizerId);

    final Person person = Factory.person();
    testEntityManager.persist(person);

    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(registration);

    testEntityManager.persist(
      createExamPayment(
        registration,
        new BigDecimal("15300"),
        "YKI-EXAM-outside-range",
        LocalDateTime.of(2026, 2, 15, 10, 0, 0)
      )
    );

    testEntityManager.flush();
    testEntityManager.clear();

    final List<ClerkPaymentReportRowDTO> result = clerkPaymentReportService.getPaymentReport(
      LocalDate.of(2026, 3, 1),
      LocalDate.of(2026, 3, 31)
    );

    assertTrue(result.isEmpty());
  }

  @Test
  public void testSortingByOrganizerThenLastNameThenFirstName() {
    final long organizerId = createOrganizer(ORGANIZER_OID);
    final ExamDate examDate = Factory.examDate();
    testEntityManager.persist(examDate);

    final ExamSession examSession = Factory.examSession(examDate);
    testEntityManager.persist(examSession);
    setOrganizerOnExamSession(examSession.getId(), organizerId);

    final Person personB = new Person();
    personB.setOid("1.2.3.4.6");
    personB.setFirstName("Bertta");
    personB.setLastName("Virtanen");
    testEntityManager.persist(personB);

    final Person personA = new Person();
    personA.setOid("1.2.3.4.7");
    personA.setFirstName("Anna");
    personA.setLastName("Korhonen");
    testEntityManager.persist(personA);

    final Registration regB = Factory.registration(personB);
    regB.setExamSession(examSession);
    regB.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(regB);

    final Registration regA = Factory.registration(personA);
    regA.setExamSession(examSession);
    regA.setState(RegistrationState.COMPLETED);
    testEntityManager.persist(regA);

    testEntityManager.persist(
      createExamPayment(regB, new BigDecimal("15300"), "YKI-EXAM-B", LocalDateTime.of(2026, 3, 10, 10, 0, 0))
    );
    testEntityManager.persist(
      createExamPayment(regA, new BigDecimal("15300"), "YKI-EXAM-A", LocalDateTime.of(2026, 3, 10, 11, 0, 0))
    );

    testEntityManager.flush();
    testEntityManager.clear();

    final List<ClerkPaymentReportRowDTO> result = clerkPaymentReportService.getPaymentReport(
      LocalDate.of(2026, 3, 1),
      LocalDate.of(2026, 3, 31)
    );

    assertEquals(2, result.size());
    assertEquals("Korhonen", result.get(0).lastName());
    assertEquals("Virtanen", result.get(1).lastName());
  }

  private static int paymentCounter = 0;

  private static ExamPayment createExamPayment(
    final Registration registration,
    final BigDecimal amount,
    final String reference,
    final LocalDateTime paidAt
  ) {
    paymentCounter++;
    final ExamPayment payment = new ExamPayment();
    payment.setState(PaymentState.PAID);
    payment.setRegistration(registration);
    payment.setAmount(amount);
    payment.setReference(reference);
    payment.setTransactionId("txn-" + paymentCounter);
    payment.setHref("https://pay.example.com/" + paymentCounter);
    payment.setPaidAt(paidAt);
    return payment;
  }

  private long createOrganizer(final String oid) {
    final EntityManager em = testEntityManager.getEntityManager();
    em
      .createNativeQuery(
        "INSERT INTO organizer (oid, agreement_start_date, agreement_end_date) VALUES (:oid, :startDate, :endDate)"
      )
      .setParameter("oid", oid)
      .setParameter("startDate", LocalDate.of(2020, 1, 1))
      .setParameter("endDate", LocalDate.of(2030, 12, 31))
      .executeUpdate();
    final Number id = (Number) em
      .createNativeQuery("SELECT id FROM organizer WHERE oid = :oid")
      .setParameter("oid", oid)
      .getSingleResult();
    return id.longValue();
  }

  private void setOrganizerOnExamSession(final long examSessionId, final long organizerId) {
    testEntityManager
      .getEntityManager()
      .createNativeQuery("UPDATE exam_session SET organizer_id = :organizerId WHERE id = :examSessionId")
      .setParameter("organizerId", organizerId)
      .setParameter("examSessionId", examSessionId)
      .executeUpdate();
  }
}
