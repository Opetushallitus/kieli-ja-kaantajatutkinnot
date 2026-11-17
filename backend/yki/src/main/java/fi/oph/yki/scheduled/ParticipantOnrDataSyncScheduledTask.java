package fi.oph.yki.scheduled;

import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrCheckProjection;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.service.ParticipantOnrSyncService;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Port of the legacy sync-participant-onr-data-handler (yki repo, src/yki/job/scheduled_tasks.clj).
 * Stores the individualisation status from ONR in person. The legacy job writes participant_onr, so
 * the two backends do not write the same table.
 */
@Component
@RequiredArgsConstructor
public class ParticipantOnrDataSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(ParticipantOnrDataSyncScheduledTask.class);
  private static final String LOCK_AT_LEAST = "PT59M";
  private static final String LOCK_AT_MOST = "PT2H";
  private static final int BATCH_SIZE = 1000;
  private static final long PAUSE_BETWEEN_BATCHES_MILLIS = 10_000;

  private final PersonRepository personRepository;
  private final OnrService onrService;
  private final ParticipantOnrSyncService participantOnrSyncService;

  @Scheduled(fixedRate = 3600, initialDelay = 60, timeUnit = TimeUnit.SECONDS)
  @SchedulerLock(name = "syncOnrParticipantDataHandler", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncParticipantOnrData() {
    try {
      final List<String> oids = personRepository
        .findPersonsForOnrCheck()
        .stream()
        .map(ParticipantOnrCheckProjection::getPersonOid)
        .toList();

      LOG.info("Participant ONR data sync found {} person(s) to check", oids.size());

      for (int start = 0; start < oids.size(); start += BATCH_SIZE) {
        syncBatch(oids.subList(start, Math.min(start + BATCH_SIZE, oids.size())));

        // Wait 10 seconds between calls to ONR just to play it safe.
        Thread.sleep(PAUSE_BETWEEN_BATCHES_MILLIS);
      }
    } catch (final Exception e) {
      LOG.error("Participant ONR data sync failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  /** The ONR call stays outside the transaction, so the transaction is open only while saving. */
  private void syncBatch(final List<String> oids) {
    final Map<String, PersonalDataDTO> onrPersons;
    try {
      onrPersons = onrService.listMasterPersonsByOids(oids);
    } catch (final Exception e) {
      LOG.error("Listing {} person(s) from ONR failed", oids.size(), e);
      return;
    }

    participantOnrSyncService.saveBatch(onrPersons);
  }
}
