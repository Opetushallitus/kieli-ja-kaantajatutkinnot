package fi.oph.vkt.scheduled;

import fi.oph.vkt.service.email.EmailService;
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
public class DeleteExpiredEmails {

  private static final Logger LOG = LoggerFactory.getLogger(DeleteExpiredEmails.class);

  private static final String INITIAL_DELAY = "PT10M";

  private static final String FIXED_DELAY = "PT1H";

  private static final String LOCK_AT_LEAST = "PT5S";

  private static final String LOCK_AT_MOST = "PT10M";

  @Resource
  private final EmailService emailService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "deleteExpiredEmails", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("deleteExpiredEmails");
      emailService.deleteExpiredEmails();
    });
  }
}
