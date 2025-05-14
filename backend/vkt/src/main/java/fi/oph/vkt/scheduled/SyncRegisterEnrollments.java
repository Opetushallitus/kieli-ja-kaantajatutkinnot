package fi.oph.vkt.scheduled;

import fi.oph.vkt.service.RegisterEnrollmentService;
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
public class SyncRegisterEnrollments {

  private static final Logger LOG = LoggerFactory.getLogger(SyncRegisterEnrollments.class);

  private static final String INITIAL_DELAY = "PT10S";

  private static final String FIXED_DELAY = "PT10S";

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1M";

  @Resource
  private RegisterEnrollmentService registerEnrollmentService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "syncRegisterEnrollments", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("pollEmailsToSend");
      registerEnrollmentService.sync();
    });
  }
}
