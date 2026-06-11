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
        CASE WHEN r.kind = 'QUEUE' THEN
          ROW_NUMBER() OVER (
            PARTITION BY r.exam_session_id, CASE WHEN r.kind = 'QUEUE' THEN 1 ELSE 0 END
            ORDER BY r.created
          )
        ELSE NULL END AS queuePosition
      FROM registration r
      WHERE r.exam_session_id = :examSessionId
        AND r.state::text IN (:states)
    """,
    nativeQuery = true
  )
  List<RegistrationWithQueuePositionProjection> getQueuePositionsByExamSessionAndStateIn(
    @Param("examSessionId") long examSessionId,
    @Param("states") List<String> states
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
