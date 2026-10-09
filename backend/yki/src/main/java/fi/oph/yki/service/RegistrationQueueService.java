package fi.oph.yki.service;

import fi.oph.yki.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationQueueService {

  private static final Logger LOG = LoggerFactory.getLogger(RegistrationQueueService.class);

  public enum StopReason {
    NOTHING_TO_LIFT,
    LIFT_BUDGET_EXHAUSTED,
    SESSION_LOCKED,
    NOT_OWNER,
  }

  public record SessionLiftResult(int lifted, StopReason stopReason) {}

  private final RegistrationRepository registrationRepository;
  private final RegistrationQueueLiftService registrationQueueLiftService;

  /**
   * Lifts registrations from one exam session's queue, one transaction per lift, until the session
   * has nothing more to lift, the run's lift budget is spent, or another worker holds the session.
   *
   * <p>Propagation.NEVER so that each lift commits on its own. Inside a caller's transaction, one
   * failed lift would mark the whole transaction rollback-only and lose every lift of the run, and
   * no lift would be visible to anyone else until the run ended.
   *
   * @param remainingLiftBudget what is left of the per-run lift cap (decision 21) after the sessions
   *     already processed in this run; the caller deducts each result's {@code lifted} from it
   */
  @Transactional(propagation = Propagation.NEVER)
  public SessionLiftResult liftFromQueue(final long examSessionId, final int remainingLiftBudget) {
    warnAboutUnliftableRegistrations(examSessionId);

    int lifted = 0;
    while (lifted < remainingLiftBudget) {
      switch (registrationQueueLiftService.liftNext(examSessionId)) {
        case LIFTED -> lifted++;
        case NOTHING_TO_LIFT -> {
          return logged(examSessionId, new SessionLiftResult(lifted, StopReason.NOTHING_TO_LIFT));
        }
        case SESSION_LOCKED -> {
          return logged(examSessionId, new SessionLiftResult(lifted, StopReason.SESSION_LOCKED));
        }
        case NOT_OWNER -> {
          return logged(examSessionId, new SessionLiftResult(lifted, StopReason.NOT_OWNER));
        }
      }
    }
    return logged(examSessionId, new SessionLiftResult(lifted, StopReason.LIFT_BUDGET_EXHAUSTED));
  }

  private void warnAboutUnliftableRegistrations(final long examSessionId) {
    final long unliftable = registrationRepository.countUnliftableQueuedRegistrations(examSessionId);
    if (unliftable > 0) {
      LOG.warn(
        "Exam session {} has {} queued ALL_PARTS registration(s) in a partial session, which are never lifted from the queue",
        examSessionId,
        unliftable
      );
    }
  }

  // Another worker holding the session, or the run's budget running out, means runs are overlapping
  // or something is lifting far more than usual. Both went unnoticed in the legacy overlift incident.
  private static SessionLiftResult logged(final long examSessionId, final SessionLiftResult result) {
    switch (result.stopReason()) {
      case SESSION_LOCKED, LIFT_BUDGET_EXHAUSTED -> LOG.warn(
        "Stopped lifting from the queue of exam session {} after {} lift(s): {}",
        examSessionId,
        result.lifted(),
        result.stopReason()
      );
      // Normal until the owner flag is switched to this backend, so it is the run's to report once.
      case NOT_OWNER -> {}
      case NOTHING_TO_LIFT -> {
        if (result.lifted() > 0) {
          LOG.info("Lifted {} registration(s) from the queue of exam session {}", result.lifted(), examSessionId);
        }
      }
    }
    return result;
  }
}
