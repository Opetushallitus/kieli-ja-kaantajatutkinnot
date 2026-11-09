package fi.oph.yki.scheduled;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.repository.RuntimeFlagRepository;
import fi.oph.yki.repository.TaskLockRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class ParticipantOnrDataSyncScheduledTaskTest {

  private TaskLockRepository taskLockRepository;
  private ParticipantOnrRepository participantOnrRepository;
  private OnrService onrService;
  private RuntimeFlagRepository runtimeFlagRepository;
  private ParticipantOnrDataSyncScheduledTask task;

  @BeforeEach
  void setup() {
    taskLockRepository = Mockito.mock(TaskLockRepository.class);
    participantOnrRepository = Mockito.mock(ParticipantOnrRepository.class);
    onrService = Mockito.mock(OnrService.class);
    runtimeFlagRepository = Mockito.mock(RuntimeFlagRepository.class);
    task =
      new ParticipantOnrDataSyncScheduledTask(
        taskLockRepository,
        participantOnrRepository,
        onrService,
        runtimeFlagRepository
      );
  }

  private void setOwner(final String owner) {
    final RuntimeFlag flag = new RuntimeFlag();
    flag.setName(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER);
    flag.setValue(owner);
    Mockito.when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)).thenReturn(Optional.of(flag));
  }

  @Test
  void syncsWhenJavaOwnsSync() {
    setOwner(RuntimeFlag.OWNER_JAVA);
    Mockito
      .when(taskLockRepository.tryToAcquireLock(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
      .thenReturn(1);
    Mockito.when(participantOnrRepository.findParticipantsForOnrCheck()).thenReturn(List.of());

    task.syncParticipantOnrData();

    Mockito
      .verify(taskLockRepository)
      .tryToAcquireLock(Mockito.eq("SYNC_ONR_PARTICIPANT_DATA_HANDLER"), Mockito.anyString(), Mockito.eq("59 MINUTES"));
    Mockito.verify(participantOnrRepository).findParticipantsForOnrCheck();
  }

  @Test
  void doesNotTakeLockWhenLegacyOwnsSync() {
    setOwner(RuntimeFlag.OWNER_LEGACY);

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(taskLockRepository, participantOnrRepository, onrService);
  }

  @Test
  void doesNotTakeLockWhenFlagIsMissing() {
    Mockito.when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)).thenReturn(Optional.empty());

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(taskLockRepository, participantOnrRepository, onrService);
  }

  @Test
  void doesNotTakeLockWhenOwnerIsUnrecognised() {
    setOwner("BOTH");

    task.syncParticipantOnrData();

    Mockito.verifyNoInteractions(taskLockRepository, participantOnrRepository, onrService);
  }

  @Test
  void doesNotTakeLockWhenFlagCannotBeRead() {
    Mockito
      .when(runtimeFlagRepository.findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER))
      .thenThrow(new RuntimeException("relation \"runtime_flag\" does not exist"));

    assertDoesNotThrow(() -> task.syncParticipantOnrData());

    Mockito.verifyNoInteractions(taskLockRepository, participantOnrRepository, onrService);
  }
}
