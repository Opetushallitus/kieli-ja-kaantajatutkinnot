package fi.oph.otr.scheduled;

import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.service.email.ClerkEmailService;
import fi.oph.otr.util.SchedulingUtil;
import java.time.LocalDate;
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
public class ExpiringQualificationsEmailCreator {

  private static final Logger LOG = LoggerFactory.getLogger(ExpiringQualificationsEmailCreator.class);

  private static final String LOCK_AT_LEAST = "PT0S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final QualificationRepository qualificationRepository;

  @Resource
  private final ClerkEmailService clerkEmailService;

  @Scheduled(cron = "0 0 3 * * *")
  @SchedulerLock(name = "checkExpiringQualifications", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void checkExpiringQualifications() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("checkExpiringQualifications");
      final LocalDate expiryBetweenStart = LocalDate.now();
      final LocalDate expiryBetweenEnd = expiryBetweenStart.plusMonths(3);
      final LocalDateTime previousReminderSentBefore = expiryBetweenStart.minusMonths(4).atStartOfDay();

      qualificationRepository
        .findExpiringQualifications(expiryBetweenStart, expiryBetweenEnd, previousReminderSentBefore)
        .forEach(qualificationId -> {
          try {
            clerkEmailService.createQualificationExpiryEmail(qualificationId);
          } catch (Exception e) {
            LOG.error("Creation of qualification expiry email failed", e);
          }
        });
    });
  }
}
