package fi.oph.vkt.repository;

import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.Person;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends BaseRepository<Person> {
  Optional<Person> findByOid(final String oid);
  Optional<Person> findByOtherIdentifier(final String otherIdentifier);
  List<Person> findByOidIsNullAndDeletedAtIsNull();
  Person getByOid(final String oid);

  @Query(
    "SELECT p" +
    " FROM Person p" +
    " WHERE p.latestIdentifiedAt < ?1" +
    " AND NOT EXISTS (SELECT 1 FROM Enrollment e WHERE e.person = p)" +
    " AND NOT EXISTS (SELECT 1 FROM EnrollmentAppointment ea WHERE ea.person = p)" +
    " AND NOT EXISTS (SELECT 1 FROM Reservation r WHERE r.person = p)"
  )
  List<Person> findObsoletePersons(final LocalDateTime latestIdentifiedBefore);

  @Query(
    "SELECT p.oid" +
    " FROM Person p" +
    " WHERE p.latestSyncAt < ?1" +
    " AND p.deletedAt IS NULL" +
    " AND p.oid IS NOT NULL" +
    " ORDER BY p.latestSyncAt ASC"
  )
  List<String> findPersonsToSync(LocalDateTime latestSyncedBefore);

  @Query("SELECT true" + " FROM EnrollmentAppointment ea " + " WHERE ea.person = ?1 AND ea.examiner = ?2")
  boolean existsForExaminer(final Person person, final Examiner examiner);
}
