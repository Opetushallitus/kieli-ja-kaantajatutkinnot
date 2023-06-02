package fi.oph.vkt.repository;

import fi.oph.vkt.model.Person;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends BaseRepository<Person> {
  Optional<Person> findByIdentityNumber(final String identityNumber);
  Optional<Person> findByOtherIdentifier(final String otherIdentifier);
}
