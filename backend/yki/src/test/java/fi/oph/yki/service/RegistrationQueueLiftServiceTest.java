package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.RegistrationChangeEventRepository;
import fi.oph.yki.repository.RegistrationQueueLiftRepositoryImpl;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.RegistrationQueueLiftService.Outcome;
import jakarta.annotation.Resource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ PostgresTestcontainerConfig.class, RegistrationQueueLiftService.class, RegistrationQueueService.class })
class RegistrationQueueLiftServiceTest {

  // Imported rather than constructed, so that its @Transactional proxy is what is under test.
  @Resource
  private RegistrationQueueLiftService registrationQueueLiftService;

  @Resource
  private RegistrationQueueService registrationQueueService;

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private RegistrationChangeEventRepository registrationChangeEventRepository;

  @MockitoBean
  private RegistrationEmailService registrationEmailService;

  @Resource
  private TestEntityManager entityManager;

  @Resource
  private DataSource dataSource;

  @Resource
  private JdbcTemplate jdbcTemplate;

  @Resource
  private PlatformTransactionManager transactionManager;

  private int personCount = 0;

  // Inside the test transaction for most tests, so rolled back with it. The NOT_SUPPORTED tests
  // commit both, which is why the flag is put back afterwards rather than left to the rollback.
  @BeforeEach
  void makeThisBackendTheQueueOwner() {
    setQueueOwner(RuntimeFlag.OWNER_JAVA);
  }

  @AfterEach
  void restoreLegacyAsTheQueueOwner() {
    setQueueOwner(RuntimeFlag.OWNER_LEGACY);
  }

