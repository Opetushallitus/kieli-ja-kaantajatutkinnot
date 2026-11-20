package fi.oph.yki.scheduled;

import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrCheckProjection;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.service.ParticipantOnrSyncService;
import java.util.HashMap;
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
 * Stores the individualisation status from ONR in participant_onr, which the CSV in OnrDebugService
 * reads. Which of the two backends syncs is decided by the {@code participant_onr_sync.owner}
 * runtime flag, checked again in the transaction that writes each batch.
 */
@Component
@RequiredArgsConstructor
public class ParticipantOnrDataSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(ParticipantOnrDataSyncScheduledTask.class);
  private static final String LOCK_AT_LEAST = "PT59M";
  private static final String LOCK_AT_MOST = "PT2H";
  private static final int BATCH_SIZE = 1000;
  private static final long PAUSE_BETWEEN_BATCHES_MILLIS = 10_000;

  private final ParticipantOnrRepository participantOnrRepository;
  private final OnrService onrService;
  private final ParticipantOnrSyncService participantOnrSyncService;

  @Scheduled(fixedRate = 3600, initialDelay = 60, timeUnit = TimeUnit.SECONDS)
  @SchedulerLock(name = "syncOnrParticipantDataHandler", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncParticipantOnrData() {
    try {
      if (!participantOnrSyncService.ownsSync()) {
        return;
      }

      final List<ParticipantOnrCheckProjection> participants = participantOnrRepository.findParticipantsForOnrCheck();

      LOG.info("Participant ONR data sync found {} registration(s) to check", participants.size());

      for (int start = 0; start < participants.size(); start += BATCH_SIZE) {
        if (!syncBatch(participants.subList(start, Math.min(start + BATCH_SIZE, participants.size())))) {
          LOG.info(
            "Participant ONR data sync stopped, {} is no longer {}",
            RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER,
            RuntimeFlag.OWNER_JAVA
          );
          return;
        }

        // Wait 10 seconds between calls to ONR just to play it safe.
        Thread.sleep(PAUSE_BETWEEN_BATCHES_MILLIS);
      }
    } catch (final Exception e) {
      LOG.error("Participant ONR data sync failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  /**
   * Returns false when the owner is no longer this backend; the persons fetched from ONR are then
   * discarded. The ONR call stays outside the transaction, so the share lock on the flag is held only
   * while saving.
   */
  private boolean syncBatch(final List<ParticipantOnrCheckProjection> participants) {
    final Map<String, Long> oidToParticipantId = new HashMap<>();
    participants.forEach(participant ->
      oidToParticipantId.put(participant.getPersonOid(), participant.getParticipantId())
    );
    final List<String> oids = participants.stream().map(ParticipantOnrCheckProjection::getPersonOid).toList();

    final Map<String, PersonalDataDTO> onrPersons;
    try {
      onrPersons = onrService.listMasterPersonsByOids(oids);
    } catch (final Exception e) {
      LOG.error("Listing {} person(s) from ONR failed", oids.size(), e);
      return true;
    }

    return participantOnrSyncService.saveBatchIfOwner(onrPersons, oidToParticipantId);
  }
}
