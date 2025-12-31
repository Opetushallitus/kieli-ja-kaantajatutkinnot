package fi.oph.yki.repository;

import fi.oph.yki.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends JpaRepository<Person, String> {
  Person getByOid(final String oid);
}
