package fi.oph.vkt.scheduled;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.service.ClerkReservationService;
import fi.oph.vkt.service.PublicAuthService;
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
public class DeleteExpiredTokens {

  private static final Logger LOG = LoggerFactory.getLogger(DeleteExpiredTokens.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final PublicAuthService publicAuthService;

  @Scheduled(cron = Constants.DELETE_EXPIRED_TOKENS_CRON)
  @SchedulerLock(name = "deleteExpiredTokens", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("deleteExpiredTokens");

      publicAuthService.deleteExpiredTokens();
    });
  }
}
