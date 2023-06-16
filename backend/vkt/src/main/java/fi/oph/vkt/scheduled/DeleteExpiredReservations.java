package fi.oph.vkt.scheduled;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.service.ClerkReservationService;
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
public class DeleteExpiredReservations {

  private static final Logger LOG = LoggerFactory.getLogger(DeleteExpiredReservations.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final ClerkReservationService clerkReservationService;

  @Scheduled(cron = Constants.DELETE_EXPIRED_RESERVATIONS_CRON)
  @SchedulerLock(
    name = "deleteObsoleteReservations",
    lockAtLeastFor = LOCK_AT_LEAST,
    lockAtMostFor = LOCK_AT_MOST
  )
  public void action() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("deleteExpiredReservations");

      clerkReservationService.deleteExpiredReservations();
    });
  }
}
