package fi.oph.yki.repository;

import fi.oph.yki.model.ParticipantOnr;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantOnrRepository extends JpaRepository<ParticipantOnr, String> {
  @Query(
    value = """
SELECT p.id AS participantId, r.person_oid AS personOid
FROM registration r
INNER JOIN participant p ON r.participant_id = p.id
LEFT JOIN participant_onr onr ON onr.oid = r.person_oid
WHERE r.person_oid IS NOT NULL
  AND (
    (onr.oid IS NULL AND CURRENT_TIMESTAMP > r.created + INTERVAL '1 hour')
    OR (
      onr.oid IS NOT NULL
      AND onr.is_individualized = false
      AND CURRENT_TIMESTAMP > onr.modified + INTERVAL '1 day'
      AND r.created >= DATE '2024-10-01'
    )
  )
""",
    nativeQuery = true
  )
  List<ParticipantOnrCheckProjection> findParticipantsForOnrCheck();

  @Query(
    value = """
SELECT
  onr.oid AS oid,
  onr.participant_id AS participantId,
  onr.is_individualized AS individualised,
  CAST(onr.modified AS timestamp) AS modified,
  last_exam_session.exam_date AS examDate,
  re.state AS evaluationState
FROM participant_onr onr
LEFT JOIN (
  SELECT DISTINCT ON (r.participant_id)
    r.participant_id,
    r.id AS registration_id,
    ed.exam_date
  FROM registration r
  JOIN exam_session es ON es.id = r.exam_session_id
  JOIN exam_date ed ON ed.id = es.exam_date_id
  ORDER BY r.participant_id, ed.exam_date DESC, r.id DESC
) last_exam_session ON last_exam_session.participant_id = onr.participant_id
LEFT JOIN registration_evaluation re ON re.registration_id = last_exam_session.registration_id
WHERE onr.is_individualized = false
""",
    nativeQuery = true
  )
  List<ParticipantOnrCsvProjection> findNotIndividualised();
}