  @Test
  public void testLiftsOldestQueuedRegistrationFirst() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration newer = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 2, 10, 0));
    final Registration older = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(older).getKind());
    assertEquals(RegistrationKind.QUEUE, reload(newer).getKind());
  }

  @Test
  public void testLiftsOnlyOneRegistrationPerCall() {
    final ExamSession session = persistFullSession(2);
    final Registration admission1 = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration admission2 = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued1 = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    final Registration queued2 = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 2, 10, 0));
    cancel(admission1);
    cancel(admission2);

    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(queued1).getKind());
    assertEquals(RegistrationKind.QUEUE, reload(queued2).getKind());
  }

  @Test
  public void testDoesNotLiftBeyondCapacity() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued1 = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    final Registration queued2 = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 2, 10, 0));
    cancel(admission);

    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));
    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(queued1).getKind());
    assertEquals(RegistrationKind.QUEUE, reload(queued2).getKind());
  }

  @Test
  public void testNothingToLiftWhenSessionIsFull() {
    final ExamSession session = persistFullSession(1);
    persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
    verifyNoInteractions(registrationEmailService);
  }

  @Test
  public void testNothingToLiftWhenQueueIsEmpty() {
    final ExamSession session = persistFullSession(1);

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    verifyNoInteractions(registrationEmailService);
  }

  @Test
  public void testFullSessionDoesNotLiftSingleSubtestRegistration() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.READ, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
  }

  @Test
  public void testPartialSessionDoesNotLiftAllPartsRegistration() {
    final ExamSession session = persistPartialSession(ExamSessionType.READ_SPEAK, 1, 1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
  }

  @Test
  public void testListenWriteSessionLiftsEachSubtestIntoItsOwnPool() {
    final ExamSession session = persistPartialSession(ExamSessionType.LISTEN_WRITE, 1, 1);
    final Registration listenAdmission = persistAdmission(session, PartialExamType.LISTEN);
    final Registration writeAdmission = persistAdmission(session, PartialExamType.WRITE);
    final Registration queuedListen = persistQueued(
      session,
      PartialExamType.LISTEN,
      LocalDateTime.of(2026, 4, 2, 10, 0)
    );
    final Registration queuedWrite = persistQueued(session, PartialExamType.WRITE, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(listenAdmission);

    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));
    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(queuedListen).getKind());
    assertEquals(RegistrationKind.QUEUE, reload(queuedWrite).getKind());

    cancel(writeAdmission);
    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(queuedWrite).getKind());
  }

  @Test
  public void testDoesNotLiftStartedQueueRegistration() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    queued.setState(RegistrationState.STARTED);
    cancel(admission);

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
  }

  @Test
  public void testPartialSessionLiftsOnlyIntoThePoolWithAFreePlace() {
    final ExamSession session = persistPartialSession(ExamSessionType.READ_SPEAK, 1, 1);
    persistAdmission(session, PartialExamType.READ);
    final Registration speakAdmission = persistAdmission(session, PartialExamType.SPEAK);
    final Registration queuedRead = persistQueued(session, PartialExamType.READ, LocalDateTime.of(2026, 4, 1, 10, 0));
    final Registration queuedSpeak = persistQueued(session, PartialExamType.SPEAK, LocalDateTime.of(2026, 4, 2, 10, 0));
    cancel(speakAdmission);

    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));
    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queuedRead).getKind());
    assertEquals(RegistrationKind.ADMISSION, reload(queuedSpeak).getKind());
  }

  @Test
  public void testAllPartsAdmissionTakesAPlaceInBothPools() {
    final ExamSession session = persistPartialSession(ExamSessionType.READ_SPEAK, 1, 1);
    final Registration allParts = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queuedRead = persistQueued(session, PartialExamType.READ, LocalDateTime.of(2026, 4, 1, 10, 0));
    final Registration queuedSpeak = persistQueued(session, PartialExamType.SPEAK, LocalDateTime.of(2026, 4, 2, 10, 0));

    assertEquals(Outcome.NOTHING_TO_LIFT, registrationQueueLiftService.liftNext(session.getId()));

    cancel(allParts);
    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));
    assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(session.getId()));

    assertEquals(RegistrationKind.ADMISSION, reload(queuedRead).getKind());
    assertEquals(RegistrationKind.ADMISSION, reload(queuedSpeak).getKind());
  }

  @Test
  public void testPaidLiftIsSubmittedWithNewExpiryAndSendsPaymentEmail() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    registrationQueueLiftService.liftNext(session.getId());

    final Registration lifted = reload(queued);
    assertEquals(RegistrationKind.ADMISSION, lifted.getKind());
    assertEquals(RegistrationState.SUBMITTED, lifted.getState());
    assertNotNull(lifted.getLiftedFromQueueAt());
    assertNotNull(lifted.getModifiedAt());
    // Compared in the database, so that neither the JVM nor the connection time zone takes part.
    assertTrue(
      jdbcTemplate.queryForObject(
        "SELECT expires_at = at_midnight((current_date + '1 day'::interval)::date) FROM registration WHERE id = ?",
        Boolean.class,
        queued.getId()
      )
    );

    verify(registrationEmailService).sendLiftedFromQueueEmail(lifted);
    verify(registrationEmailService, never()).sendLiftedFromQueueForFreeEmail(any());
  }

  @Test
  public void testFreeLiftIsCompletedWithExpiryUntouchedAndSendsFreeEmail() {
    final LocalDateTime originalExpiry = LocalDateTime.of(2026, 5, 1, 12, 0);
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    queued.setExpiresAt(originalExpiry);
    final FreeRegistration freeRegistration = Factory.freeRegistration(queued);
    entityManager.persist(freeRegistration);
    cancel(admission);

    registrationQueueLiftService.liftNext(session.getId());

    final Registration lifted = reload(queued);
    assertEquals(RegistrationKind.ADMISSION, lifted.getKind());
    assertEquals(RegistrationState.COMPLETED, lifted.getState());
    assertEquals(originalExpiry, lifted.getExpiresAt());
    assertNotNull(lifted.getLiftedFromQueueAt());

    verify(registrationEmailService).sendLiftedFromQueueForFreeEmail(lifted);
    verify(registrationEmailService, never()).sendLiftedFromQueueEmail(any());
  }

  @Test
  public void testWritesChangeEventWithPostLiftKindAndState() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    registrationQueueLiftService.liftNext(session.getId());

    final List<RegistrationChangeEvent> events = registrationChangeEventRepository
      .findAll()
      .stream()
      .filter(event -> event.getRegistrationId() == queued.getId())
      .toList();
    assertEquals(1, events.size());
    final RegistrationChangeEvent event = events.get(0);
    assertEquals("LIFT_FROM_QUEUE", event.getEvent());
    assertEquals(RegistrationKind.ADMISSION, event.getRegistrationKind());
    assertEquals(RegistrationState.SUBMITTED, event.getRegistrationState());
    assertEquals(session.getId(), event.getExamSessionId());
    assertNull(event.getOriginalExamSessionId());
    assertEquals("AUTOMATION", event.getAuthorType());
    assertNull(event.getCreatedBy());
    assertNotNull(event.getCreatedAt());
  }

  @Test
  public void testSessionLoopRefusesToRunInsideATransaction() {
    final ExamSession session = persistFullSession(1);

    assertThrows(
      IllegalTransactionStateException.class,
      () -> registrationQueueService.liftFromQueue(session.getId(), 1)
    );
  }

  @Test
  public void testSessionLockedByAnotherTransactionLiftsNothing() throws Exception {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);

    try (Connection otherWorker = dataSource.getConnection()) {
      otherWorker.setAutoCommit(false);
      try (PreparedStatement lock = otherWorker.prepareStatement("SELECT pg_advisory_xact_lock(?, ?)")) {
        lock.setInt(1, RegistrationQueueLiftRepositoryImpl.QUEUE_LIFT_LOCK_NAMESPACE);
        lock.setInt(2, Math.toIntExact(session.getId()));
        lock.execute();
      }

      try {
        assertEquals(Outcome.SESSION_LOCKED, registrationQueueLiftService.liftNext(session.getId()));
      } finally {
        otherWorker.rollback();
      }
    }

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
    verifyNoInteractions(registrationEmailService);
  }

  @Test
  public void testLegacyOwnerLiftsNothing() {
    final Registration queued = persistLiftableRegistration();
    setQueueOwner(RuntimeFlag.OWNER_LEGACY);

    assertEquals(Outcome.NOT_OWNER, registrationQueueLiftService.liftNext(queued.getExamSession().getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
    verifyNoInteractions(registrationEmailService);
  }

  @Test
  public void testMissingOwnerFlagLiftsNothing() {
    final Registration queued = persistLiftableRegistration();
    jdbcTemplate.update("DELETE FROM runtime_flag WHERE name = ?", RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER);

    assertEquals(Outcome.NOT_OWNER, registrationQueueLiftService.liftNext(queued.getExamSession().getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
  }

  @Test
  public void testUnrecognisedOwnerLiftsNothing() {
    final Registration queued = persistLiftableRegistration();
    setQueueOwner("JAVE");

    assertEquals(Outcome.NOT_OWNER, registrationQueueLiftService.liftNext(queued.getExamSession().getId()));

    assertEquals(RegistrationKind.QUEUE, reload(queued).getKind());
  }

  // The owner check is only safe if switching the owner cannot slip in under a lift that has already
  // decided it owns the queue. Committed fixtures, because the lift's transaction has to be held
  // open while a second connection tries the switch.
  @Test
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  public void testSwitchingOwnerWaitsForInFlightLift() throws Exception {
    final TransactionTemplate transaction = new TransactionTemplate(transactionManager);
    final Registration[] fixture = transaction.execute(status -> persistLiftableFixture());
    final long examSessionId = fixture[1].getExamSession().getId();

    try {
      transaction.executeWithoutResult(status -> {
        assertEquals(Outcome.LIFTED, registrationQueueLiftService.liftNext(examSessionId));

        final SQLException blocked = assertThrows(SQLException.class, () -> trySwitchOwnerTo(RuntimeFlag.OWNER_LEGACY));
        assertEquals("55P03", blocked.getSQLState());
      });

      trySwitchOwnerTo(RuntimeFlag.OWNER_LEGACY);
      assertEquals(
        RuntimeFlag.OWNER_LEGACY,
        jdbcTemplate.queryForObject(
          "SELECT value FROM runtime_flag WHERE name = ?",
          String.class,
          RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER
        )
      );
    } finally {
      deleteCommittedFixture(fixture);
    }
  }

  // Needs committed fixtures: inside the usual test transaction, the service would join it and a
  // rollback could not be observed. Cleans up after itself since nothing rolls this data back.
  @Test
  @Transactional(propagation = Propagation.NOT_SUPPORTED)
  public void testEmailFailureRollsBackTheLift() {
    final TransactionTemplate transaction = new TransactionTemplate(transactionManager);
    final Registration[] fixture = transaction.execute(status -> persistLiftableFixture());
    final long examSessionId = fixture[0].getExamSession().getId();

    try {
      doThrow(new RuntimeException("email failed")).when(registrationEmailService).sendLiftedFromQueueEmail(any());

      final RuntimeException thrown = assertThrows(
        RuntimeException.class,
        () -> registrationQueueLiftService.liftNext(examSessionId)
      );
      assertEquals("email failed", thrown.getMessage());

      assertEquals(
        "QUEUE",
        jdbcTemplate.queryForObject(
          "SELECT kind::text FROM registration WHERE id = ?",
          String.class,
          fixture[1].getId()
        )
      );
      assertEquals(
        0,
        jdbcTemplate.queryForObject(
          "SELECT COUNT(*) FROM registration_change_event WHERE registration_id = ?",
          Integer.class,
          fixture[1].getId()
        )
      );
    } finally {
      deleteCommittedFixture(fixture);
    }
  }

  /** One full session whose only place has just been freed, and one registration queued for it. */
  private Registration[] persistLiftableFixture() {
    final ExamSession session = persistFullSession(1);
    final Registration admission = persistAdmission(session, PartialExamType.ALL_PARTS);
    final Registration queued = persistQueued(session, PartialExamType.ALL_PARTS, LocalDateTime.of(2026, 4, 1, 10, 0));
    cancel(admission);
    return new Registration[] { admission, queued };
  }

  private Registration persistLiftableRegistration() {
    return persistLiftableFixture()[1];
  }

  private void deleteCommittedFixture(final Registration[] fixture) {
    final ExamSession session = fixture[0].getExamSession();
    jdbcTemplate.update("DELETE FROM registration_change_event WHERE exam_session_id = ?", session.getId());
    jdbcTemplate.update("DELETE FROM registration WHERE exam_session_id = ?", session.getId());
    jdbcTemplate.update("DELETE FROM exam_session WHERE id = ?", session.getId());
    jdbcTemplate.update("DELETE FROM exam_date WHERE id = ?", session.getExamDate().getId());
    jdbcTemplate.update(
      "DELETE FROM person WHERE oid IN (?, ?)",
      fixture[0].getPerson().getOid(),
      fixture[1].getPerson().getOid()
    );
  }

  private void setQueueOwner(final String owner) {
    jdbcTemplate.update(
      "UPDATE runtime_flag SET value = ? WHERE name = ?",
      owner,
      RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER
    );
  }

  /** From a connection of its own, as the manual switch would be, failing fast if it has to wait. */
  private void trySwitchOwnerTo(final String owner) throws SQLException {
    try (Connection operator = dataSource.getConnection()) {
      operator.setAutoCommit(true);
      try (Statement statement = operator.createStatement()) {
        statement.execute("SET lock_timeout = '1s'");
      }
      try (PreparedStatement update = operator.prepareStatement("UPDATE runtime_flag SET value = ? WHERE name = ?")) {
        update.setString(1, owner);
        update.setString(2, RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER);
        update.executeUpdate();
      }
    }
  }

  private ExamSession persistFullSession(final int maxParticipants) {
    final ExamDate examDate = Factory.examDate();
    entityManager.persist(examDate);

    final ExamSession session = Factory.examSession(examDate);
    session.setMaxParticipants(maxParticipants);
    entityManager.persist(session);

    return session;
  }

  private ExamSession persistPartialSession(
    final ExamSessionType type,
    final int maxReadListen,
    final int maxSpeakWrite
  ) {
    final ExamDate examDate = Factory.examDate();
    entityManager.persist(examDate);

    final ExamSession session = Factory.examSession(examDate);
    session.setType(type);
    session.setMaxParticipants(maxReadListen + maxSpeakWrite);
    session.setMaxParticipantsReadListen(maxReadListen);
    session.setMaxParticipantsSpeakWrite(maxSpeakWrite);
    entityManager.persist(session);

    return session;
  }

  private Registration persistAdmission(final ExamSession session, final PartialExamType partialExamType) {
    final Registration registration = Factory.registration(persistPerson());
    registration.setExamSession(session);
    registration.setPartialExamType(partialExamType);
    entityManager.persist(registration);
    entityManager.flush();

    return registration;
  }

  /** participant_limit_trigger only accepts this once the relevant pool is full. */
  private Registration persistQueued(
    final ExamSession session,
    final PartialExamType partialExamType,
    final LocalDateTime createdAt
  ) {
    final Registration registration = Factory.queuedRegistration(persistPerson(), partialExamType);
    registration.setExamSession(session);
    registration.setCreatedAt(createdAt);
    entityManager.persist(registration);
    entityManager.flush();

    return registration;
  }

  /** Frees a place after the queue is populated, since the trigger only allows queueing into a full pool. */
  private void cancel(final Registration admission) {
    admission.setState(RegistrationState.CANCELLED);
    entityManager.flush();
  }

  private Person persistPerson() {
    final Person person = Factory.person();
    person.setOid("1.2.3.4.100." + personCount++);
    entityManager.persist(person);

    return person;
  }

  private Registration reload(final Registration registration) {
    return registrationRepository.findById(registration.getId()).orElseThrow();
  }
}
