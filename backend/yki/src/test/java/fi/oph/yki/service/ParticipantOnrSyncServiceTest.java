package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrRepository;
import jakarta.annotation.Resource;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test-postgres")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ PostgresTestcontainerConfig.class, ParticipantOnrSyncService.class })
class ParticipantOnrSyncServiceTest {

  private static final String FIRST_PERSON_OID = "1.2.246.562.24.00000000001";
  private static final String DUPLICATE_PERSON_OID = "1.2.246.562.24.00000000002";
  // The master person of the linked duplicate. No participant has this OID.
  private static final String MASTER_PERSON_OID = "1.2.246.562.24.00000000003";
  private static final String LAST_PERSON_OID = "1.2.246.562.24.00000000004";

  @Resource
  private ParticipantOnrSyncService participantOnrSyncService;

  @Resource
  private ParticipantOnrRepository participantOnrRepository;

  @Resource
  private TestEntityManager entityManager;

  @Resource
  private JdbcTemplate jdbcTemplate;

  // Inside the test transaction, so rolled back with it.
  @BeforeEach
  void makeThisBackendTheSyncOwner() {
    jdbcTemplate.update(
      "UPDATE runtime_flag SET value = ? WHERE name = ?",
      RuntimeFlag.OWNER_JAVA,
      RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER
    );
  }

  @Test
  void testSavesRowForEachRequestedOidWhenOnePersonIsLinkedDuplicate() {
    final Participant firstParticipant = persistParticipant("first@example.com");
    final Participant duplicateParticipant = persistParticipant("duplicate@example.com");
    final Participant lastParticipant = persistParticipant("last@example.com");

    // ONR answers with the OID that was asked for as the key. For the linked duplicate, the person
    // under the key is the master person, which has another OID.
    final Map<String, PersonalDataDTO> onrPersons = Map.of(
      FIRST_PERSON_OID,
      onrPerson(FIRST_PERSON_OID, false),
      DUPLICATE_PERSON_OID,
      onrPerson(MASTER_PERSON_OID, true),
      LAST_PERSON_OID,
      onrPerson(LAST_PERSON_OID, false)
    );
    final Map<String, Long> oidToParticipantId = Map.of(
      FIRST_PERSON_OID,
      firstParticipant.getId(),
      DUPLICATE_PERSON_OID,
      duplicateParticipant.getId(),
      LAST_PERSON_OID,
      lastParticipant.getId()
    );

    assertTrue(participantOnrSyncService.saveBatchIfOwner(onrPersons, oidToParticipantId));
    // The rows go to the database here. A row that the database refuses fails the whole batch.
    entityManager.flush();
    entityManager.clear();

    final Map<String, Long> savedParticipantIds = participantOnrRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(ParticipantOnr::getOid, ParticipantOnr::getParticipantId));
    assertEquals(oidToParticipantId, savedParticipantIds);

    final Map<String, Boolean> savedIndividualised = participantOnrRepository
      .findAll()
      .stream()
      .collect(Collectors.toMap(ParticipantOnr::getOid, ParticipantOnr::getIndividualised));
    assertEquals(
      Map.of(FIRST_PERSON_OID, false, DUPLICATE_PERSON_OID, true, LAST_PERSON_OID, false),
      savedIndividualised
    );
  }

  private Participant persistParticipant(final String email) {
    final Participant participant = Factory.participant(email);
    entityManager.persist(participant);

    return participant;
  }

  private static PersonalDataDTO onrPerson(final String oid, final boolean individualised) {
    final PersonalDataDTO person = new PersonalDataDTO();
    person.setOidHenkilo(oid);
    person.setOppijanumero(oid);
    person.setIndividualised(individualised);
    person.setIndividualisedVtj(false);

    return person;
  }
}
