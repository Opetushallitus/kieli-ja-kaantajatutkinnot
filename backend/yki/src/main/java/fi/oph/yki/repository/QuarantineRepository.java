package fi.oph.yki.repository;

import fi.oph.yki.model.Quarantine;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface QuarantineRepository extends JpaRepository<Quarantine, Long> {
  @Query(
    value = """
SELECT
    q.id                    AS quarantineId,
    q.language_code         AS quarantineLang,
    q.birthdate             AS birthdate,
    q.created               AS created,
    q.ssn                   AS ssn,
    q.first_name            AS firstName,
    q.last_name             AS lastName,
    q.email                 AS email,
    q.phone_number          AS phoneNumber,
    r.id                    AS registrationId,
    r.form::text            AS form,
    r.state                 AS state,
    r.person_oid            AS personOid,
    ed.exam_date            AS examDate,
    es.language_code        AS languageCode
FROM quarantine q
INNER JOIN registration r
    ON (q.ssn = r.form->>'ssn' OR q.birthdate = r.form->>'birthdate')
INNER JOIN exam_session es
    ON r.exam_session_id = es.id
INNER JOIN exam_date ed
    ON es.exam_date_id = ed.id
WHERE r.state IN ('SUBMITTED', 'COMPLETED')
  AND es.language_code = q.language_code
  AND NOT EXISTS (
      SELECT qr.id FROM quarantine_review qr
      WHERE qr.registration_id = r.id
        AND qr.quarantine_id = q.id
        AND q.updated <= qr.updated
  )
  AND ed.exam_date BETWEEN q.start_date AND q.end_date
  AND q.deleted_at IS NULL
ORDER BY q.id DESC, r.id
""",
    nativeQuery = true
  )
  List<QuarantineMatchProjection> findPendingMatches();

  @Transactional
  @Query(
    value = """
INSERT INTO quarantine_review (
  quarantine_id,
  registration_id,
  quarantined,
  reviewer_oid
) VALUES (
  :quarantineId,
  :registrationId,
  :quarantined,
  :reviewerOid
)
ON CONFLICT ON CONSTRAINT quarantine_review_unique_quarantine_registration_combination
DO UPDATE SET quarantined = :quarantined, reviewer_oid = :reviewerOid, updated = current_timestamp
RETURNING ID
""",
    nativeQuery = true
  )
  long upsertReview(
    @Param("quarantineId") Long quarantineId,
    @Param("registrationId") Long registrationId,
    @Param("quarantined") Boolean quarantined,
    @Param("reviewerOid") String reviewerOid
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
  void cancelForQuarantine(@Param("registrationId") Long registrationId);
}
