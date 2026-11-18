package fi.oph.yki.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

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
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

  private Participant participant;

  @BeforeEach
  public void setup() {
    final ExamDate examDate = Factory.examDate();
    examSession = Factory.examSession(examDate);
    participant = Factory.participant("test@example.com");

    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(participant);
  }

  @Test
  public void testSelectsUncheckedPersonRightAfterRegistration() {
    persistRegistrations(persistPerson(PERSON_OID, null, null), LocalDateTime.now());

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsPersonWithoutRegistration() {
    persistPerson(PERSON_OID, null, null);

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsRegistrationWithoutPerson() {
    persistRegistrations(null, LocalDateTime.now());

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsPersonOnceWhenPersonHasManyRegistrations() {
    persistRegistrations(
      persistPerson(PERSON_OID, null, null),
      LocalDateTime.now().minusHours(2),
      LocalDateTime.now().minusHours(3)
    );

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsNotIndividualisedPersonOneDayAfterLastCheck() {
    persistRegistrations(persistPerson(PERSON_OID, false, LocalDateTime.now().minusDays(2)), LocalDateTime.now());

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsNotIndividualisedPersonWithinOneDayOfLastCheck() {
    persistRegistrations(persistPerson(PERSON_OID, false, LocalDateTime.now().minusHours(1)), LocalDateTime.now());

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsNotIndividualisedPersonRegisteredBefore20241001() {
    persistRegistrations(
      persistPerson(PERSON_OID, false, LocalDateTime.now().minusDays(2)),
      LocalDateTime.of(2024, 9, 30, 12, 0)
    );

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSelectsPersonCheckedWithoutStatusOneDayAfterLastCheck() {
    // ONR gave no status, or its answer did not have this OID.
    persistRegistrations(persistPerson(PERSON_OID, null, LocalDateTime.now().minusDays(2)), LocalDateTime.now());

    assertEquals(List.of(PERSON_OID), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsPersonCheckedWithoutStatusWithinOneDayOfLastCheck() {
    persistRegistrations(persistPerson(PERSON_OID, null, LocalDateTime.now().minusHours(1)), LocalDateTime.now());

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testSkipsIndividualisedPerson() {
    persistRegistrations(persistPerson(PERSON_OID, true, LocalDateTime.now().minusDays(2)), LocalDateTime.now());

    assertEquals(List.of(), findPersonOidsForOnrCheck());
  }

  @Test
  public void testUpdateIndividualisedChangesOnlyTheOnrColumns() {
    persistPerson(PERSON_OID, null, null);
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

  @Test
  public void testSearchPersonsReturnsIndividualisedStatus() {
    final String checkedPersonOid = "1.2.3.4.6";
    persistPerson(checkedPersonOid, false, LocalDateTime.now());
    persistPerson(PERSON_OID, null, null);
    entityManager.flush();

    final Map<String, PersonSearchProjection> personsByOid = personRepository
      .searchPersons(PageRequest.of(0, 10), null, null, null, null, null, false)
      .stream()
      .collect(Collectors.toMap(PersonSearchProjection::oid, Function.identity()));

    assertEquals(false, personsByOid.get(checkedPersonOid).individualised());
    assertNull(personsByOid.get(PERSON_OID).individualised());
  }

  @Test
  public void testSearchPersonsOnlyNotIndividualisedReturnsPersonsWithRegistrationWhoAreNotIndividualised() {
    final String notIndividualisedOid = "1.2.3.4.6";
    final String checkedWithoutStatusOid = "1.2.3.4.7";
    final String neverCheckedOid = "1.2.3.4.8";
    persistRegistrations(persistPerson(notIndividualisedOid, false, LocalDateTime.now()), LocalDateTime.now());
    persistRegistrations(persistPerson(checkedWithoutStatusOid, null, LocalDateTime.now()), LocalDateTime.now());
    persistRegistrations(persistPerson(neverCheckedOid, null, null), LocalDateTime.now());
    persistRegistrations(persistPerson("1.2.3.4.9", true, LocalDateTime.now()), LocalDateTime.now());
    // Not individualised, but has no registration.
    persistPerson("1.2.3.4.10", null, null);
    entityManager.flush();

    final Set<String> oids = personRepository
      .searchPersons(PageRequest.of(0, 10), null, null, null, null, null, true)
      .stream()
      .map(PersonSearchProjection::oid)
      .collect(Collectors.toSet());

    assertEquals(Set.of(notIndividualisedOid, checkedWithoutStatusOid, neverCheckedOid), oids);
  }

  @Test
  public void testSearchPersonsOnlyNotIndividualisedCountsOnlyThem() {
    persistRegistrations(persistPerson("1.2.3.4.6", false, LocalDateTime.now()), LocalDateTime.now());
    persistRegistrations(persistPerson("1.2.3.4.7", false, LocalDateTime.now()), LocalDateTime.now());
    persistRegistrations(persistPerson("1.2.3.4.8", false, LocalDateTime.now()), LocalDateTime.now());
    persistRegistrations(persistPerson("1.2.3.4.9", true, LocalDateTime.now()), LocalDateTime.now());
    entityManager.flush();

    // A full first page makes Spring Data run the count query.
    final Page<PersonSearchProjection> page = personRepository.searchPersons(
      PageRequest.of(0, 2),
      null,
      null,
      null,
      null,
      null,
      true
    );

    assertEquals(2, page.getContent().size());
    assertEquals(3, page.getTotalElements());
  }

  private Person persistPerson(final String oid, final Boolean individualised, final LocalDateTime onrLastSyncAt) {
    final Person person = Factory.person();
    person.setOid(oid);
    person.setIndividualised(individualised);
    person.setOnrLastSyncAt(onrLastSyncAt);

    entityManager.persist(person);

    return person;
  }

  private void persistRegistrations(final Person person, final LocalDateTime... createdAts) {
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

    return personRepository.findPersonsForOnrCheck().stream().map(PersonOnrCheckProjection::getPersonOid).toList();
  }
}
