package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;
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
public class ParticipantOnrRepositoryTest {

  private static final String PERSON_OID = "1.2.3.4.5";

  @Resource
  private ParticipantOnrRepository participantOnrRepository;

  @Resource
  private TestEntityManager entityManager;

  private ExamSession examSession;

  @BeforeEach
  public void setup() {
    final ExamDate examDate = Factory.examDate();
    examSession = Factory.examSession(examDate);

    entityManager.persist(examDate);
    entityManager.persist(examSession);
  }

  @Test
  public void testSelectsPersonWithoutOnrRowAfterOneHour() {
    final Registration registration = persistRegistration(LocalDateTime.now().minusHours(2));

    final List<ParticipantOnrCheckProjection> participants = findParticipantsForOnrCheck();

    assertEquals(1, participants.size());
    assertEquals(PERSON_OID, participants.get(0).getPersonOid());
    assertEquals(registration.getParticipant().getId(), participants.get(0).getParticipantId());
  }

  @Test
  public void testSkipsPersonWithoutOnrRowWithinOneHour() {
    persistRegistration(LocalDateTime.now().minusMinutes(30));

    assertEquals(List.of(), findParticipantsForOnrCheck());
  }

  @Test
  public void testSkipsRegistrationWithoutPerson() {
    final Participant participant = Factory.participant("test@example.com");
    final Registration registration = Factory.registration(null);
    registration.setParticipant(participant);
    registration.setExamSession(examSession);
    registration.setCreatedAt(LocalDateTime.now().minusHours(2));

    entityManager.persist(participant);
    entityManager.persist(registration);

    assertEquals(List.of(), findParticipantsForOnrCheck());
  }

  @Test
  public void testSelectsNotIndividualisedPersonAfterOneDay() {
    final Registration registration = persistRegistration(LocalDateTime.now().minusDays(3));
    persistParticipantOnr(registration, false, LocalDateTime.now().minusDays(2));

    final List<ParticipantOnrCheckProjection> participants = findParticipantsForOnrCheck();

    assertEquals(1, participants.size());
    assertEquals(PERSON_OID, participants.get(0).getPersonOid());
  }

  @Test
  public void testSkipsNotIndividualisedPersonWithinOneDay() {
    final Registration registration = persistRegistration(LocalDateTime.now().minusDays(3));
    persistParticipantOnr(registration, false, LocalDateTime.now().minusHours(1));

    assertEquals(List.of(), findParticipantsForOnrCheck());
  }

  @Test
  public void testSkipsNotIndividualisedPersonRegisteredBefore20241001() {
    final Registration registration = persistRegistration(LocalDateTime.of(2024, 9, 30, 12, 0));
    persistParticipantOnr(registration, false, LocalDateTime.now().minusDays(2));

    assertEquals(List.of(), findParticipantsForOnrCheck());
  }

  @Test
  public void testSkipsIndividualisedPerson() {
    final Registration registration = persistRegistration(LocalDateTime.now().minusDays(3));
    persistParticipantOnr(registration, true, LocalDateTime.now().minusDays(2));

    assertEquals(List.of(), findParticipantsForOnrCheck());
  }

  private Registration persistRegistration(final LocalDateTime createdAt) {
    final Person person = Factory.person();
    final Participant participant = Factory.participant("test@example.com");
    final Registration registration = Factory.registration(person);
    registration.setParticipant(participant);
    registration.setExamSession(examSession);
    registration.setCreatedAt(createdAt);

    entityManager.persist(person);
    entityManager.persist(participant);
    entityManager.persist(registration);

    return registration;
  }

  private void persistParticipantOnr(
    final Registration registration,
    final boolean individualised,
    final LocalDateTime modifiedAt
  ) {
    final ParticipantOnr participantOnr = Factory.participantOnr(registration);
    participantOnr.setIndividualised(individualised);
    participantOnr.setModifiedAt(modifiedAt);

    entityManager.persist(participantOnr);
  }

  private List<ParticipantOnrCheckProjection> findParticipantsForOnrCheck() {
    entityManager.flush();

    return participantOnrRepository.findParticipantsForOnrCheck();
  }
}
