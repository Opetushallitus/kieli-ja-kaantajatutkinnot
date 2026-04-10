package fi.oph.yki.scheduled;

import fi.oph.yki.config.Constants;
import fi.oph.yki.repository.TaskLockRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTaskMonitor {

  private static final Logger LOG = LoggerFactory.getLogger(ScheduledTaskMonitor.class);

  private static final String LOCK_AT_LEAST = "PT1S";
  private static final String LOCK_AT_MOST = "PT4M";

  // task interval values from yki-repo
  private static final Map<String, Duration> MONITORED_TASKS = Map.of(
    "REGISTRATION_QUEUE_HANDLER",
    Duration.ofMinutes(10), // interval: 29s
    "REGISTRATION_STATE_HANDLER",
    Duration.ofMinutes(10), // interval: 59s
    "PERSONS_SYNC_HANDLER",
    Duration.ofMinutes(20), // interval: 179s
    "PARTICIPANTS_SYNC_HANDLER",
    Duration.ofHours(3), // interval: 59min
    "SYNC_ONR_PARTICIPANT_DATA_HANDLER",
    Duration.ofHours(3), // interval: 59min
    "EXAM_SESSION_STATISTICS_HANDLER",
    Duration.ofHours(3) // interval: 57min
  );

  private final TaskLockRepository taskLockRepository;

  @Scheduled(cron = Constants.SCHEDULED_TASK_MONITOR_CRON)
  @SchedulerLock(name = "scheduledTaskMonitor", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void monitorScheduledTasks() {
    MONITORED_TASKS.forEach((@NonNull final String task, final Duration maxAge) -> {
      taskLockRepository
        .findById(task)
        .ifPresentOrElse(
          taskLock -> {
            final LocalDateTime threshold = LocalDateTime.now().minus(maxAge);
            if (taskLock.getLastExecuted().isBefore(threshold)) {
              LOG.error(
                "Scheduled task {} has not run since {} [ERROR_SCHEDULED_TASK]",
                task,
                taskLock.getLastExecuted()
              );
            }
          },
          () -> LOG.error("Scheduled task {} not found in task_lock [ERROR_SCHEDULED_TASK]", task)
        );
    });
  }
}
