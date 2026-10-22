package fi.oph.yki.scheduled;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.repository.RuntimeFlagRepository;
import fi.oph.yki.repository.ShedLockRepository;
import fi.oph.yki.repository.TaskLockRepository;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ScheduledTaskMonitorTest {

  @Test
  void testRunsWithoutErrorWhenAllTasksAreFresh() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository(1.0);
    final ShedLockRepository shedLockRepository = mockShedLockRepository(1.0);

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository, runtimeFlagRepository(null))
      .monitorScheduledTasks();

    verify(taskLockRepository).findAgeInSeconds("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findAgeInSeconds("PERSONS_SYNC_HANDLER");
    verify(shedLockRepository).findAgeInSeconds("personsSyncHandler");
    verify(shedLockRepository).findAgeInSeconds("participantsSyncHandler");
    verify(shedLockRepository).findAgeInSeconds("examSessionSolkiSyncHandler");
  }

  @Test
  void testRunsWithoutErrorWhenTasksAreStaleOrMissing() {
    // Large enough to exceed every monitored task's threshold.
    final TaskLockRepository taskLockRepository = mockTaskLockRepository(Duration.ofDays(1).toSeconds() * 1.0);
    final ShedLockRepository shedLockRepository = mockShedLockRepository(null);

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository, runtimeFlagRepository(null))
      .monitorScheduledTasks();

    verify(taskLockRepository).findAgeInSeconds("PERSONS_SYNC_HANDLER");
    verify(shedLockRepository).findAgeInSeconds("personsSyncHandler");
  }

  @ParameterizedTest
  @CsvSource(value = { "LEGACY", "NULL", "JAVE" }, nullValues = "NULL")
  void testMonitorsLegacyQueueHandlerUnlessThisBackendOwnsTheQueue(final String owner) {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository(1.0);
    final ShedLockRepository shedLockRepository = mockShedLockRepository(1.0);

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository, runtimeFlagRepository(owner))
      .monitorScheduledTasks();

    verify(taskLockRepository).findAgeInSeconds("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findAgeInSeconds("REGISTRATION_STATE_HANDLER");
    verify(shedLockRepository, never()).findAgeInSeconds("registrationQueueHandler");
  }

  @Test
  void testMonitorsThisBackendsQueueHandlerOnceThisBackendOwnsTheQueue() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository(1.0);
    final ShedLockRepository shedLockRepository = mockShedLockRepository(1.0);

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository, runtimeFlagRepository(RuntimeFlag.OWNER_JAVA))
      .monitorScheduledTasks();

    verify(taskLockRepository, never()).findAgeInSeconds("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findAgeInSeconds("REGISTRATION_STATE_HANDLER");
    verify(shedLockRepository).findAgeInSeconds("registrationQueueHandler");
  }

  private static TaskLockRepository mockTaskLockRepository(final Double ageInSeconds) {
    final TaskLockRepository taskLockRepository = mock(TaskLockRepository.class);
    when(taskLockRepository.findAgeInSeconds(anyString())).thenReturn(ageInSeconds);
    return taskLockRepository;
  }

  private static ShedLockRepository mockShedLockRepository(final Double ageInSeconds) {
    final ShedLockRepository shedLockRepository = mock(ShedLockRepository.class);
    when(shedLockRepository.findAgeInSeconds(anyString())).thenReturn(ageInSeconds);
    return shedLockRepository;
  }

  private static RuntimeFlagRepository runtimeFlagRepository(final String owner) {
    final RuntimeFlagRepository runtimeFlagRepository = mock(RuntimeFlagRepository.class);
    if (owner != null) {
      final RuntimeFlag flag = new RuntimeFlag();
      flag.setName(RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER);
      flag.setValue(owner);
      when(runtimeFlagRepository.findById(RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER)).thenReturn(Optional.of(flag));
    }
    return runtimeFlagRepository;
  }
}
