package fi.oph.yki.repository;

import fi.oph.yki.model.Identity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdentityRepository extends JpaRepository<Identity, Long> {
  Optional<Identity> findById(long id);
}
