package fi.oph.yki.scheduled;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.yki.repository.ShedLockRepository;
import fi.oph.yki.repository.TaskLockRepository;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class ScheduledTaskMonitorTest {

  @Test
  void testRunsWithoutErrorWhenAllTasksAreFresh() {
    final TaskLockRepository taskLockRepository = mockTaskLockRepository(1.0);
    final ShedLockRepository shedLockRepository = mockShedLockRepository(1.0);

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository).monitorScheduledTasks();

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

    new ScheduledTaskMonitor(taskLockRepository, shedLockRepository).monitorScheduledTasks();

    verify(taskLockRepository).findAgeInSeconds("PERSONS_SYNC_HANDLER");
    verify(shedLockRepository).findAgeInSeconds("personsSyncHandler");
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
}
