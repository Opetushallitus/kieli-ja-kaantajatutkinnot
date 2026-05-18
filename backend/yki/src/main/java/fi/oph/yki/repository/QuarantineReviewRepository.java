package fi.oph.yki.repository;

import fi.oph.yki.model.QuarantineReview;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface QuarantineReviewRepository extends JpaRepository<QuarantineReview, Long> {
  @Query(
    value = """
SELECT
    qr.id                       AS id,
    qr.quarantined              AS quarantined,
    qr.quarantine_id            AS quarantineId,
    qr.registration_id          AS registrationId,
    qr.updated                  AS updated,
    ed.exam_date                AS examDate,
    es.language_code            AS languageCode,
    es.level_code               AS levelCode,
    q.birthdate                 AS birthdate,
    q.ssn                       AS ssn,
    q.first_name                AS firstName,
    q.last_name                 AS lastName,
    q.email                     AS email,
    q.phone_number              AS phoneNumber,
    r.form->>'birthdate'        AS formBirthdate,
    r.form->>'first_name'       AS formFirstName,
    r.form->>'last_name'        AS formLastName,
    r.form->>'email'            AS formEmail,
    r.form->>'phone_number'     AS formPhoneNumber,
    r.state                     AS state
FROM quarantine_review qr
INNER JOIN quarantine q    ON qr.quarantine_id = q.id
INNER JOIN registration r  ON qr.registration_id = r.id
INNER JOIN exam_session es ON r.exam_session_id = es.id
INNER JOIN exam_date ed    ON es.exam_date_id = ed.id
ORDER BY qr.id DESC
""",
    nativeQuery = true
  )
  List<QuarantineReviewProjection> findAllReviews();

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
}
