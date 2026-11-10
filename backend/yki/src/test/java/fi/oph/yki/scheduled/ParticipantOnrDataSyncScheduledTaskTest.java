package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrCheckProjection;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.repository.RuntimeFlagRepository;
import fi.oph.yki.service.ParticipantOnrSyncService;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class ParticipantOnrDataSyncScheduledTaskTest {

  private static final String PERSON_OID = "1.2.246.562.24.00000000001";

  private ParticipantOnrRepository participantOnrRepository;
  private OnrService onrService;
  private RuntimeFlagRepository runtimeFlagRepository;
  private ParticipantOnrDataSyncScheduledTask task;

  @BeforeEach
  void setup() {
    participantOnrRepository = Mockito.mock(ParticipantOnrRepository.class);
    onrService = Mockito.mock(OnrService.class);
    runtimeFlagRepository = Mockito.mock(RuntimeFlagRepository.class);
    task =
      new ParticipantOnrDataSyncScheduledTask(
        participantOnrRepository,
        onrService,
        new ParticipantOnrSyncService(participantOnrRepository, runtimeFlagRepository)
      );
  }

  private void setOwner(final String owner) {
    final RuntimeFlag flag = new RuntimeFlag();
    flag.setName(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER);
    flag.setValue(owner);
    Mockito.when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)).thenReturn(Optional.of(flag));
  }

  private void setOwnerWhenWriting(final String owner) {
    Mockito
      .when(runtimeFlagRepository.findValueForShare(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER))
      .thenReturn(Optional.of(owner));
  }

  private void givenOneParticipantFoundInOnr() throws Exception {
    final ParticipantOnrCheckProjection participant = Mockito.mock(ParticipantOnrCheckProjection.class);
    Mockito.when(participant.getPersonOid()).thenReturn(PERSON_OID);
    Mockito.when(participant.getParticipantId()).thenReturn(1L);
    Mockito.when(participantOnrRepository.findParticipantsForOnrCheck()).thenReturn(List.of(participant));

    final PersonalDataDTO person = new PersonalDataDTO();
    person.setOidHenkilo(PERSON_OID);
    person.setOppijanumero(PERSON_OID);
    person.setIndividualised(false);
    person.setIndividualisedVtj(true);
    Mockito.when(onrService.listMasterPersonsByOids(List.of(PERSON_OID))).thenReturn(Map.of(PERSON_OID, person));
  }

  @Test
  void writesBatchWhenJavaOwnsSync() throws Exception {
    setOwner(RuntimeFlag.OWNER_JAVA);
    setOwnerWhenWriting(RuntimeFlag.OWNER_JAVA);
    givenOneParticipantFoundInOnr();

    task.syncParticipantOnrData();

    final ArgumentCaptor<ParticipantOnr> saved = ArgumentCaptor.forClass(ParticipantOnr.class);
    Mockito.verify(participantOnrRepository).save(saved.capture());
    assertEquals(PERSON_OID, saved.getValue().getOid());
    assertEquals(1L, saved.getValue().getParticipantId());
    assertEquals(Boolean.TRUE, saved.getValue().getIndividualised());
  }

  @Test
  void discardsBatchWhenOwnerSwitchesToLegacyDuringOnrCall() throws Exception {
    setOwner(RuntimeFlag.OWNER_JAVA);
    setOwnerWhenWriting(RuntimeFlag.OWNER_LEGACY);
    givenOneParticipantFoundInOnr();

    task.syncParticipantOnrData();

    Mockito.verify(onrService).listMasterPersonsByOids(List.of(PERSON_OID));
    Mockito.verify(participantOnrRepository, Mockito.never()).findAllById(Mockito.any());
    Mockito.verify(participantOnrRepository, Mockito.never()).save(Mockito.any());
  }

  @Test
  void discardsBatchWhenOwnerBecomesUnrecognisedDuringOnrCall() throws Exception {
    setOwner(RuntimeFlag.OWNER_JAVA);
    setOwnerWhenWriting("BOTH");
    givenOneParticipantFoundInOnr();

    assertDoesNotThrow(() -> task.syncParticipantOnrData());

    Mockito.verify(participantOnrRepository, Mockito.never()).save(Mockito.any());
  }

  @Test
  void doesNotSyncWhenLegacyOwnsSync() {
    setOwner(RuntimeFlag.OWNER_LEGACY);

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(participantOnrRepository, onrService);
  }

  @Test
  void doesNotSyncWhenFlagIsMissing() {
    Mockito.when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)).thenReturn(Optional.empty());

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(participantOnrRepository, onrService);
  }

  @Test
  void doesNotSyncWhenOwnerIsUnrecognised() {
    setOwner("BOTH");

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(participantOnrRepository, onrService);
  }

  @Test
  void doesNotSyncWhenFlagCannotBeRead() {
    Mockito
      .when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER))
      .thenThrow(new RuntimeException("relation \"runtime_flag\" does not exist"));

    assertDoesNotThrow(() -> task.syncParticipantOnrData());

    Mockito.verifyNoInteractions(participantOnrRepository, onrService);
  }
}
