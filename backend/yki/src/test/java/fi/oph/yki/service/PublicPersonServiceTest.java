package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.api.dto.PublicPersonRegistrationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.EvaluationState;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
public class PublicPersonServiceTest {

  private static final String OID = "1.2.3.4.5";

  @Resource
  private PersonRepository personRepository;

  @Resource
  private RegistrationRepository registrationRepository;

  @MockitoBean
  private AuditService auditService;

  @Resource
  private TestEntityManager entityManager;

  private PublicPersonService publicPersonService;

  private Person person;

  @BeforeEach
  public void setup() {
    publicPersonService = new PublicPersonService(personRepository, registrationRepository);

    person = Factory.person();
    person.setEmail("testi@example.com");
    person.setPhoneNumber("0401234567");
    person.setSteetAddress("Testikatu 1");
    person.setPostOffice("Helsinki");
    person.setZip("00100");
    person.setCountryCode("FIN");
    entityManager.persist(person);
  }

  private ExamSession createExamSession(final LocalDate examDate) {
    final ExamDate date = Factory.examDate();
    date.setExamDate(examDate);
    date.setRegistrationStartDate(examDate.minusMonths(3));
    date.setRegistrationEndDate(examDate.minusMonths(1));
    entityManager.persist(date);

    final ExamSession examSession = Factory.examSession(date);
    examSession.setStartTimeReadListen("09:00");
    examSession.setStartTimeSpeakWrite("13:00");
    entityManager.persist(examSession);
    entityManager.persist(Factory.examSessionLocation(examSession));

    return examSession;
  }

  private Registration createRegistration(
    final Person person,
    final ExamSession examSession,
    final RegistrationState state,
    final RegistrationKind kind,
    final LocalDateTime createdAt
  ) {
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(state);
    registration.setKind(kind);
    registration.setCreatedAt(createdAt);
    entityManager.persist(registration);

    return registration;
  }

  private void flushAndClear() {
    entityManager.flush();
    entityManager.clear();
  }

  @Test
  public void testGetPerson() {
    final LocalDate examDate = LocalDate.now().plusMonths(2);
    final ExamSession examSession = createExamSession(examDate);
    final Registration registration = createRegistration(
      person,
      examSession,
      RegistrationState.COMPLETED,
      RegistrationKind.ADMISSION,
      LocalDateTime.of(2026, 4, 1, 10, 0)
    );
    registration.setExpiresAt(LocalDateTime.of(2026, 4, 8, 10, 0));
    registration.setExamFee(140);
    entityManager.persist(Factory.examPayment(registration));
    entityManager.persist(Factory.freeRegistration(registration));
    entityManager.persist(Factory.registrationEvaluation(registration));
    flushAndClear();

    final PublicPersonDTO result = publicPersonService.getPerson(OID);

    assertEquals(OID, result.oid());
    assertEquals("Testi", result.firstName());
    assertEquals("Henkilö", result.lastName());
    assertEquals("testi@example.com", result.email());
    assertEquals("0401234567", result.phoneNumber());
    assertEquals("Testikatu 1", result.streetAddress());
    assertEquals("Helsinki", result.postOffice());
    assertEquals("00100", result.zip());
    assertEquals("FIN", result.countryCode());
    assertEquals(1, result.registrations().size());

    final PublicPersonRegistrationDTO dto = result.registrations().get(0);
    assertEquals(registration.getId(), dto.id());
    assertEquals(examSession.getId(), dto.examSessionId());
    assertEquals(RegistrationState.COMPLETED, dto.state());
    assertEquals(RegistrationKind.ADMISSION, dto.kind());
    assertEquals(PartialExamType.ALL_PARTS, dto.partialExamType());
    assertEquals(examDate, dto.examDate());
    assertEquals("fin", dto.languageCode());
    assertEquals("PERUS", dto.levelCode());
    assertEquals(ExamSessionType.FULL, dto.type());
    assertEquals("09:00", dto.startTimeReadListen());
    assertEquals("13:00", dto.startTimeSpeakWrite());
    assertEquals(examDate.minusMonths(3), dto.registrationStartDate());
    assertEquals(examDate.minusMonths(1), dto.registrationEndDate());
    assertEquals(EvaluationState.EVALUATION_PENDING, dto.evaluationState());
    assertEquals(1, dto.location().size());
    assertEquals("Testipaikka", dto.location().get(0).name());
    assertEquals("Testikatu 1", dto.location().get(0).streetAddress());
    assertEquals("Helsinki", dto.location().get(0).postOffice());
    assertEquals("00100", dto.location().get(0).zip());
    assertEquals("fi", dto.location().get(0).lang());
    assertEquals(LocalDateTime.of(2026, 4, 1, 12, 0), dto.paidAt());
    assertEquals(LocalDate.of(2026, 4, 8), dto.expiresAt());
    assertEquals(140, dto.examFee());
    assertTrue(dto.isTransferable());
    assertTrue(dto.isCancellable());
    assertFalse(dto.isTransfered());
    assertNull(dto.liftedFromQueueAt());
    assertTrue(dto.isFreeRegistration());
    assertNull(dto.positionInQueue());
  }

