package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamSessionRepository extends BaseRepository<ExamSession> {
  List<ExamSession> getByLanguageAndLevel(String language, String level);

  @Query(
    "SELECT DISTINCT es FROM ExamSession es" +
    " JOIN FETCH es.examDate examDate" +
    " LEFT JOIN FETCH es.locations" +
    " WHERE es.language = :language AND es.level = :level AND examDate.examDate >= :today"
  )
  List<ExamSession> findUpcomingByLanguageAndLevelWithDateAndLocations(
    @Param("language") String language,
    @Param("level") String level,
    @Param("today") LocalDate today
  );

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
   * An exam session is due for a participants CSV sync when either: (a) its exam date is
   * still more than a week out (minus the retry duration) and registration has opened -
   * re-synced every run regardless of past success, so SOLKI's participant list stays fresh
   * throughout registration; (b) it's within retryDurationDays of registration_end_date and
   * the last sync attempt failed; or (c) one of its participants was relocated from/to it
   * within the last day (registration already closed). Also requires at least one COMPLETED
   * registration and that the exam session itself has already been synced to SOLKI
   * (lastSyncAt IS NOT NULL).
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
    "SELECT DISTINCT es FROM ExamSession es" +
    " LEFT JOIN FETCH es.examDate" +
    " LEFT JOIN FETCH es.organizer o" +
    " LEFT JOIN FETCH o.languages" +
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

  /**
   * Front page exam session list. Registrations are counted in one pass per exam session; the
   * registration kinds follow the database function select_registration_kind, which the
   * participant_limit_trigger uses to check the participant limits on insert.
   */
  @Query(
    nativeQuery = true,
    value = """
      SELECT
        es.id                                   AS id,
        es.language_code                        AS languageCode,
        es.level_code                           AS levelCode,
        ed.exam_date                            AS sessionDate,
        es.max_participants                     AS maxParticipants,
        es.max_participants_read_listen         AS maxParticipantsReadListen,
        es.max_participants_speak_write         AS maxParticipantsSpeakWrite,
        es.start_time                           AS startTime,
        es.start_time_read_listen               AS startTimeReadListen,
        es.start_time_speak_write               AS startTimeSpeakWrite,
        ed.registration_start_date              AS registrationStartDate,
        ed.registration_end_date                AS registrationEndDate,
        es.office_oid                           AS officeOid,
        to_char(es.published_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS publishedAt,
        CAST(es.type AS TEXT)                   AS type,
        counts.queue                            AS queue,
        counts.participants                     AS participants,
        counts.participants_read_listen         AS participantsReadListen,
        counts.participants_speak_write         AS participantsSpeakWrite,
        o.oid                                   AS organizerOid,
        CAST((SELECT json_agg(locations)
              FROM (SELECT name, street_address, post_office, zip, other_location_info, extra_information, lang
                    FROM exam_session_location
                    WHERE exam_session_id = es.id) locations) AS TEXT) AS location,
        within_dt_range(now(), ed.registration_start_date, ed.registration_end_date) AS open,
        (now() AT TIME ZONE 'Europe/Helsinki' <
          (date_trunc('day', ed.registration_end_date AT TIME ZONE 'Europe/Helsinki') + time '16:00')) AS upcomingAdmission,
        kind.all_parts                          AS allPartsRegistrationKind,
        kind.read_listen                        AS readListenRegistrationKind,
        kind.speak_write                        AS speakWriteRegistrationKind
      FROM exam_session es
      INNER JOIN organizer o ON es.organizer_id = o.id
      INNER JOIN exam_date ed ON es.exam_date_id = ed.id
      CROSS JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE r.kind = 'QUEUE')                             AS queue,
          COUNT(*) FILTER (WHERE r.kind = 'ADMISSION')                         AS participants,
          COUNT(*) FILTER (WHERE r.kind = 'QUEUE' AND read_listen.matches)     AS queue_read_listen,
          COUNT(*) FILTER (WHERE r.kind = 'ADMISSION' AND read_listen.matches) AS participants_read_listen,
          COUNT(*) FILTER (WHERE r.kind = 'QUEUE' AND speak_write.matches)     AS queue_speak_write,
          COUNT(*) FILTER (WHERE r.kind = 'ADMISSION' AND speak_write.matches) AS participants_speak_write
        FROM registration r
        CROSS JOIN LATERAL (
          SELECT (es.type = 'READ_SPEAK' AND r.partial_exam_type IN ('ALL_PARTS', 'READ'))
              OR (es.type = 'LISTEN_WRITE' AND r.partial_exam_type IN ('ALL_PARTS', 'LISTEN')) AS matches
        ) read_listen
        CROSS JOIN LATERAL (
          SELECT (es.type = 'READ_SPEAK' AND r.partial_exam_type IN ('ALL_PARTS', 'SPEAK'))
              OR (es.type = 'LISTEN_WRITE' AND r.partial_exam_type IN ('ALL_PARTS', 'WRITE')) AS matches
        ) speak_write
        WHERE r.exam_session_id = es.id
          AND ((r.kind = 'QUEUE' AND r.state IN ('SUBMITTED', 'STARTED'))
            OR (r.kind = 'ADMISSION' AND r.state IN ('COMPLETED', 'SUBMITTED', 'STARTED')))
      ) counts
      CROSS JOIN LATERAL (
        SELECT
          (counts.queue > 0 OR counts.participants >= es.max_participants) AS session_full,
          (counts.queue_read_listen > 0
            OR counts.participants_read_listen >= es.max_participants_read_listen) AS read_listen_full,
          (counts.queue_speak_write > 0
            OR counts.participants_speak_write >= es.max_participants_speak_write) AS speak_write_full
      ) pool
      CROSS JOIN LATERAL (
        SELECT
          CASE WHEN (CASE WHEN es.type = 'FULL' THEN pool.session_full
                          ELSE pool.read_listen_full OR pool.speak_write_full END)
               THEN 'QUEUE' ELSE 'ADMISSION' END                        AS all_parts,
          CASE WHEN pool.read_listen_full THEN 'QUEUE' ELSE 'ADMISSION' END AS read_listen,
          CASE WHEN pool.speak_write_full THEN 'QUEUE' ELSE 'ADMISSION' END AS speak_write
      ) kind
      WHERE ed.exam_date >= :from
      ORDER BY ed.exam_date ASC, es.id ASC
      """
  )
  List<PublicExamSessionProjection> findPublicExamSessions(@Param("from") LocalDate from);
}
