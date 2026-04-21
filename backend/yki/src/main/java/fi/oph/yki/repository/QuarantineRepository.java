package fi.oph.yki.repository;

import fi.oph.yki.model.Quarantine;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QuarantineRepository extends JpaRepository<Quarantine, Long> {
  // Original endpoint uses: select-quarantine-matches
  // Technically, this method could belong into RegistrationRepository, but this is used only in the quarantine-specific domain context.
  /**
   *  Find registrations for the same exam language and quarantine period whose identity matches the quarantine entry by SSN or birthdate, unless that exact quarantine-registration pair
   *   has already been reviewed after the quarantine was last changed.
   */
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
    r.form->>'first_name'   AS formFirstName,
    r.form->>'last_name'    AS formLastName,
    r.form->>'birthdate'    AS formBirthdate,
    r.form->>'ssn'          AS formSsn,
    r.form->>'email'        AS formEmail,
    r.form->>'phone_number' AS formPhoneNumber,
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
}
