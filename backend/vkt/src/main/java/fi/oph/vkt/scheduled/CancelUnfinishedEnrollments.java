package fi.oph.vkt.scheduled;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.service.ClerkEnrollmentService;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CancelUnfinishedEnrollments {

  private static final Logger LOG = LoggerFactory.getLogger(CancelUnfinishedEnrollments.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final ClerkEnrollmentService clerkEnrollmentService;

  @Scheduled(cron = Constants.CANCEL_UNFINISHED_ENROLLMENTS_CRON)
  @SchedulerLock(name = "cancelUnfinishedEnrollments", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("cancelUnfinishedEnrollments");

      clerkEnrollmentService.cancelUnfinishedEnrollments();
    });
  }
}
