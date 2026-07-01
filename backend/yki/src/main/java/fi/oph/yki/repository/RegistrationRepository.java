package fi.oph.yki.repository;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
  List<Registration> getByPersonOid(String personOid);
  List<Registration> getByExamSessionAndStateIn(ExamSession examSession, List<RegistrationState> states);

  @Query(
    value = """
      SELECT r.id AS id,
          ROW_NUMBER() OVER (
            ORDER BY r.created
          ) AS queuePosition
      FROM registration r
      WHERE r.exam_session_id = :examSessionId
        AND r.state = 'SUBMITTED'
      ORDER BY r.created
    """,
    nativeQuery = true
  )
  List<RegistrationWithQueuePositionProjection> getQueuePositionsByExamSession(
    @Param("examSessionId") long examSessionId
  );

  int countByPersonOid(String personOid);

  @Query(
    "SELECT r FROM Registration r WHERE r.person.oid = ?1" +
    " AND r.state = 'COMPLETED'" +
    " AND r.examSession.examDate.examDate = ?2" +
    " AND r.examSession.language = ?3" +
    " AND r.examSession.level = ?4"
  )
  Optional<Registration> getByOidAndExamDetails(
    final String oid,
    final LocalDate examDate,
    final String language,
    final String level
  );

  @Query(
    nativeQuery = true,
    value = """
      SELECT
        o.oid                  AS organizerOid,
        ed.exam_date           AS examDate,
        es.language_code       AS languageCode,
        es.level_code          AS levelCode,
        CAST(r.state AS text)  AS state,
        esl.post_office        AS municipality,
        es.max_participants    AS maxParticipants
      FROM registration r
      INNER JOIN exam_session es           ON r.exam_session_id = es.id
      INNER JOIN exam_date ed              ON es.exam_date_id   = ed.id
      INNER JOIN organizer o               ON es.organizer_id   = o.id
      LEFT  JOIN exam_session_location esl ON esl.exam_session_id = es.id AND esl.lang = 'fi'
      WHERE ed.exam_date >= :from
        AND ed.exam_date <= :to
        AND es.language_code      IN (:languageCodes)
        AND es.level_code         IN (:levelCodes)
        AND CAST(r.state AS text) IN (:stateCodes)
        AND (:municipality IS NULL
             OR LOWER(esl.post_office) LIKE '%' || LOWER(:municipality) || '%')
      ORDER BY ed.exam_date, o.oid, es.language_code, es.level_code, r.id
      """
  )
  List<StatisticsProjection> findStatisticsRows(
    @Param("from") LocalDate from,
    @Param("to") LocalDate to,
    @Param("languageCodes") List<String> languageCodes,
    @Param("levelCodes") List<String> levelCodes,
    @Param("stateCodes") List<String> stateCodes,
    @Param("municipality") String municipality
  );

  @Modifying
  @Transactional
  @Query(
    value = """
UPDATE registration r SET
    state =
        CASE WHEN state = 'COMPLETED'::registration_state THEN 'PAID_AND_CANCELLED'::registration_state
             ELSE 'CANCELLED'::registration_state
        END
WHERE r.id = :registrationId
  AND r.state NOT IN ('CANCELLED', 'PAID_AND_CANCELLED')
  AND now() < (
      SELECT ed.exam_date FROM exam_date ed
      INNER JOIN exam_session es ON ed.id = es.exam_date_id
      WHERE es.id = r.exam_session_id)
""",
    nativeQuery = true
  )
  void cancel(@Param("registrationId") Long registrationId);
}
