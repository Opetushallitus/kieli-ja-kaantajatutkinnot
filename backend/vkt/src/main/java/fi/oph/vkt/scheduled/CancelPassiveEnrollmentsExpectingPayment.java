package fi.oph.vkt.scheduled;

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
public class CancelPassiveEnrollmentsExpectingPayment {

  private static final Logger LOG = LoggerFactory.getLogger(CancelPassiveEnrollmentsExpectingPayment.class);

  private static final String INITIAL_DELAY = "PT5S";

  private static final String FIXED_DELAY = "PT30M";

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1M";

  @Resource
  private final ClerkEnrollmentService clerkEnrollmentService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(
    name = "cancelPassiveEnrollmentsExpectingPayment",
    lockAtLeastFor = LOCK_AT_LEAST,
    lockAtMostFor = LOCK_AT_MOST
  )
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("cancelPassiveEnrollmentsExpectingPayment");

      clerkEnrollmentService.cancelPassiveEnrollmentsExpectingPayment();
    });
  }
}
