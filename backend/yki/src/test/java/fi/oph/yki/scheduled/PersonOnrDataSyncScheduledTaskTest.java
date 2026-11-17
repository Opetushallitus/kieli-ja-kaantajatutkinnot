package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonOnrCheckProjection;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.service.PersonOnrSyncService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class PersonOnrDataSyncScheduledTaskTest {

  private static final String PERSON_OID = "1.2.246.562.24.00000000001";
  // The master person of a linked duplicate has another OID than the one asked for.
  private static final String MASTER_PERSON_OID = "1.2.246.562.24.00000000002";

  private PersonRepository personRepository;
  private OnrService onrService;
  private PersonOnrDataSyncScheduledTask task;

  @BeforeEach
  void setup() {
    personRepository = Mockito.mock(PersonRepository.class);
    onrService = Mockito.mock(OnrService.class);
    task = new PersonOnrDataSyncScheduledTask(personRepository, onrService, new PersonOnrSyncService(personRepository));
  }

  private void givenOnePersonToCheck() {
    final PersonOnrCheckProjection person = Mockito.mock(PersonOnrCheckProjection.class);
    Mockito.when(person.getPersonOid()).thenReturn(PERSON_OID);
    Mockito.when(personRepository.findPersonsForOnrCheck()).thenReturn(List.of(person));
  }

  /** ONR answers with the requested OID as the key. The person under it has the given OID. */
  private void givenOnrAnswers(final String onrPersonOid) throws Exception {
    final PersonalDataDTO person = new PersonalDataDTO();
    person.setOidHenkilo(onrPersonOid);
    person.setOppijanumero(onrPersonOid);
    person.setIndividualised(false);
    person.setIndividualisedVtj(true);
    Mockito.when(onrService.listMasterPersonsByOids(List.of(PERSON_OID))).thenReturn(Map.of(PERSON_OID, person));
  }

  @Test
  void savesStatusUnderRequestedOid() throws Exception {
    givenOnePersonToCheck();
    givenOnrAnswers(PERSON_OID);

    task.syncPersonOnrData();

    Mockito.verify(personRepository).updateIndividualised(PERSON_OID, true);
  }

  @Test
  void savesStatusUnderRequestedOidWhenOnrReturnsMasterPersonWithOtherOid() throws Exception {
    givenOnePersonToCheck();
    givenOnrAnswers(MASTER_PERSON_OID);

    task.syncPersonOnrData();

    Mockito.verify(personRepository).updateIndividualised(PERSON_OID, true);
    Mockito
      .verify(personRepository, Mockito.never())
      .updateIndividualised(Mockito.eq(MASTER_PERSON_OID), Mockito.any());
  }

  @Test
  void savesNothingWhenOnrCallFails() throws Exception {
    givenOnePersonToCheck();
    Mockito
      .when(onrService.listMasterPersonsByOids(List.of(PERSON_OID)))
      .thenThrow(new RuntimeException("ONR is not available"));

    assertDoesNotThrow(() -> task.syncPersonOnrData());

    Mockito.verify(personRepository, Mockito.never()).updateIndividualised(Mockito.any(), Mockito.any());
  }

  @Test
  void doesNotCallOnrWhenNoPersonNeedsCheck() {
    Mockito.when(personRepository.findPersonsForOnrCheck()).thenReturn(List.of());

    task.syncPersonOnrData();

    Mockito.verifyNoInteractions(onrService);
  }
}
