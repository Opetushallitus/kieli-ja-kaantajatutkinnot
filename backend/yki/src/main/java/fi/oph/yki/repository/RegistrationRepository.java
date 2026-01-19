package fi.oph.yki.repository;

import fi.oph.yki.model.Registration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
  List<Registration> getByPersonOid(String personOid);

  int countByPersonOid(String personOid);
}
