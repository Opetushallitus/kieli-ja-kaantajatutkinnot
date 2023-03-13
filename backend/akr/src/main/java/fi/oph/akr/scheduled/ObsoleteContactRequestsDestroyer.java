package fi.oph.akr.scheduled;

import fi.oph.akr.config.Constants;
import fi.oph.akr.service.ContactRequestService;
import fi.oph.akr.util.SchedulingUtil;
import java.time.LocalDateTime;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ObsoleteContactRequestsDestroyer {

  private static final Logger LOG = LoggerFactory.getLogger(ObsoleteContactRequestsDestroyer.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final ContactRequestService contactRequestService;

  @Scheduled(cron = Constants.DESTROY_OBSOLETE_CONTACT_REQUESTS_CRON)
  @SchedulerLock(name = "destroyObsoleteContactRequests", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void destroyObsoleteContactRequests() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("destroyObsoleteContactRequests");

      try {
        contactRequestService.destroyObsoleteContactRequests(LocalDateTime.now().minusMonths(6));
      } catch (Exception e) {
        LOG.error("Destroying obsolete contact requests failed", e);
      }
    });
  }
}
