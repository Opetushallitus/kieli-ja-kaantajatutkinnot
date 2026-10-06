package fi.oph.yki.scheduled;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.repository.TaskLockRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class ScheduledTaskMonitorTest {

  @Test
  void testMonitorsLegacyQueueHandlerWhileJavaHandlerIsDisabled() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository();

    new ScheduledTaskMonitor(taskLockRepository, new MockEnvironment()).monitorScheduledTasks();

    verify(taskLockRepository).findById("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findById("REGISTRATION_STATE_HANDLER");
  }

  @Test
  void testSkipsLegacyQueueHandlerOnceJavaHandlerIsEnabled() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository();
    final MockEnvironment environment = new MockEnvironment()
      .withProperty(RegistrationQueueHandler.ENABLED_PROPERTY, "true");

    new ScheduledTaskMonitor(taskLockRepository, environment).monitorScheduledTasks();

    verify(taskLockRepository, never()).findById("REGISTRATION_QUEUE_HANDLER");
    verify(taskLockRepository).findById("REGISTRATION_STATE_HANDLER");
  }

  private static TaskLockRepository mockTaskLockRepository() {
    final TaskLockRepository taskLockRepository = mock(TaskLockRepository.class);
    when(taskLockRepository.findById(anyString())).thenReturn(Optional.empty());
    return taskLockRepository;
  }
}
