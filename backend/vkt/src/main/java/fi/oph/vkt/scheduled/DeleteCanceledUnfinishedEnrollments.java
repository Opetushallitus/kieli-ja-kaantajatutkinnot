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
public class DeleteCanceledUnfinishedEnrollments {

  private static final Logger LOG = LoggerFactory.getLogger(DeleteCanceledUnfinishedEnrollments.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final ClerkEnrollmentService clerkEnrollmentService;

  @Scheduled(cron = Constants.DELETE_CANCELED_UNFINISHED_ENROLLMENTS_CRON)
  @SchedulerLock(
    name = "deleteCanceledUnfinishedEnrollments",
    lockAtLeastFor = LOCK_AT_LEAST,
    lockAtMostFor = LOCK_AT_MOST
  )
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("deleteCanceledUnfinishedEnrollments");

      clerkEnrollmentService.deleteCanceledUnfinishedEnrollments();
    });
  }
}
