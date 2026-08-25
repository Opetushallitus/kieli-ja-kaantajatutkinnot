package fi.oph.yki.scheduled;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ParticipantSyncStatus;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantSyncStatusRepository;
import fi.oph.yki.solki.SolkiService;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Java port of the Clojure PARTICIPANTS_SYNC_HANDLER: finds exam sessions due for a
 * participants CSV sync (see ExamSessionRepository.findExamSessionsDueForParticipantSync)
 * and syncs each via SolkiService. Every attempt is recorded as a new participant_sync_status
 * row, matching Clojure's insert-per-attempt model - this table is also written to by
 * Clojure's still-active "relocate registration" feature, so the row-per-attempt shape must
 * be preserved rather than collapsed to one row per exam session.
 */
@Component
@RequiredArgsConstructor
public class ParticipantsSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(ParticipantsSyncScheduledTask.class);
  private static final String LOCK_AT_LEAST = "PT10S";
  private static final String LOCK_AT_MOST = "PT30M";

  private final ExamSessionRepository examSessionRepository;
  private final ParticipantSyncStatusRepository participantSyncStatusRepository;
  private final SolkiService solkiService;

  @Value("${app.solki.participant-sync-retry-days}")
  private int retryDurationInDays;

  @Scheduled(fixedRate = 3600, timeUnit = TimeUnit.SECONDS)
  @SchedulerLock(name = "participantsSyncHandler", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncParticipants() {
    try {
      final List<ExamSession> dueSessions = examSessionRepository.findExamSessionsDueForParticipantSync(
        retryDurationInDays
      );

      LOG.info("Participants sync handler found {} exam session(s) to sync", dueSessions.size());

      dueSessions.forEach(this::syncExamSessionParticipants);
    } catch (final Exception e) {
      LOG.error("Participants sync handler failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  private void syncExamSessionParticipants(final ExamSession examSession) {
    final ParticipantSyncStatus status = new ParticipantSyncStatus();
    status.setExamSession(examSession);
    participantSyncStatusRepository.save(status);

    try {
      solkiService.syncExamSessionParticipants(examSession);
      participantSyncStatusRepository.markSuccess(examSession);
    } catch (final Exception e) {
      LOG.error("Failed to synchronize participants of exam session {}", examSession.getId(), e);
      participantSyncStatusRepository.markFailed(examSession);
    }
  }
}
