package fi.oph.yki.scheduled;

import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrCheckProjection;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.repository.RuntimeFlagRepository;
import fi.oph.yki.repository.TaskLockRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Port of the legacy sync-participant-onr-data-handler (yki repo, src/yki/job/scheduled_tasks.clj).
 * Stores the individualisation status from ONR in participant_onr, which the CSV in OnrDebugService
 * reads. Takes the same task_lock row as the legacy job. Which of the two runs is decided by the
 * {@code participant_onr_sync.owner} runtime flag, read once in every run.
 */
@Component
@RequiredArgsConstructor
public class ParticipantOnrDataSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(ParticipantOnrDataSyncScheduledTask.class);
  private static final String TASK = "SYNC_ONR_PARTICIPANT_DATA_HANDLER";
  private static final String TASK_INTERVAL = "59 MINUTES";
  private static final String WORKER_ID = UUID.randomUUID().toString();
  private static final int BATCH_SIZE = 1000;
  private static final long PAUSE_BETWEEN_BATCHES_MILLIS = 10_000;

  private final TaskLockRepository taskLockRepository;
  private final ParticipantOnrRepository participantOnrRepository;
  private final OnrService onrService;
  private final RuntimeFlagRepository runtimeFlagRepository;

  @Scheduled(fixedRate = 3600, initialDelay = 60, timeUnit = TimeUnit.SECONDS)
  public void syncParticipantOnrData() {
    try {
      if (!ownsSync() || taskLockRepository.tryToAcquireLock(TASK, WORKER_ID, TASK_INTERVAL) == 0) {
        return;
      }

      final List<ParticipantOnrCheckProjection> participants = participantOnrRepository.findParticipantsForOnrCheck();

      LOG.info("Participant ONR data sync found {} registration(s) to check", participants.size());

      for (int start = 0; start < participants.size(); start += BATCH_SIZE) {
        syncBatch(participants.subList(start, Math.min(start + BATCH_SIZE, participants.size())));

        // Wait 10 seconds between calls to ONR just to play it safe.
        Thread.sleep(PAUSE_BETWEEN_BATCHES_MILLIS);
      }
    } catch (final Exception e) {
      LOG.error("Participant ONR data sync failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  // Unlike the registration queue, no share lock is needed: the task_lock row already keeps the two
  // backends from running at the same time, also when the owner changes during a run that is
  // shorter than TASK_INTERVAL.
  private boolean ownsSync() {
    final String owner = runtimeFlagRepository
      .findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)
      .map(RuntimeFlag::getValue)
      .orElse(RuntimeFlag.OWNER_LEGACY);
    if (RuntimeFlag.OWNER_JAVA.equals(owner)) {
      return true;
    }

    if (RuntimeFlag.OWNER_LEGACY.equals(owner)) {
      return false;
    }

    throw new RuntimeException(
      String.format(
        "Unrecognised %s '%s', so neither backend syncs participant ONR data [ERROR_SCHEDULED_TASK]",
        RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER,
        owner
      )
    );
  }

  private void syncBatch(final List<ParticipantOnrCheckProjection> participants) {
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
      return;
    }

    final Map<String, ParticipantOnr> existing = participantOnrRepository
      .findAllById(onrPersons.values().stream().map(PersonalDataDTO::getOidHenkilo).toList())
      .stream()
      .collect(Collectors.toMap(ParticipantOnr::getOid, Function.identity()));

    for (final PersonalDataDTO person : onrPersons.values()) {
      final String oid = person.getOidHenkilo();
      ParticipantOnr participantOnr = existing.get(oid);
      if (participantOnr == null) {
        participantOnr = new ParticipantOnr();
        participantOnr.setOid(oid);
        participantOnr.setParticipantId(oidToParticipantId.get(oid));
      }
      participantOnr.setOppijanumero(person.getOppijanumero());

      participantOnr.setIndividualised(
        Boolean.TRUE.equals(person.getIndividualised()) ? Boolean.TRUE : person.getIndividualisedVtj()
      );
      participantOnr.setModifiedAt(LocalDateTime.now());

      participantOnrRepository.save(participantOnr);
    }
  }
}
