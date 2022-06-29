package fi.oph.akt.scheduled;

import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.service.email.ClerkEmailService;
import fi.oph.akt.util.SchedulingUtil;
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
public class ExpiringAuthorisationsEmailCreator {

  private static final Logger LOG = LoggerFactory.getLogger(ExpiringAuthorisationsEmailCreator.class);

  private static final String LOCK_AT_LEAST = "PT0S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final ClerkEmailService clerkEmailService;

  @Scheduled(cron = "0 0 3 * * *")
  @SchedulerLock(name = "checkExpiringAuthorisations", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void checkExpiringAuthorisations() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("checkExpiringAuthorisations");
      final LocalDate expiryBetweenStart = LocalDate.now();
      final LocalDate expiryBetweenEnd = expiryBetweenStart.plusMonths(3);
      final LocalDateTime previousReminderSentBefore = expiryBetweenStart.minusMonths(4).atStartOfDay();

      authorisationRepository
        .findExpiringAuthorisations(expiryBetweenStart, expiryBetweenEnd, previousReminderSentBefore)
        .forEach(authorisationId -> {
          try {
            clerkEmailService.createAuthorisationExpiryEmail(authorisationId);
          } catch (Exception e) {
            LOG.error("Creation of authorisation expiry email failed", e);
          }
        });
    });
  }
}
