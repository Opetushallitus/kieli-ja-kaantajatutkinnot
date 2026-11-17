package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Person;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import jakarta.annotation.Resource;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ PostgresTestcontainerConfig.class, PersonOnrSyncService.class })
class PersonOnrSyncServiceTest {

  private static final String FIRST_PERSON_OID = "1.2.246.562.24.00000000001";
  private static final String DUPLICATE_PERSON_OID = "1.2.246.562.24.00000000002";
  // The master person of the linked duplicate. No person row has this OID.
  private static final String MASTER_PERSON_OID = "1.2.246.562.24.00000000003";
  private static final String LAST_PERSON_OID = "1.2.246.562.24.00000000004";

  @Resource
  private PersonOnrSyncService personOnrSyncService;

  @Resource
  private PersonRepository personRepository;

  @Resource
  private TestEntityManager entityManager;

  @Test
  void testSavesStatusForEachRequestedOidWhenOnePersonIsLinkedDuplicate() {
    persistPerson(FIRST_PERSON_OID);
    persistPerson(DUPLICATE_PERSON_OID);
    persistPerson(LAST_PERSON_OID);
    entityManager.flush();

    // ONR answers with the OID that was asked for as the key. For the linked duplicate, the person
    // under the key is the master person, which has another OID.
    final Map<String, PersonalDataDTO> onrPersons = Map.of(
      FIRST_PERSON_OID,
      onrPerson(FIRST_PERSON_OID, false, false),
      DUPLICATE_PERSON_OID,
      onrPerson(MASTER_PERSON_OID, true, false),
      LAST_PERSON_OID,
      onrPerson(LAST_PERSON_OID, false, true)
    );

    personOnrSyncService.saveBatch(onrPersons);
    entityManager.clear();

    final Map<String, Boolean> savedIndividualised = personRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(Person::getOid, Person::getIndividualised));
    assertEquals(
      Map.of(FIRST_PERSON_OID, false, DUPLICATE_PERSON_OID, true, LAST_PERSON_OID, true),
      savedIndividualised
    );
    assertTrue(personRepository.findAll().stream().allMatch(person -> person.getOnrLastSyncAt() != null));
  }

  @Test
  void testSavesNullWhenOnrGivesNoVtjFlag() {
    persistPerson(FIRST_PERSON_OID);
    entityManager.flush();

    personOnrSyncService.saveBatch(Map.of(FIRST_PERSON_OID, onrPerson(FIRST_PERSON_OID, false, null)));
    entityManager.clear();

    final Person person = personRepository.getByOid(FIRST_PERSON_OID);
    assertNull(person.getIndividualised());
    assertNotNull(person.getOnrLastSyncAt());
  }

  private void persistPerson(final String oid) {
    final Person person = Factory.person();
    person.setOid(oid);

    entityManager.persist(person);
  }

  private static PersonalDataDTO onrPerson(
    final String oid,
    final Boolean individualised,
    final Boolean individualisedVtj
  ) {
    final PersonalDataDTO person = new PersonalDataDTO();
    person.setOidHenkilo(oid);
    person.setOppijanumero(oid);
    person.setIndividualised(individualised);
    person.setIndividualisedVtj(individualisedVtj);

    return person;
  }
}
