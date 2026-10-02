package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationState;
import jakarta.annotation.Resource;
import java.time.LocalDate;
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
class RegistrationRepositoryTest {

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private TestEntityManager entityManager;

  // Dates are kept several days clear of every boundary in the eligibility window. The query reads
  // the database's current_date and within_dt_range's 10:00/16:00 Helsinki cut-offs, while these
  // fixtures use the JVM's LocalDate.now(), and the two need not agree near midnight.

  @Test
  public void testSessionWithOpenRegistrationIsCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistSessionWithQueue(
      today.minusDays(3),
      today.plusDays(3),
      today.plusDays(30),
      RegistrationState.SUBMITTED
    );

    assertTrue(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testSessionWithClosedRegistrationAndExamOverAWeekAwayIsCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistSessionWithQueue(
      today.minusDays(30),
      today.minusDays(3),
      today.plusDays(10),
      RegistrationState.SUBMITTED
    );

    assertTrue(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testSessionWithClosedRegistrationAndExamUnderAWeekAwayIsNotCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistSessionWithQueue(
      today.minusDays(30),
      today.minusDays(3),
      today.plusDays(4),
      RegistrationState.SUBMITTED
    );

    assertFalse(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testSessionWithRegistrationNotYetOpenIsNotCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistSessionWithQueue(
      today.plusDays(3),
      today.plusDays(10),
      today.plusDays(30),
      RegistrationState.SUBMITTED
    );

    assertFalse(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testSessionWithOnlyStartedQueueRegistrationsIsNotCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistSessionWithQueue(
      today.minusDays(3),
      today.plusDays(3),
      today.plusDays(30),
      RegistrationState.STARTED
    );

    assertFalse(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testSessionWithoutQueueIsNotCandidate() {
    final LocalDate today = LocalDate.now();
    final ExamSession session = persistFullSession(today.minusDays(3), today.plusDays(3), today.plusDays(30));

    assertFalse(registrationRepository.findExamSessionIdsWithQueueToLift().contains(session.getId()));
  }

  @Test
  public void testCountsQueuedAllPartsRegistrationsOnlyInPartialSessions() {
    final LocalDate today = LocalDate.now();
    final ExamSession fullSession = persistSessionWithQueue(
      today.minusDays(3),
      today.plusDays(3),
      today.plusDays(30),
      RegistrationState.SUBMITTED
    );

    final ExamSession partialSession = Factory.examSession(fullSession.getExamDate());
    partialSession.setType(ExamSessionType.READ_SPEAK);
    partialSession.setMaxParticipants(2);
    partialSession.setMaxParticipantsReadListen(1);
    partialSession.setMaxParticipantsSpeakWrite(1);
    entityManager.persist(partialSession);

    final Person admitted = Factory.person();
    admitted.setOid("1.2.3.4.7");
    entityManager.persist(admitted);
    final Registration admission = Factory.registration(admitted);
    admission.setExamSession(partialSession);
    entityManager.persist(admission);

    final Person queuedPerson = Factory.person();
    queuedPerson.setOid("1.2.3.4.8");
    entityManager.persist(queuedPerson);
    final Registration queued = Factory.queuedRegistration(queuedPerson, PartialExamType.ALL_PARTS);
    queued.setExamSession(partialSession);
    entityManager.persist(queued);
    entityManager.flush();

    assertEquals(0, registrationRepository.countUnliftableQueuedRegistrations(fullSession.getId()));
    assertEquals(1, registrationRepository.countUnliftableQueuedRegistrations(partialSession.getId()));
  }

  /**
   * A FULL session of one place, already taken by an admission, so that participant_limit_trigger
   * accepts a queued registration after it.
   */
  private ExamSession persistFullSession(
    final LocalDate registrationStartDate,
    final LocalDate registrationEndDate,
    final LocalDate examDate
  ) {
    final ExamDate date = Factory.examDate();
    date.setRegistrationStartDate(registrationStartDate);
    date.setRegistrationEndDate(registrationEndDate);
    date.setExamDate(examDate);
    entityManager.persist(date);

    final ExamSession session = Factory.examSession(date);
    session.setMaxParticipants(1);
    entityManager.persist(session);

    final Person person = Factory.person();
    entityManager.persist(person);
    final Registration admission = Factory.registration(person);
    admission.setExamSession(session);
    entityManager.persist(admission);
    entityManager.flush();

    return session;
  }

  private ExamSession persistSessionWithQueue(
    final LocalDate registrationStartDate,
    final LocalDate registrationEndDate,
    final LocalDate examDate,
    final RegistrationState queuedState
  ) {
    final ExamSession session = persistFullSession(registrationStartDate, registrationEndDate, examDate);

    final Person person = Factory.person();
    person.setOid("1.2.3.4.6");
    entityManager.persist(person);
    final Registration queued = Factory.queuedRegistration(person, PartialExamType.ALL_PARTS);
    queued.setExamSession(session);
    queued.setState(queuedState);
    entityManager.persist(queued);
    entityManager.flush();

    return session;
  }
}
