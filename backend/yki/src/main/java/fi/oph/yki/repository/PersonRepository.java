package fi.oph.yki.repository;

import fi.oph.yki.model.Person;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {
  Person getByOid(final String oid);

  // The rules of the legacy participant_onr sync (yki resources/yki/debug.sql:19-32), with the ONR
  // columns on person. onr_last_sync_at IS NULL stands for a missing participant_onr row.
  // registration.person_oid has no foreign key to person, and the sync can only update a person row
  // that exists, so the join is an inner join.
  @Query(
    value = """
SELECT DISTINCT r.person_oid AS personOid
FROM registration r
INNER JOIN person p ON p.oid = r.person_oid
WHERE (p.onr_last_sync_at IS NULL AND CURRENT_TIMESTAMP > r.created + INTERVAL '1 hour')
  OR (
    p.is_individualized = false
    AND CURRENT_TIMESTAMP > p.onr_last_sync_at + INTERVAL '1 day'
    AND r.created >= DATE '2024-10-01'
  )
""",
    nativeQuery = true
  )
  List<PersonOnrCheckProjection> findPersonsForOnrCheck();

  // Writes only the ONR columns, like the legacy upsert of participant_onr. Saving the Person entity
  // would write every column, and could write back contact details that changed at the same time.
  @Modifying
  @Transactional
  @Query(
    "UPDATE Person p SET p.individualised = :individualised, p.onrLastSyncAt = CURRENT_TIMESTAMP WHERE p.oid = :oid"
  )
  void updateIndividualised(@Param("oid") String oid, @Param("individualised") Boolean individualised);

  @Query(
    value = """
      SELECT EXISTS (
        SELECT 1
        FROM registration r
        JOIN exam_session es ON r.exam_session_id = es.id
        JOIN organizer o ON es.organizer_id = o.id
        WHERE r.person_oid = :personOid AND o.oid = :organizerOid
      )
  """,
    nativeQuery = true
  )
  Boolean isPersonRelatedToOrganizer(@Param("personOid") String personOid, @Param("organizerOid") String organizerOid);

  @Query(
    value = """
SELECT
    -- Osallistujan tiedot
    p.oid,
    p.first_name as firstName,
    p.last_name as lastName,
    p.email,
    p.phone_number as phoneNumber,
    p.street_address as streetAddress,
    p.post_office as postOffice,
    p.zip,
    p.nationality_code as nationalityCode,
    p.gender,
    p.country_code as countryCode,

    -- Count of registrations for this person
    (
        SELECT COUNT(*) FROM registration r2 WHERE r2.person_oid = p.oid
    ) as registrationsCount

FROM person p
WHERE (:personQuery IS NULL OR :personQuery = '' OR
        to_tsvector('simple',
            p.oid || ' ' ||
            p.first_name || ' ' ||
            p.last_name || ' ' ||
            COALESCE(p.email, '')
        ) @@ plainto_tsquery('simple', :personQuery)
    )
    AND (
        (:organizerId IS NULL AND :examDateId IS NULL AND (:languageCode IS NULL OR :languageCode = '') AND (:levelCode IS NULL OR :levelCode = ''))
        OR EXISTS (
            SELECT 1
            FROM registration r
            JOIN exam_session es ON r.exam_session_id = es.id
            WHERE r.person_oid = p.oid
              AND (:organizerId IS NULL OR es.organizer_id = :organizerId)
              AND (:examDateId IS NULL OR es.exam_date_id = :examDateId)
              AND (:languageCode IS NULL OR :languageCode = '' OR es.language_code = :languageCode)
              AND (:levelCode IS NULL OR :levelCode = '' OR es.level_code = :levelCode)
        )
    )
ORDER BY p.created DESC, p.oid
""",
    countQuery = """
SELECT COUNT(*) FROM person p
WHERE (:personQuery IS NULL OR :personQuery = '' OR
        to_tsvector('simple',
            p.oid || ' ' ||
            p.first_name || ' ' ||
            p.last_name || ' ' ||
            COALESCE(p.email, '')
        ) @@ plainto_tsquery('simple', :personQuery)
    )
    AND (
        (:organizerId IS NULL AND :examDateId IS NULL AND (:languageCode IS NULL OR :languageCode = '') AND (:levelCode IS NULL OR :levelCode = ''))
        OR EXISTS (
            SELECT 1
            FROM registration r
            JOIN exam_session es ON r.exam_session_id = es.id
            WHERE r.person_oid = p.oid
              AND (:organizerId IS NULL OR es.organizer_id = :organizerId)
              AND (:examDateId IS NULL OR es.exam_date_id = :examDateId)
              AND (:languageCode IS NULL OR :languageCode = '' OR es.language_code = :languageCode)
              AND (:levelCode IS NULL OR :levelCode = '' OR es.level_code = :levelCode)
        )
    )
""",
    nativeQuery = true
  )
  Page<PersonSearchProjection> searchPersons(
    Pageable pageable,
    @Param("personQuery") String personQuery,
    @Param("organizerId") Long organizerId,
    @Param("examDateId") Long examDateId,
    @Param("languageCode") String languageCode,
    @Param("levelCode") String levelCode
  );
}
