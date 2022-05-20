package fi.oph.otr.service.email;

import fi.oph.otr.repository.QualificationRepository;
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

  private static final String INITIAL_DELAY = "PT5S";

  private static final String FIXED_DELAY = "PT12H";

  private static final String LOCK_AT_LEAST = "PT0S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final QualificationRepository qualificationRepository;

  @Resource
  private final ClerkEmailService clerkEmailService;

  @Scheduled(initialDelayString = INITIAL_DELAY, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "checkExpiringQualifications", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void checkExpiringAuthorisations() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("checkExpiringQualifications");
      final LocalDate expiryBetweenStart = LocalDate.now();
      final LocalDate expiryBetweenEnd = expiryBetweenStart.plusMonths(3);
      final LocalDateTime previousReminderSentBefore = expiryBetweenStart.minusMonths(4).atStartOfDay();

      qualificationRepository
        .findExpiringQualifications(expiryBetweenStart, expiryBetweenEnd, previousReminderSentBefore)
        .forEach(clerkEmailService::createQualificationExpiryEmail);
    });
  }
}
