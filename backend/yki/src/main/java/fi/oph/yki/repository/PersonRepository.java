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

  // Persons with a registration who were never checked, or who are not individualised and were
  // checked more than a day ago. A person whom a clerk individualises in ONR leaves the list within
  // a day. Unlike the legacy sync (yki resources/yki/debug.sql:19-32), there is no wait after the
  // registration and no cut-off date, and a person checked without a status is checked again.
  @Query(
    value = """
SELECT p.oid AS personOid
FROM person p
WHERE EXISTS (SELECT 1 FROM registration r WHERE r.person_oid = p.oid)
  AND (
    p.onr_last_sync_at IS NULL
    OR (p.is_individualized IS NOT TRUE AND CURRENT_TIMESTAMP > p.onr_last_sync_at + INTERVAL '1 day')
  )
""",
    nativeQuery = true
  )
  List<PersonOnrCheckProjection> findPersonsForOnrCheck();

  // Writes only the ONR columns, like the legacy upsert of participant_onr.
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
    p.is_individualized as individualised,

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
    AND (
        :onlyNotIndividualised = false
        OR (
            p.is_individualized IS NOT TRUE
            AND EXISTS (SELECT 1 FROM registration r3 WHERE r3.person_oid = p.oid)
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
    AND (
        :onlyNotIndividualised = false
        OR (
            p.is_individualized IS NOT TRUE
            AND EXISTS (SELECT 1 FROM registration r3 WHERE r3.person_oid = p.oid)
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
    @Param("levelCode") String levelCode,
    @Param("onlyNotIndividualised") boolean onlyNotIndividualised
  );
}
