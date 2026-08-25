package fi.oph.yki.solki;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ParticipantSyncStatus;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.ParticipantSyncStatusRepository;
import fi.oph.yki.util.exception.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Java port of yki_register_debug.clj / the /solki/connection endpoint in debug.clj - manual
 * ops tools for environments where SOLKI itself isn't reachable (untuva, local) or when a
 * sync needs to be forced outside its normal schedule. These bypass the enabled flags on
 * purpose (that's the point of a manual "force it now" tool), unlike every other SolkiService
 * entry point.
 */
@Service
@RequiredArgsConstructor
public class SolkiDebugService {

  private static final Logger LOG = LoggerFactory.getLogger(SolkiDebugService.class);

  private final ExamSessionRepository examSessionRepository;
  private final ParticipantSyncStatusRepository participantSyncStatusRepository;
  private final SolkiService solkiService;

  public int checkConnection() {
    return solkiService.checkConnection();
  }

  public String exportParticipantsCsv(final long examSessionId) {
    return solkiService.buildParticipantsCsv(getExamSessionOrThrow(examSessionId));
  }

  public void forceSyncExamSession(final long examSessionId) {
    solkiService.forceSyncExamSessionAndOrganizer(getExamSessionOrThrow(examSessionId));
  }

  public void forceSyncParticipants(final long examSessionId) {
    final ExamSession examSession = getExamSessionOrThrow(examSessionId);

    final ParticipantSyncStatus status = new ParticipantSyncStatus();
    status.setExamSession(examSession);
    participantSyncStatusRepository.save(status);

    try {
      solkiService.forceSyncExamSessionParticipants(examSession);
      participantSyncStatusRepository.markSuccess(examSession);
    } catch (final RuntimeException e) {
      LOG.error("Manually forced participant sync failed for exam session {}", examSessionId, e);
      participantSyncStatusRepository.markFailed(examSession);
      throw e;
    }
  }

  private ExamSession getExamSessionOrThrow(final long examSessionId) {
    return examSessionRepository
      .findByIdInWithOrganizerAndExamDate(List.of(examSessionId))
      .stream()
      .findFirst()
      .orElseThrow(() -> new NotFoundException("Exam session not found: " + examSessionId));
  }
}
