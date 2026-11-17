package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Participant;
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
class PersonRepositoryTest {

  // The OID of Factory.person().
  private static final String PERSON_OID = "1.2.3.4.5";

  @Resource
  private PersonRepository personRepository;

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
  public void testSelectsUncheckedPersonOneHourAfterRegistration() {
    persistRegistrations(persistPerson(null, null), LocalDateTime.now().minusHours(2));

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsUncheckedPersonWithinOneHourOfRegistration() {
    persistRegistrations(persistPerson(null, null), LocalDateTime.now().minusMinutes(30));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsPersonWithoutRegistration() {
    persistPerson(null, null);

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsRegistrationWithoutPerson() {
    persistRegistrations(null, LocalDateTime.now().minusHours(2));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsPersonOnceWhenPersonHasManyRegistrations() {
    persistRegistrations(
      persistPerson(null, null),
      LocalDateTime.now().minusHours(2),
      LocalDateTime.now().minusHours(3)
    );

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsNotIndividualisedPersonOneDayAfterLastCheck() {
    persistRegistrations(persistPerson(false, LocalDateTime.now().minusDays(2)), LocalDateTime.now().minusDays(3));

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsNotIndividualisedPersonWithinOneDayOfLastCheck() {
    persistRegistrations(persistPerson(false, LocalDateTime.now().minusHours(1)), LocalDateTime.now().minusDays(3));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsNotIndividualisedPersonRegisteredBefore20241001() {
    persistRegistrations(persistPerson(false, LocalDateTime.now().minusDays(2)), LocalDateTime.of(2024, 9, 30, 12, 0));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsNotIndividualisedPersonWhoRegisteredAgainAfter20241001() {
    persistRegistrations(
      persistPerson(false, LocalDateTime.now().minusDays(2)),
      LocalDateTime.of(2024, 9, 30, 12, 0),
      LocalDateTime.now().minusDays(3)
    );

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsIndividualisedPerson() {
    persistRegistrations(persistPerson(true, LocalDateTime.now().minusDays(2)), LocalDateTime.now().minusDays(3));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsPersonCheckedWithoutStatus() {
    // ONR gave no status. In legacy, this was a participant_onr row with NULL.
    persistRegistrations(persistPerson(null, LocalDateTime.now().minusDays(2)), LocalDateTime.now().minusDays(3));

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testUpdateIndividualisedChangesOnlyTheOnrColumns() {
    persistPerson(null, null);
    entityManager.flush();
    entityManager.clear();
    final Person before = personRepository.getByOid(PERSON_OID);
    final String firstName = before.getFirstName();
    final LocalDateTime modifiedAt = before.getModifiedAt();
    entityManager.clear();

    personRepository.updateIndividualised(PERSON_OID, false);
    entityManager.clear();

    final Person after = personRepository.getByOid(PERSON_OID);
    assertEquals(false, after.getIndividualised());
    assertNotNull(after.getOnrLastSyncAt());
    assertEquals(firstName, after.getFirstName());
    assertEquals(modifiedAt, after.getModifiedAt());
  }

  private Person persistPerson(final Boolean individualised, final LocalDateTime onrLastSyncAt) {
    final Person person = Factory.person();
    person.setIndividualised(individualised);
    person.setOnrLastSyncAt(onrLastSyncAt);

    entityManager.persist(person);

    return person;
  }

  private void persistRegistrations(final Person person, final LocalDateTime... createdAts) {
    final Participant participant = Factory.participant("test@example.com");
    entityManager.persist(participant);

    for (final LocalDateTime createdAt : createdAts) {
      final Registration registration = Factory.registration(person);
      registration.setParticipant(participant);
      registration.setExamSession(examSession);
      registration.setCreatedAt(createdAt);

      entityManager.persist(registration);
    }
  }

  private List<String> findPersonOidsForOnrCheck() {
    entityManager.flush();

    return personRepository.findPersonsForOnrCheck().stream().map(ParticipantOnrCheckProjection::getPersonOid).toList();
  }
}
