package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.EmailRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.RegistrationQueueService;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * One run end to end, with the real email service. The handler is constructed here rather than
 * enabled by property, which would also let the scheduler run it in the background.
 *
 * <p>Fixtures are committed, because the session loop refuses to run inside a transaction, and are
 * deleted afterwards since nothing rolls them back.
 */
@SpringBootTest
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class RegistrationQueueHandlerIntegrationTest {

  private static final String RECIPIENT = "jonossa.handler@example.com";

  @Resource
  private RegistrationRepository registrationRepository;

  @Resource
  private RegistrationQueueService registrationQueueService;

  @Resource
  private EmailRepository emailRepository;

  @Resource
  private EntityManager entityManager;

  @Resource
  private JdbcTemplate jdbcTemplate;

  @Resource
  private PlatformTransactionManager transactionManager;

  @Test
  void testRunLiftsQueuedRegistrationAndSendsPaymentEmail() {
    final Registration[] fixture = new TransactionTemplate(transactionManager).execute(status -> persistFixture());
    final Registration queued = fixture[1];
    final long examSessionId = queued.getExamSession().getId();

    try {
      new RegistrationQueueHandler(registrationRepository, registrationQueueService).action();

      assertEquals(
        List.of("ADMISSION", "SUBMITTED"),
        jdbcTemplate.queryForObject(
          "SELECT kind::text, state::text FROM registration WHERE id = ?",
          (rs, i) -> List.of(rs.getString(1), rs.getString(2)),
          queued.getId()
        )
      );
      assertEquals(
        1,
        jdbcTemplate.queryForObject(
          "SELECT COUNT(*) FROM registration_change_event WHERE registration_id = ? AND event = 'LIFT_FROM_QUEUE'",
          Integer.class,
          queued.getId()
        )
      );
      assertEquals(
        1,
        jdbcTemplate.queryForObject(
          "SELECT COUNT(*) FROM login_link WHERE registration_id = ? AND type = 'PAYMENT'",
          Integer.class,
          queued.getId()
        )
      );
      final List<Email> emails = emailsToRecipient();
      assertEquals(1, emails.size());
      assertEquals(EmailType.PAYMENT_FROM_QUEUE, emails.get(0).getEmailType());
    } finally {
      emailRepository.deleteAll(emailsToRecipient());
      jdbcTemplate.update("DELETE FROM login_link WHERE registration_id = ?", queued.getId());
      jdbcTemplate.update("DELETE FROM registration_change_event WHERE exam_session_id = ?", examSessionId);
      jdbcTemplate.update("DELETE FROM registration WHERE exam_session_id = ?", examSessionId);
      jdbcTemplate.update("DELETE FROM exam_session_location WHERE exam_session_id = ?", examSessionId);
      jdbcTemplate.update("DELETE FROM exam_session WHERE id = ?", examSessionId);
      jdbcTemplate.update("DELETE FROM exam_date WHERE id = ?", queued.getExamSession().getExamDate().getId());
      jdbcTemplate.update("DELETE FROM participant WHERE id = ?", queued.getParticipant().getId());
      jdbcTemplate.update(
        "DELETE FROM person WHERE oid IN (?, ?)",
        fixture[0].getPerson().getOid(),
        queued.getPerson().getOid()
      );
    }
  }

  /** A full one-place session with a queued registration behind it, then the place freed. */
  private Registration[] persistFixture() {
    final LocalDate today = LocalDate.now();
    final ExamDate examDate = Factory.examDate();
    examDate.setRegistrationStartDate(today.minusDays(10));
    examDate.setRegistrationEndDate(today.plusDays(10));
    examDate.setExamDate(today.plusDays(30));
    entityManager.persist(examDate);

    final ExamSession session = Factory.examSession(examDate);
    session.setMaxParticipants(1);
    session.getLocations().addAll(Factory.examSessionLocations(session));
    entityManager.persist(session);

    final Person admittedPerson = Factory.person();
    admittedPerson.setOid("1.2.3.4.200.1");
    entityManager.persist(admittedPerson);
    final Registration admission = Factory.registration(admittedPerson);
    admission.setExamSession(session);
    entityManager.persist(admission);
    entityManager.flush();

    final Person queuedPerson = Factory.person();
    queuedPerson.setOid("1.2.3.4.200.2");
    queuedPerson.setEmail(RECIPIENT);
    entityManager.persist(queuedPerson);
    final Participant participant = Factory.participant(RECIPIENT);
    entityManager.persist(participant);
    final Registration queued = Factory.queuedRegistration(queuedPerson, PartialExamType.ALL_PARTS);
    queued.setExamSession(session);
    queued.setParticipant(participant);
    entityManager.persist(queued);
    entityManager.flush();

    admission.setState(RegistrationState.CANCELLED);
    entityManager.flush();

    return new Registration[] { admission, queued };
  }

  private List<Email> emailsToRecipient() {
    return emailRepository.findAll().stream().filter(email -> RECIPIENT.equals(email.getRecipientAddress())).toList();
  }
}
