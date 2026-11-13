package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.annotation.Resource;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(PostgresTestcontainerConfig.class)
class FreeRegistrationRepositoryTest {

  private static final Set<FreeRegistrationSource> EDUCATION_SOURCES = Set.of(
    FreeRegistrationSource.KOSKI,
    FreeRegistrationSource.USER
  );

  @Resource
  private FreeRegistrationRepository freeRegistrationRepository;

  @Resource
  private TestEntityManager entityManager;

  private ExamDate examDate;
  private Person person;
  private ExamSession currentExamSession;

  @BeforeEach
  public void setup() {
    examDate = entityManager.persist(Factory.examDate());
    person = entityManager.persist(Factory.person());
    currentExamSession = persistExamSession();
  }

  @Test
  public void testPartialExamsInSameExamSessionAreCountedOnce() {
    final ExamSession examSession = persistExamSession();
    persistFreeRegistration(examSession, RegistrationState.COMPLETED, PartialExamType.SPEAK);
    persistFreeRegistration(examSession, RegistrationState.COMPLETED, PartialExamType.WRITE);

    assertEquals(1, count(EDUCATION_SOURCES));
  }

  @Test
  public void testEachExamSessionIsCounted() {
    persistFreeRegistration(persistExamSession(), RegistrationState.COMPLETED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(persistExamSession(), RegistrationState.COMPLETED, PartialExamType.SPEAK);
    persistFreeRegistration(persistExamSession(), RegistrationState.STARTED, PartialExamType.WRITE);

    assertEquals(3, count(EDUCATION_SOURCES));
  }

  @Test
  public void testCurrentExamSessionIsNotCounted() {
    persistFreeRegistration(persistExamSession(), RegistrationState.COMPLETED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(currentExamSession, RegistrationState.COMPLETED, PartialExamType.SPEAK);
    persistFreeRegistration(currentExamSession, RegistrationState.STARTED, PartialExamType.WRITE);

    assertEquals(1, count(EDUCATION_SOURCES));
  }

  @Test
  public void testStartedCompletedAndQueuedRegistrationsAreCounted() {
    persistFreeRegistration(persistExamSession(), RegistrationState.STARTED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(persistExamSession(), RegistrationState.COMPLETED, PartialExamType.ALL_PARTS);
    final Registration queued = persistFreeRegistration(
      persistExamSession(),
      RegistrationState.SUBMITTED,
      PartialExamType.ALL_PARTS
    );
    queued.setKind(RegistrationKind.QUEUE);
    entityManager.flush();

    assertEquals(3, count(EDUCATION_SOURCES));
  }

  @Test
  public void testOtherRegistrationStatesAreNotCounted() {
    persistFreeRegistration(persistExamSession(), RegistrationState.SUBMITTED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(persistExamSession(), RegistrationState.EXPIRED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(persistExamSession(), RegistrationState.CANCELLED, PartialExamType.ALL_PARTS);
    persistFreeRegistration(persistExamSession(), RegistrationState.PAID_AND_CANCELLED, PartialExamType.ALL_PARTS);

    assertEquals(0, count(EDUCATION_SOURCES));
  }

  @Test
  public void testOnlyGivenSourcesAreCounted() {
    persistFreeRegistration(persistExamSession(), RegistrationState.COMPLETED, PartialExamType.ALL_PARTS);

    assertEquals(0, count(Set.of(FreeRegistrationSource.USER)));
    assertEquals(1, count(Set.of(FreeRegistrationSource.KOSKI)));
  }

  @Test
  public void testOtherPersonsRegistrationsAreNotCounted() {
    final Person otherPerson = Factory.person();
    otherPerson.setOid("1.2.3.4.6");
    entityManager.persist(otherPerson);
    final Registration registration = Factory.registration(otherPerson);
    registration.setExamSession(persistExamSession());
    registration.setState(RegistrationState.COMPLETED);
    entityManager.persist(registration);
    entityManager.persist(Factory.freeRegistration(registration));

    assertEquals(0, count(EDUCATION_SOURCES));
  }

  private long count(final Set<FreeRegistrationSource> sources) {
    return freeRegistrationRepository.countExamSessionsWithEducationFreeRegistration(
      person.getOid(),
      sources,
      currentExamSession.getId()
    );
  }

  private ExamSession persistExamSession() {
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setLevel("YLIN");
    return entityManager.persist(examSession);
  }

  private Registration persistFreeRegistration(
    final ExamSession examSession,
    final RegistrationState state,
    final PartialExamType partialExamType
  ) {
    final Registration registration = Factory.registration(person);
    registration.setExamSession(examSession);
    registration.setState(state);
    registration.setPartialExamType(partialExamType);
    entityManager.persist(registration);
    entityManager.persist(Factory.freeRegistration(registration));

    return registration;
  }
}
