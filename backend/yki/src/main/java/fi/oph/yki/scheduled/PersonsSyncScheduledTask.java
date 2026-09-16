package fi.oph.yki.scheduled;

import fi.oph.yki.model.Person;
import fi.oph.yki.model.PersonSyncStatus;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.PersonSyncStatusRepository;
import fi.oph.yki.solki.SolkiService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Java port of the Clojure PERSONS_SYNC_HANDLER: drains person_sync_status rows
 * (populated whenever a clerk edits a person's contact details, see PersonService)
 * and PUTs the current person details to SOLKI.
 */
@Component
@RequiredArgsConstructor
public class PersonsSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(PersonsSyncScheduledTask.class);
  private static final String LOCK_AT_LEAST = "PT10S";
  private static final String LOCK_AT_MOST = "PT10M";

  private final PersonSyncStatusRepository personSyncStatusRepository;
  private final PersonRepository personRepository;
  private final SolkiService solkiService;

  @Value("${app.solki.person-sync-retry-days}")
  private int retryDurationInDays;

  @Scheduled(fixedRate = 179, timeUnit = TimeUnit.SECONDS)
  @SchedulerLock(name = "personsSyncHandler", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncPersons() {
    try {
      final LocalDateTime retryDeadline = LocalDateTime.now().minusDays(retryDurationInDays);
      final List<PersonSyncStatus> pendingSyncs = personSyncStatusRepository.findPendingSyncs(retryDeadline);

      LOG.info("Persons sync handler found {} person(s) pending sync to SOLKI", pendingSyncs.size());

      pendingSyncs.forEach(this::syncPerson);
    } catch (final Exception e) {
      LOG.error("Persons sync handler failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  private void syncPerson(final PersonSyncStatus syncStatus) {
    try {
      final Person person = personRepository.getByOid(syncStatus.getPersonOid());
      if (person == null) {
        throw new IllegalStateException("No person found for oid " + syncStatus.getPersonOid());
      }

      solkiService.syncPerson(person);
      syncStatus.setSuccessAt(LocalDateTime.now());
      syncStatus.setShouldRetry(false);
    } catch (final Exception e) {
      LOG.error("Updating person details to SOLKI failed for person {}", syncStatus.getPersonOid(), e);
      syncStatus.setFailedAt(LocalDateTime.now());
      syncStatus.setShouldRetry(!isNotFound(e));
    }

    personSyncStatusRepository.save(syncStatus);
  }

  private static boolean isNotFound(final Exception e) {
    return (
      e.getCause() instanceof WebClientResponseException webClientResponseException &&
      webClientResponseException.getStatusCode().value() == 404
    );
  }
}
