package fi.oph.vkt.scheduled;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.service.ClerkPersonService;
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
public class DeleteObsoletePersons {

  private static final Logger LOG = LoggerFactory.getLogger(DeleteObsoletePersons.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final ClerkPersonService clerkPersonService;

  @Scheduled(cron = Constants.DELETE_OBSOLETE_PERSONS_CRON)
  @SchedulerLock(name = "deleteObsoletePersons", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("deleteObsoletePersons");

      clerkPersonService.deleteObsoletePersons();
    });
  }
}