  @Test
  public void testGetPersonPastExamIsNotCancellableOrTransferable() {
    final ExamSession examSession = createExamSession(LocalDate.now().minusMonths(2));
    createRegistration(
      person,
      examSession,
      RegistrationState.COMPLETED,
      RegistrationKind.ADMISSION,
      LocalDateTime.of(2026, 4, 1, 10, 0)
    );
    flushAndClear();

    final PublicPersonRegistrationDTO dto = publicPersonService.getPerson(OID).registrations().get(0);

    assertFalse(dto.isCancellable());
    assertFalse(dto.isTransferable());
    assertFalse(dto.isFreeRegistration());
    assertNull(dto.evaluationState());
    assertNull(dto.paidAt());
  }

  @Test
  public void testGetPersonQueuePosition() {
    final ExamSession examSession = createExamSession(LocalDate.now().plusMonths(2));
    examSession.setMaxParticipants(0);
    entityManager.flush();
    final Person first = Factory.person();
    first.setOid("1.2.3.4.6");
    entityManager.persist(first);
    final Person second = Factory.person();
    second.setOid("1.2.3.4.7");
    entityManager.persist(second);

    createRegistration(
      first,
      examSession,
      RegistrationState.SUBMITTED,
      RegistrationKind.QUEUE,
      LocalDateTime.of(2026, 4, 1, 10, 0)
    );
    createRegistration(
      second,
      examSession,
      RegistrationState.CANCELLED,
      RegistrationKind.QUEUE,
      LocalDateTime.of(2026, 4, 1, 11, 0)
    );
    createRegistration(
      person,
      examSession,
      RegistrationState.SUBMITTED,
      RegistrationKind.QUEUE,
      LocalDateTime.of(2026, 4, 1, 12, 0)
    );
    flushAndClear();

    final List<PublicPersonRegistrationDTO> registrations = publicPersonService.getPerson(OID).registrations();

    assertEquals(1, registrations.size());
    assertEquals(1, registrations.get(0).positionInQueue());
  }

  @Test
  public void testGetPersonLeavesOutStartedAndOldRegistrations() {
    final ExamSession upcoming = createExamSession(LocalDate.now().plusMonths(2));
    final ExamSession old = createExamSession(LocalDate.now().minusYears(2));
    createRegistration(
      person,
      upcoming,
      RegistrationState.STARTED,
      RegistrationKind.ADMISSION,
      LocalDateTime.of(2026, 4, 1, 10, 0)
    );
    createRegistration(
      person,
      old,
      RegistrationState.COMPLETED,
      RegistrationKind.ADMISSION,
      LocalDateTime.of(2024, 4, 1, 10, 0)
    );
    flushAndClear();

    assertTrue(publicPersonService.getPerson(OID).registrations().isEmpty());
  }

  @Test
  public void testGetPersonWithoutEmailThrowsNotFound() {
    person.setEmail(null);
    flushAndClear();

    assertThrows(NotFoundException.class, () -> publicPersonService.getPerson(OID));
  }

  @Test
  public void testGetPersonUnknownOidThrowsNotFound() {
    flushAndClear();

    assertThrows(NotFoundException.class, () -> publicPersonService.getPerson("9.9.9"));
  }
}
