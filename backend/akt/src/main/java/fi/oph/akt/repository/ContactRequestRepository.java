package fi.oph.akt.repository;

import fi.oph.akt.model.ContactRequest;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
  @Query("SELECT cr FROM ContactRequest cr WHERE cr.createdAt < ?1")
  List<ContactRequest> findObsoleteContactRequests(LocalDateTime createdBefore);
}
