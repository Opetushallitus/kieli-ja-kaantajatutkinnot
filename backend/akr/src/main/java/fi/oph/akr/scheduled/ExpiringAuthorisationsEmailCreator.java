package fi.oph.akr.scheduled;

import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.AuthorisationRepository;
import fi.oph.akr.service.email.ClerkEmailService;
import fi.oph.akr.util.SchedulingUtil;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ExpiringAuthorisationsEmailCreator {

  private static final Logger LOG = LoggerFactory.getLogger(ExpiringAuthorisationsEmailCreator.class);

  private static final String LOCK_AT_LEAST = "PT1S";

  private static final String LOCK_AT_MOST = "PT1H";

  @Resource
  private final AuthorisationRepository authorisationRepository;

  @Resource
  private final ClerkEmailService clerkEmailService;

  @Resource
  private final Environment environment;

  @Scheduled(cron = "0 0 3 * * *")
  @SchedulerLock(name = "checkExpiringAuthorisations", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void checkExpiringAuthorisations() {
    if (!environment.getRequiredProperty("app.create-expiry-emails-enabled", Boolean.class)) {
      LOG.info("Expiry emails creation is disabled, do nothing.");
      return;
    }
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.info("checkExpiringAuthorisations");
      final LocalDate expiryBetweenStart = LocalDate.now();
      final LocalDate expiryBetweenEnd = expiryBetweenStart.plusMonths(3);
      final LocalDateTime previousReminderSentBefore = expiryBetweenStart.minusMonths(4).atStartOfDay();

      authorisationRepository
        .findExpiringAuthorisations(expiryBetweenStart, expiryBetweenEnd, previousReminderSentBefore)
        .forEach(authorisation -> {
          if (hasEquivalentAuthorisationExpiringLater(authorisation)) {
            return;
          }
          try {
            clerkEmailService.createAuthorisationExpiryEmail(authorisation.getId());
          } catch (Exception e) {
            LOG.error("Creation of authorisation expiry email failed", e);
          }
        });
    });
  }

  private boolean hasEquivalentAuthorisationExpiringLater(final Authorisation authorisation) {
    final Translator translator = authorisation.getTranslator();
    final List<Authorisation> matchingAuthorisations = authorisationRepository.findMatchingAuthorisations(
      translator.getId(),
      authorisation.getBasis(),
      authorisation.getFromLang(),
      authorisation.getToLang()
    );

    return matchingAuthorisations
      .stream()
      .filter(a -> a.getId() != authorisation.getId())
      .anyMatch(a -> a.getTermEndDate().isAfter(authorisation.getTermEndDate()));
  }
}
