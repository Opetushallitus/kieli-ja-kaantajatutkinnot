package fi.oph.yki.scheduled;

import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.RegistrationQueueService;
import fi.oph.yki.service.RegistrationQueueService.SessionLiftResult;
import fi.oph.yki.service.RegistrationQueueService.StopReason;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Lifts queued registrations into exam sessions that have free places. Ported from the legacy
 * backend's registration-queue-handler, which must not run at the same time: the per-session lock
 * that makes lifting safe is only taken by this implementation. Which of the two lifts is decided
 * by the {@code registration_queue_handler.owner} runtime flag, checked in every lift. The property
 * below is on in every environment and exists so that tests can keep the scheduler from running it.
 */
@Component
@ConditionalOnProperty(name = RegistrationQueueHandler.ENABLED_PROPERTY, havingValue = "true")
@RequiredArgsConstructor
public class RegistrationQueueHandler {

  private static final Logger LOG = LoggerFactory.getLogger(RegistrationQueueHandler.class);

  public static final String ENABLED_PROPERTY = "app.scheduling.registration-queue-handler.enabled";

  // Far above what a normal run lifts, so reaching it means something is wrong. It bounds how much
  // one run can lift for reasons the per-session lock and capacity check do not anticipate.
  public static final int MAX_LIFTS_PER_RUN = 50;

  private final RegistrationRepository registrationRepository;
  private final RegistrationQueueService registrationQueueService;

  // lockAtLeastFor keeps runs at least 30 s apart across instances, like legacy's 29 s task_lock
  // window; with one instance fixedDelay alone gives 60 s. Neither the lock nor the timing is what
  // makes lifting safe, see RegistrationQueueLiftService.
  @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT60S")
  @SchedulerLock(name = "registrationQueueHandler", lockAtLeastFor = "PT30S", lockAtMostFor = "PT5M")
  public void action() {
    try {
      liftFromQueues();
    } catch (final Exception e) {
      LOG.error("Registration queue handler failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  private void liftFromQueues() {
    final long startedAt = System.nanoTime();
    final List<Long> examSessionIds = registrationRepository.findExamSessionIdsWithQueueToLift();

    int lifted = 0;
    int sessionsProcessed = 0;
    boolean notOwner = false;
    for (final long examSessionId : examSessionIds) {
      if (lifted >= MAX_LIFTS_PER_RUN) {
        break;
      }
      sessionsProcessed++;
      // One session failing, e.g. on data its email cannot be built from, must not stop the rest.
      try {
        final SessionLiftResult result = registrationQueueService.liftFromQueue(
          examSessionId,
          MAX_LIFTS_PER_RUN - lifted
        );
        lifted += result.lifted();
        if (result.stopReason() == StopReason.NOT_OWNER) {
          notOwner = true;
          break;
        }
      } catch (final Exception e) {
        LOG.error("Registration queue handler failed for exam session {} [ERROR_SCHEDULED_TASK]", examSessionId, e);
      }
    }

    LOG.info(
      "Registration queue handler lifted {} registration(s) from {} of {} candidate exam session(s) in {} ms{}",
      lifted,
      sessionsProcessed,
      examSessionIds.size(),
      (System.nanoTime() - startedAt) / 1_000_000,
      notOwner ? "; stopped, " + RuntimeFlag.REGISTRATION_QUEUE_HANDLER_OWNER + " is not " + RuntimeFlag.OWNER_JAVA : ""
    );
  }
}
