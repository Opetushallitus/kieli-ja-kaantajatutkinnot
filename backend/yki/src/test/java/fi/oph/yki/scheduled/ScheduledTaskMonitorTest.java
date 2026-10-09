package fi.oph.yki.scheduled;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.repository.RuntimeFlagRepository;
import fi.oph.yki.repository.TaskLockRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ScheduledTaskMonitorTest {

  @ParameterizedTest
  @CsvSource(value = { "LEGACY", "NULL", "JAVE" }, nullValues = "NULL")
  void testMonitorsLegacyQueueHandlerUnlessThisBackendOwnsTheQueue(final String owner) {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository();

    new ScheduledTaskMonitor(taskLockRepository, runtimeFlagRepository(owner)).monitorScheduledTasks();

    verify(taskLockRepository).findById("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findById("REGISTRATION_STATE_HANDLER");
  }

  @Test
  void testSkipsLegacyQueueHandlerOnceThisBackendOwnsTheQueue() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository();

    new ScheduledTaskMonitor(taskLockRepository, runtimeFlagRepository(RuntimeFlag.OWNER_JAVA)).monitorScheduledTasks();

    verify(taskLockRepository, never()).findById("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findById("REGISTRATION_STATE_HANDLER");
  }

  private static TaskLockRepository mockTaskLockRepository() {
    final TaskLockRepository taskLockRepository = mock(TaskLockRepository.class);
    when(taskLockRepository.findById(anyString())).thenReturn(Optional.empty());
    return taskLockRepository;
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
