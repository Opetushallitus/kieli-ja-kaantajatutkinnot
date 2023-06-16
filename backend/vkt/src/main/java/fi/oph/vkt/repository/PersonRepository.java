package fi.oph.vkt.repository;

import fi.oph.vkt.model.Person;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends BaseRepository<Person> {
  Optional<Person> findByIdentityNumber(final String identityNumber);
  Optional<Person> findByOtherIdentifier(final String otherIdentifier);

  @Query(
    "SELECT p" +
    " FROM Person p" +
    " LEFT JOIN p.enrollments e" +
    " LEFT JOIN p.reservations r" +
    " WHERE p.latestIdentifiedAt < ?1" +
    " GROUP BY p" +
    " HAVING COUNT(e) = 0 AND COUNT(r) = 0"
  )
  List<Person> findObsoletePersons(final LocalDateTime latestIdentifiedBefore);
}
