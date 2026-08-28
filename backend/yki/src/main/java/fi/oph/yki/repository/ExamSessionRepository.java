package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  List<ExamSession> findByOrganizerOid_Oid(String oid);

  boolean existsByExamDateId(long examDateId);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.examDate ed" +
    " LEFT JOIN FETCH es.organizer o" +
    " LEFT JOIN FETCH o.languages" +
    " WHERE es.lastSyncAt IS NULL AND ed.examDate >= :today"
  )
  List<ExamSession> findUnsyncedExamSessions(@Param("today") LocalDate today);

  /**
   * Java port of Clojure's select-exam-sessions-to-be-synced. An exam session is due for a
   * participants CSV sync when either: (a) its exam date is still more than a week out (minus
   * the retry duration) and registration has opened - re-synced every run regardless of past
   * success, so SOLKI's participant list stays fresh throughout registration; (b) it's within
   * retryDurationDays of registration_end_date and the last sync attempt failed; or (c) one of
   * its participants was relocated from/to it within the last day (registration already
   * closed). Also requires at least one COMPLETED registration and that the exam session
   * itself has already been synced to SOLKI (lastSyncAt IS NOT NULL).
   */
  @Query(
    nativeQuery = true,
    value = """
      SELECT DISTINCT es.id
      FROM exam_session es
      INNER JOIN exam_date ed ON es.exam_date_id = ed.id
      LEFT JOIN participant_sync_status pss ON pss.exam_session_id = es.id
      WHERE (
          (
            (ed.exam_date >= (current_date + interval '1 week' - make_interval(days => :retryDurationDays))
              OR (ed.registration_end_date + make_interval(days => :retryDurationDays) >= current_date
                  AND pss.failed_at IS NOT NULL
                  AND (pss.success_at IS NULL OR pss.failed_at > pss.success_at)))
            AND ed.registration_start_date <= current_date
          )
          OR (
            pss.relocated_at IS NOT NULL
            AND pss.success_at IS NULL
            AND ed.registration_start_date < current_date
            AND (pss.relocated_at + interval '1 day') > current_date
          )
        )
        AND (SELECT COUNT(1) FROM registration re WHERE re.exam_session_id = es.id AND re.state = 'COMPLETED') > 0
        AND es.last_sync_at IS NOT NULL
      """
  )
  List<Long> findExamSessionIdsDueForParticipantSync(@Param("retryDurationDays") int retryDurationDays);

  @Query(
    "SELECT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.examDate" +
    " LEFT JOIN FETCH es.organizer" +
    " WHERE es.id IN :ids"
  )
  List<ExamSession> findByIdInWithOrganizerAndExamDate(@Param("ids") List<Long> ids);

  default List<ExamSession> findExamSessionsDueForParticipantSync(final int retryDurationDays) {
    final List<Long> ids = findExamSessionIdsDueForParticipantSync(retryDurationDays);
    return ids.isEmpty() ? List.of() : findByIdInWithOrganizerAndExamDate(ids);
  }

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.registrations r" +
    " LEFT JOIN FETCH r.freeRegistration" +
    " LEFT JOIN FETCH r.evaluation" +
    " LEFT JOIN FETCH es.examDate" +
    " WHERE es.organizer = :organizer"
  )
  List<ExamSession> findByOrganizer(final Organizer organizer);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.registrations r" +
    " LEFT JOIN FETCH r.freeRegistration" +
    " LEFT JOIN FETCH r.evaluation" +
    " LEFT JOIN FETCH es.examDate ed" +
    " WHERE es.organizer = :organizer AND ed.examDate >= :from"
  )
  List<ExamSession> findByOrganizerAndExamDateFrom(final Organizer organizer, final LocalDate from);

  @Query("SELECT DISTINCT es FROM ExamSession es" + " LEFT JOIN FETCH es.locations r" + " WHERE es IN (:examSessions)")
  List<ExamSession> findByExamSessionsWithLocation(final List<ExamSession> examSessions);
}
