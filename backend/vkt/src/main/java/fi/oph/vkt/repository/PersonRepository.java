package fi.oph.vkt.repository;

import fi.oph.vkt.model.Person;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
  Optional<Person> findByIdentityNumber(String identityNumber);
}
