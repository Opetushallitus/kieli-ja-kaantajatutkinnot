package fi.oph.yki.repository;

import fi.oph.yki.model.QuarantineReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface QuarantineReviewRepository extends JpaRepository<QuarantineReview, Long> {
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
