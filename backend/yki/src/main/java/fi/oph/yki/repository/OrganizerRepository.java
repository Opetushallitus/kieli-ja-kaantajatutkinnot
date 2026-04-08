package fi.oph.yki.repository;

import fi.oph.yki.model.Organizer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, Long> {
  Optional<Organizer> findByOidAndDeletedAtIsNull(String oid);
}
