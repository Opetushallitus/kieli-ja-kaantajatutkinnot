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
}
