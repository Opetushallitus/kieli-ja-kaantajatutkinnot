package fi.oph.yki.scheduled;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.solki.SolkiService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Java port of the Clojure EXAM_SESSION_SOLKI_SYNC_HANDLER: a backstop that finds upcoming
 * exam sessions never synced to SOLKI (lastSyncAt IS NULL) and syncs their organizer + exam
 * date + exam session. Currently the only sync trigger for exam sessions - there is no
 * immediate on-create trigger yet (see the SOLKI migration plan for why), so this runs
 * hourly, matching Clojure's own interval.
 */
@Component
@RequiredArgsConstructor
public class ExamSessionSolkiSyncScheduledTask {

  private static final Logger LOG = LoggerFactory.getLogger(ExamSessionSolkiSyncScheduledTask.class);
  private static final String LOCK_AT_LEAST = "PT10S";
  private static final String LOCK_AT_MOST = "PT30M";

  private final ExamSessionRepository examSessionRepository;
  private final SolkiService solkiService;

  @Scheduled(fixedRate = 3600, timeUnit = TimeUnit.SECONDS)
  @SchedulerLock(name = "examSessionSolkiSyncHandler", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncExamSessions() {
    try {
      final List<ExamSession> unsyncedSessions = examSessionRepository.findUnsyncedExamSessions(LocalDate.now());

      LOG.info("Exam session Solki sync handler found {} unsynced exam session(s)", unsyncedSessions.size());

      unsyncedSessions.forEach(this::syncExamSession);
    } catch (final Exception e) {
      LOG.error("Exam session Solki sync handler failed [ERROR_SCHEDULED_TASK]", e);
    }
  }

  private void syncExamSession(final ExamSession examSession) {
    try {
      solkiService.syncOrganizer(examSession.getOrganizer(), examSession.getOfficeOid());
      solkiService.syncExamSession(examSession);
      examSession.setLastSyncAt(LocalDateTime.now());
      examSessionRepository.save(examSession);
    } catch (final Exception e) {
      LOG.error("Failed to sync exam session {} to SOLKI", examSession.getId(), e);
    }
  }
}
