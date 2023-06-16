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
    " WHERE p.latestIdentifiedAt < ?1" +
    " AND NOT EXISTS (SELECT 1 FROM Enrollment e WHERE e.person = p)" +
    " AND NOT EXISTS (SELECT 1 FROM Reservation r WHERE r.person = p)"
  )
  List<Person> findObsoletePersons(final LocalDateTime latestIdentifiedBefore);
}
