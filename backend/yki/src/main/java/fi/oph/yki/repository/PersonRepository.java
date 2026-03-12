package fi.oph.yki.repository;

import fi.oph.yki.model.Person;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {
  Person getByOid(final String oid);

  Optional<Person> findByOid(String oid);

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
